# NixOS module: run FinanzQuest on a shared server, deployed by GitHub Actions.
#
# In the server's flake:
#   inputs.finanzquest.url = "github:FinanzQuest/FinanzQuest";
#   modules = [ inputs.finanzquest.nixosModules.default ];
#   services.finanzquest = {
#     enable = true;
#     environmentFile = "/var/lib/finanzquest-secrets/env";
#     deployKeys = [ "ssh-ed25519 AAAA... finanzquest-ci-deploy" ];
#   };
#
# Scope: only FinanzQuest's own user, services and files. It does not enable
# Docker for the host, change sysctls, add global packages or open firewall
# ports (unless openFirewall = true).
#
# - system user `finanzquest`: no sudo, not in the `docker` group
# - finanzquest-docker.service: a rootless Docker daemon for that user only
#   (socket in /run/finanzquest); may bind ports < 1024 via
#   CAP_NET_BIND_SERVICE on this one service
# - deploy keys may only run `finanzquest-ctl` (SSH forced command +
#   `restrict`: no shell, no forwarding, no pty)
# - finanzquest.service starts the last deployed version at boot
# Docs: docs/ci-cd.md
{
  config,
  lib,
  pkgs,
  ...
}:
let
  cfg = config.services.finanzquest;
  inherit (lib)
    mkEnableOption
    mkIf
    mkOption
    types
    ;

  runtimeDir = "/run/finanzquest";
  needsLowPorts = lib.min cfg.httpPort cfg.httpsPort < 1024;

  ctl = pkgs.writeShellApplication {
    name = "finanzquest-ctl";
    runtimeInputs = [
      cfg.dockerPackage
      pkgs.docker-compose
      pkgs.coreutils
      pkgs.findutils
      pkgs.gnugrep
      pkgs.gnutar
      pkgs.gzip
    ];
    text = ''
      STATE_DIR=${lib.escapeShellArg cfg.stateDir}
      RUNTIME_DIR=${lib.escapeShellArg runtimeDir}
      ENV_FILE=${lib.escapeShellArg cfg.environmentFile}
      IMAGE_PREFIX=${lib.escapeShellArg cfg.imagePrefix}
      HTTP_PORT=${toString cfg.httpPort}
      HTTPS_PORT=${toString cfg.httpsPort}
      HEALTH_TIMEOUT=${toString cfg.healthTimeout}
    ''
    + builtins.readFile ./finanzquest-ctl.sh;
  };
