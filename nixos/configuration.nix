{ config, pkgs, ... }:
{
  imports = [
    ./nixos/auto-upgrade.nix
    ./nixos/home-manager.nix
    ./nixos/network-manager.nix
    ./nixos/nix.nix
    ./nixos/systemd-boot.nix
    ./nixos/timezone.nix
    ./nixos/users.nix
    ./nixos/utils.nix
    ./nixos/ssh.nix
    ./nixos/variables-config.nix
    ./hardware-configuration.nix
    ./nixos/docker.nix
    ./variables.nix
  ];

  systemd.services.finanzquest = {
    description = "FinanzQuest";
    after = [ "docker.service" "network.target" ];
    requires = [ "docker.service" ];
    wantedBy = [ "multi-user.target" ];
    serviceConfig = {
      Type = "oneshot";
      RemainAfterExit = true;
      WorkingDirectory = "/home/admin/FinanzQuest";
      ExecStart = "${pkgs.docker}/bin/docker compose up -d";
      ExecStop = "${pkgs.docker}/bin/docker compose down";
    };
  };

  # configuration.nix
  environment.systemPackages = with pkgs; [
    openssl
  ];

  home-manager.users."${config.var.username}" = import ./home.nix;
  home-manager.backupFileExtension = "backup";
  # Don't touch this
  system.stateVersion = "25.05";
}
