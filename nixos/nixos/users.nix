{ config, pkgs, ... }:
let username = config.var.username;
in {
  users = {
    users.${username} = {
      isNormalUser = true;
      description = "${username} account";
      extraGroups = [ "wheel" "docker" ];
      # GitHub Actions deploy key (.github/workflows/ci-cd.yml, docs/ci-cd.md).
      # Adds to ~/.ssh/authorized_keys, does not replace it. Private half is
      # the DEPLOY_SSH_KEY repo secret; rotate both together.
      openssh.authorizedKeys.keys = [
        "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIE6q6HJ95IhtkrQiCqmYG4pYCUMwrr0lP4O6MkqX5nLJ finanzquest-ci-deploy"
      ];
      initialPassword = "changeme";
    };
  };
}
