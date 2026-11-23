# VM test for nix/module.nix:  nix build .#checks.x86_64-linux.module
#
# Boots NixOS with the module and checks that
# - the rootless daemon runs as `finanzquest` and a container can publish
#   port 80 although the host keeps net.ipv4.ip_unprivileged_port_start=1024
# - the deploy key gets no shell and no other command
# - nothing host-wide changed (no system Docker, no global docker/ctl
#   binaries, firewall untouched)
{ pkgs, module }:
let
  # offline test image: busybox httpd on :80
  web = pkgs.dockerTools.buildImage {
    name = "fq-test-web";
    tag = "latest";
    copyToRoot = [ pkgs.pkgsStatic.busybox ];
    extraCommands = "mkdir -p www && echo finanzquest-ok > www/index.html";
    config.Cmd = [ "/bin/httpd" "-f" "-p" "80" "-h" "/www" ];
  };
  keys = pkgs.runCommand "fq-test-keys" { nativeBuildInputs = [ pkgs.openssh ]; } ''
    mkdir $out
    ssh-keygen -q -t ed25519 -N "" -C ci -f $out/id
  '';
in
pkgs.testers.runNixOSTest {
  name = "finanzquest-module";
  nodes.machine = {
    imports = [ module ];
    virtualisation.memorySize = 2048;
    virtualisation.diskSize = 4096;
    services.openssh.enable = true;
    environment.etc."finanzquest-env".text = "JWT_SECRET=test\n";
    services.finanzquest = {
      enable = true;
      environmentFile = "/etc/finanzquest-env";
      deployKeys = [ (builtins.readFile "${keys}/id.pub") ];
    };
    users.users.tester.isNormalUser = true;
  };

  testScript = ''
    machine.wait_for_unit("finanzquest-docker.service")
    machine.wait_for_unit("finanzquest.service")
    machine.wait_for_unit("sshd.service")

    with subtest("dedicated, unprivileged user"):
        groups = machine.succeed("id -nG finanzquest").split()
        assert groups == ["finanzquest"], groups
        machine.succeed("test \"$(stat -c %U /run/finanzquest/docker.sock)\" = finanzquest")
        machine.succeed("pgrep -u finanzquest -f dockerd")

    with subtest("nothing host-wide"):
        machine.succeed("test \"$(sysctl -n net.ipv4.ip_unprivileged_port_start)\" = 1024")
        machine.fail("test -e /run/current-system/sw/bin/docker")
        machine.fail("test -e /run/current-system/sw/bin/finanzquest-ctl")
        machine.fail("systemctl cat docker.service")
        machine.fail("test -e /run/docker.sock")

    with subtest("boot unit with nothing deployed"):
        machine.succeed("journalctl -u finanzquest.service | grep -q 'nothing deployed yet'")

    with subtest("rootless container publishes port 80"):
        machine.succeed(
            "sudo -u finanzquest env DOCKER_HOST=unix:///run/finanzquest/docker.sock "
            "${pkgs.docker}/bin/docker load -i ${web}"
        )
        machine.succeed(
            "sudo -u finanzquest env DOCKER_HOST=unix:///run/finanzquest/docker.sock "
            "${pkgs.docker}/bin/docker run -d --name web -p 80:80 fq-test-web:latest"
        )
        machine.wait_until_succeeds("curl -fs http://127.0.0.1/ | grep -q finanzquest-ok", timeout=60)

    with subtest("ctl in the service user's profile"):
        machine.succeed("sudo -iu finanzquest finanzquest-ctl boot")
        out = machine.succeed("sudo -iu finanzquest finanzquest-ctl docker ps --format '{{.Names}}'")
        assert "web" in out, out
        # admins (and other users) do not get docker or the ctl globally
        machine.fail("sudo -iu tester sh -c 'command -v finanzquest-ctl || command -v docker'")

    with subtest("deploy key is restricted to the deploy command"):
        machine.succeed("install -d -m700 -o tester /home/tester/.ssh")
        machine.succeed("install -m600 -o tester ${keys}/id /home/tester/.ssh/id")
        ssh = ("sudo -u tester ssh -i /home/tester/.ssh/id -o StrictHostKeyChecking=no "
               "-o BatchMode=yes finanzquest@localhost")
        out = machine.fail(f"{ssh} 'id; touch /tmp/pwned' 2>&1")
        assert "may only run: deploy" in out, out
        machine.fail("test -e /tmp/pwned")
        out = machine.fail(f"{ssh} 'deploy abc tester' 2>&1")
        assert "may only run: deploy" in out, out
        out = machine.fail(
            f"printf 'tok\\n' | {ssh} 'deploy {'a' * 40} tester' 2>&1"
        )
        assert "bundle" in out or "gzip" in out or "tar" in out, out
        # the key line carries `restrict` (no forwarding, pty, agent, X11)
        machine.succeed("grep -q '^restrict,command=' /etc/ssh/authorized_keys.d/finanzquest")
  '';
}