in
{
  options.services.finanzquest = {
    enable = mkEnableOption "FinanzQuest (docker compose stack deployed by CI)";

    user = mkOption {
      type = types.str;
      default = "finanzquest";
      description = "System user that owns the stack and its rootless Docker daemon.";
    };

    uid = mkOption {
      type = types.nullOr types.int;
      default = null;
      description = "Optional fixed uid for the service user (allocated automatically if null).";
    };

    stateDir = mkOption {
      type = types.str;
      default = "/var/lib/finanzquest";
      description = "Home of the service user: deployed files and Docker data (incl. the Postgres volume).";
    };

    environmentFile = mkOption {
      type = types.str;
      example = "/run/agenix/finanzquest-env";
      description = ''
        Production secrets in .env syntax (POSTGRES_PASSWORD, JWT_SECRET, ...,
        CADDY_HOST). Must be readable by the service user and must NOT be in
        the Nix store, so give a string path, not a Nix path literal.
      '';
    };

    deployKeys = mkOption {
      type = types.listOf types.str;
      default = [ ];
      description = "SSH public keys allowed to deploy (CI). They can only run the deploy command.";
    };

    imagePrefix = mkOption {
      type = types.str;
      default = "ghcr.io/finanzquest/finanzquest";
      description = "Image name prefix; `-frontend` / `-updater` are appended.";
    };

    httpPort = mkOption {
      type = types.port;
      default = 80;
      description = "Host port for Caddy's HTTP listener.";
    };

    httpsPort = mkOption {
      type = types.port;
      default = 443;
      description = "Host port for Caddy's HTTPS listener (TCP + UDP for HTTP/3).";
    };

    openFirewall = mkOption {
      type = types.bool;
      default = false;
      description = "Open httpPort/httpsPort in the NixOS firewall.";
    };

    healthTimeout = mkOption {
      type = types.ints.positive;
      default = 300;
      description = "Seconds a deploy waits for healthy containers before rolling back.";
    };

    dockerPackage = mkOption {
      type = types.package;
      default = pkgs.docker;
      defaultText = lib.literalExpression "pkgs.docker";
      description = "Docker package for the rootless daemon and CLI.";
    };

    package = mkOption {
      type = types.package;
      readOnly = true;
      default = ctl;
      description = "The finanzquest-ctl script (for reference).";
    };
  };

  config = mkIf cfg.enable {
    assertions = [
      {
        assertion = !lib.hasPrefix builtins.storeDir cfg.environmentFile;
        message = "services.finanzquest.environmentFile must not point into the Nix store (it holds secrets).";
      }
    ];
    warnings = lib.optional (cfg.deployKeys == [ ]) "services.finanzquest.deployKeys is empty: CI cannot deploy.";

    users.groups.${cfg.user} = { };
    users.users.${cfg.user} = {
      isSystemUser = true;
      inherit (cfg) uid;
      group = cfg.user;
      description = "FinanzQuest service";
      home = cfg.stateDir;
      createHome = true;
      homeMode = "700";
      # login shell for the forced command; the key itself cannot get a shell
      shell = pkgs.bashInteractive;
      # subordinate ids for the rootless Docker user namespace
      autoSubUidGidRange = true;
      # only in this user's profile: sudo -iu finanzquest finanzquest-ctl ...
      packages = [ ctl ];
      openssh.authorizedKeys.keys = map (
        key: ''restrict,command="${ctl}/bin/finanzquest-ctl" ${key}''
      ) cfg.deployKeys;
    };

    # Rootless Docker for this user only, as a system service (the nixpkgs
    # virtualisation.docker.rootless module would enable it for every user).
    # Settings follow that module's user unit.
    systemd.services.finanzquest-docker = {
      description = "Rootless Docker daemon for FinanzQuest";
      wantedBy = [ "multi-user.target" ];
      after = [ "network-online.target" ];
      wants = [ "network-online.target" ];
      # newuidmap / newgidmap
      path = [ "/run/wrappers" ];
      environment = config.networking.proxy.envVars // {
        HOME = cfg.stateDir;
        XDG_RUNTIME_DIR = runtimeDir;
      };
      unitConfig.StartLimitIntervalSec = 60;
      unitConfig.StartLimitBurst = 3;
      serviceConfig = {
        Type = "notify";
        NotifyAccess = "all";
        User = cfg.user;
        Group = cfg.user;
        # cgroupfs: there is no `systemd --user` session for the systemd
        # driver; Delegate=yes hands this unit's cgroup subtree to dockerd
        ExecStart = "${cfg.dockerPackage}/bin/dockerd-rootless --exec-opt native.cgroupdriver=cgroupfs";
        ExecReload = "${pkgs.procps}/bin/kill -s HUP $MAINPID";
        RuntimeDirectory = baseNameOf runtimeDir;
        RuntimeDirectoryMode = "0700";
        TimeoutSec = 0;
        Restart = "always";
        RestartSec = 2;
        LimitNOFILE = "infinity";
        LimitNPROC = "infinity";
        LimitCORE = "infinity";
        Delegate = true;
        KillMode = "mixed";
        # Caddy on 80/443 without lowering the host-wide unprivileged port
        # limit: only this service gets the capability.
        AmbientCapabilities = lib.optional needsLowPorts "CAP_NET_BIND_SERVICE";
      };
    };

    systemd.services.finanzquest = {
      description = "FinanzQuest (start the last deployed version)";
      wantedBy = [ "multi-user.target" ];
      requires = [ "finanzquest-docker.service" ];
      after = [ "finanzquest-docker.service" ];
      # a nixos-rebuild must not restart the stack; CI deploys do that
      restartIfChanged = false;
      serviceConfig = {
        Type = "oneshot";
        RemainAfterExit = true;
        User = cfg.user;
        Group = cfg.user;
        ExecStart = "${ctl}/bin/finanzquest-ctl boot";
        TimeoutStartSec = 600;
      };
    };

    networking.firewall = mkIf cfg.openFirewall {
      allowedTCPPorts = [
        cfg.httpPort
        cfg.httpsPort
      ];
      allowedUDPPorts = [ cfg.httpsPort ];
    };
  };
}
