# Intraday pricing

Status: implemented on branch `intraday-prices` (based on `db-refactor`).

## Goal

Prices, trades and depot values move during the trading day instead of once
per night. A trade executes at the latest 15-minute price, the dashboard shows
today's value curve, and the stock page shows an intraday chart.

## Data sources (unchanged providers)

The updater keeps using the two APIs it already calls:

| Provider | Assets | Intraday request |
|---|---|---|
| Alpaca market data v2 (`/v2/stocks/bars`, IEX feed) | US stocks/ETFs | `timeframe=15Min`, `start` = start of the window |
| Yahoo Finance chart API (`/v8/finance/chart/{symbol}`) | symbols with `.`/`-`, funds | `interval=15m`, `period1/period2` = window |

The nightly run (`--mode daily`, cron 01:00 UTC) stays as it is: adjusted daily
bars into `api.asset_prices`. A new run mode `--mode intraday` (cron every
15 minutes, Mon–Fri 07:00–21:45 UTC, covering EU and US sessions) fetches the
last two days of 15-minute bars.

## Database

```
updater ──15m bars──▶ api.asset_prices_intraday  (hypertable, 1-day chunks, 30-day retention)
                         │ row trigger                 │ api.rollup_intraday(from)
                         ▼                             ▼
                      api.latest_prices ◀─trigger── api.asset_prices (daily; today = partial bar)
                         │
                         ├─▶ depots.current_values ─▶ values / aggregated_values / leaderboard
                         ├─▶ buy_asset / sell_asset / execute_savings_plans (trade price)
                         └─▶ get_position_profits
api.asset_prices_intraday + ledger ─▶ depots.get_intraday_values(depot)  (today's curve)
```

- **`api.asset_prices_intraday`** `(asset_id, tstamp timestamptz, open, high,
  low, close, volume)`. PK `(asset_id, tstamp)`. Retention policy 30 days:
  older intraday detail is not needed, the daily table keeps history.
- **`api.latest_prices`** becomes `(asset_id, tstamp timestamptz, close)`: the
  newest quote from either table. A daily row counts as of the end of its day
  (capped at `now()`), so the official nightly close of day D outranks the
  15-minute bars of day D, and the next day's bars outrank it again.
- **`api.rollup_intraday(p_from date)`** upserts the partial daily bar
  (first open, max high, min low, last close, summed volume) for every day
  ≥ `p_from` into `api.asset_prices`. The intraday run calls it after each
  upload, so the daily chart and the "today" change have a current candle.
  The nightly run later overwrites it with the provider's adjusted daily bar.
- **`depots.get_intraday_values(p_depot_id, p_since)`** returns the depot's
  value at every 15-minute bar time since `p_since` (default: start of today)
  plus a final point at `now()`, which equals `depots.current_values`.
  Positions at each point come from the ledger (trades during the day are
  placed correctly), prices are carried forward from the last bar or the
  previous close. Totals only, SECURITY DEFINER like the public depot totals.
- Closed days are unchanged: `depots.daily_values` keeps one value per closed
  day from daily closes; the hourly job re-values the last 7 days, which also
  picks up the nightly adjusted close replacing the rolled-up one.

No change for buy/sell signatures: they already read `api.latest_prices`.

## Frontend

- **Stock page**: chart gets "1T" and "5T" ranges from
  `api.asset_prices_intraday`; the header price and change use the latest
  quote and the previous daily close; shows the quote time. The page
  re-renders every minute (`revalidate` / client refresh).
- **Dashboard**: the value chart gets a "Heute" range from
  `get_intraday_values`; the header shows the time of the last price. A small
  client component refreshes the server data every 60 s while the tab is
  visible.
- Types regenerated from the schema.

## Tests

- `dbinit/tests/intraday.sql`: intraday bars move `latest_prices` and the live
  depot value; rollup builds the daily candle; nightly close outranks the same
  day's bars; `get_intraday_values` places a mid-day trade at the right point
  and its last point equals `current_values`; trades execute at the newest bar.
- `verify_schema.sql` covers the new objects, the trigger and the retention
  policy.
- Updater: `cargo build` / `cargo test` for URL and parameter construction.
- Frontend: `tsc` (no new errors over the baseline) and `biome`.

## Migration

`dbinit/migrations/2026-11-24_intraday_prices.sql` (after the two earlier
migrations), then deploy the updater image with the new cron entries.
