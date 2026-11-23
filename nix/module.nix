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
# What it sets up (nothing else on the host is touched):
# - user `finanzquest`: no sudo, not in the `docker` group; runs its own
#   rootless Docker (lingering, so it starts at boot)
# - the stack lives in `stateDir`; secrets come from `environmentFile`
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

  ctl = pkgs.writeShellApplication {
    name = "finanzquest-ctl";
    runtimeInputs = [
      config.virtualisation.docker.rootless.package
      pkgs.docker-compose
      pkgs.coreutils
      pkgs.findutils
      pkgs.gnugrep
      pkgs.gnutar
      pkgs.gzip
    ];
    text = ''
      STATE_DIR=${lib.escapeShellArg cfg.stateDir}
      ENV_FILE=${lib.escapeShellArg cfg.environmentFile}
      IMAGE_PREFIX=${lib.escapeShellArg cfg.imagePrefix}
      HTTP_PORT=${toString cfg.httpPort}
      HTTPS_PORT=${toString cfg.httpsPort}
      HEALTH_TIMEOUT=${toString cfg.healthTimeout}
    ''
    + builtins.readFile ./finanzquest-ctl.sh;
  };

  lowestPort = lib.min cfg.httpPort cfg.httpsPort;
  userUnit = "user@${toString cfg.uid}.service";
in
{
  options.services.finanzquest = {
    enable = mkEnableOption "FinanzQuest (docker compose stack deployed by CI)";

    user = mkOption {
      type = types.str;
      default = "finanzquest";
      description = "Service user that owns the stack and its rootless Docker.";
    };

    uid = mkOption {
      type = types.int;
      default = 2042;
      description = "Fixed uid of the service user (its Docker socket lives in /run/user/<uid>).";
    };

    stateDir = mkOption {
      type = types.str;
      default = "/var/lib/finanzquest";
      description = "Home of the service user: deployed files, Docker data (incl. the Postgres volume).";
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
      default = true;
      description = "Open httpPort/httpsPort in the firewall.";
    };

    healthTimeout = mkOption {
      type = types.ints.positive;
      default = 300;
      description = "Seconds a deploy waits for healthy containers before rolling back.";
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

    virtualisation.docker.rootless.enable = true;

    users.groups.${cfg.user}.gid = cfg.uid;
    users.users.${cfg.user} = {
      isNormalUser = true;
      inherit (cfg) uid;
      group = cfg.user;
      description = "FinanzQuest service";
      home = cfg.stateDir;
      createHome = true;
      homeMode = "700";
      # login shell for the forced command; the key cannot get a shell
      shell = pkgs.bashInteractive;
      linger = true;
      autoSubUidGidRange = true;
      openssh.authorizedKeys.keys = map (
        key: ''restrict,command="${ctl}/bin/finanzquest-ctl" ${key}''
      ) cfg.deployKeys;
    };

    # rootless Docker binds ports as an ordinary user
    boot.kernel.sysctl."net.ipv4.ip_unprivileged_port_start" = mkIf (lowestPort < 1024) (
      lib.mkDefault lowestPort
    );

    networking.firewall = mkIf cfg.openFirewall {
      allowedTCPPorts = [
        cfg.httpPort
        cfg.httpsPort
      ];
      allowedUDPPorts = [ cfg.httpsPort ];
    };

    environment.systemPackages = [ ctl ];

    systemd.services.finanzquest = {
      description = "FinanzQuest (start the last deployed version)";
      wantedBy = [ "multi-user.target" ];
      wants = [
        "network-online.target"
        userUnit
      ];
      after = [
        "network-online.target"
        userUnit
      ];
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
  };
}
