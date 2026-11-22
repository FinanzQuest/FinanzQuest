{
  description = "A Nix-flake-based Node.js development environment";

  inputs.nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";

  outputs =
    { self, nixpkgs }:
    let
      supportedSystems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];
      forEachSupportedSystem =
        f:
        nixpkgs.lib.genAttrs supportedSystems (
          system:
          f {
            pkgs = import nixpkgs {
              inherit system;
              overlays = [ self.overlays.default ];
            };
          }
        );
    in
    {
      overlays.default = final: prev: rec {
        biome = prev.biome;
        nodejs = prev.nodejs;
        supabase-cli = prev.supabase-cli;
        yarn-berry = (prev.yarn-berry.override { inherit nodejs; });
      };

      devShells = forEachSupportedSystem (
        { pkgs }:
        {
          default = pkgs.mkShell {
            packages = with pkgs; [
              openssl
              # TypeScript 7 (native Go compiler; nixpkgs folded typescript-go
              # into this attribute); matches package.json
              typescript
              typescript-language-server
              tailwindcss-language-server
              nodejs
              pnpm
              yarn-berry
              supabase-cli
              biome
              postgresql
            ];
          };
        }
      );
    };
}
