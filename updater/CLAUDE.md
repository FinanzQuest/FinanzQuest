# updater (Rust market-data ingestion)

Fetches prices/asset details (`yf.rs`, `alpaca.rs`, `providers.rs`) and
writes them to `api.assets` and the related tables (`uploader.rs`, sqlx).
It is the only writer of market data.

- Modes (`main.rs` `enum Mode`, clap): `daily` | `intraday` |
  `resolve-providers` | `details`. In the container they run via cron through
  `run_updater.sh <mode>` (`startup.sh` persists env to `/etc/updater.env`).
- Build/check: `cargo check -p updater` / `cargo build -p updater` from the
  repo root. Never read `target/` (≈3 GB).
- Schema changes the updater depends on belong in `dbinit/` (+ migration).
