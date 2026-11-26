# Tutorial rebuild — Duolingo-style learning path (plan)

Decided with the user (2026-11-26). German UI, grade 9; later branches may be more advanced.

## Product
- `/tutorial` = skill-tree overview: trunk `grundlagen`, then branches. Strict locking:
  lessons unlock sequentially within a path; a path unlocks when its `requires` paths are fully done.
- Lesson = content cards + micro-exercises (mc, true_false, slider estimate, order, match),
  instant feedback + explanation, wrong exercises re-queued once, completion screen.
- Gamification: XP, daily streak (Europe/Berlin), mastery 0–3, **virtual** cash reward credited to the
  active depot on first completion. No hearts.
- Progress in DB (schema `users`). Teachers (users.special_role 'teacher') may read all progress
  (no class relation exists); all read policies go through `users.can_view_learner(uuid)`.

## Paths (ids are stable slugs `<path>.<lesson>`)
- `grundlagen` (trunk): `warum-vorsorgen` (old slides 01+02), `rendite-zinseszins` (03,04,05),
  `risiko-streuung` (06,07,08), `etf-sparplan` (09,10), `checkpoint` (11 + new questions, min_score 0.7)
- `aktien` (requires grundlagen): `unternehmen-bewerten` (Marktkapitalisierung, Umsatz, Umsatzwachstum,
  Gewinnmarge), `kgv-kbv-dividende`, `risiko-kennzahlen` (Volatilität, Beta, 52-Wochen-Spanne),
  `charts-lesen` (Candlesticks, 100/200-Tage-Linie, Benchmark-Overlays), `checkpoint`
- `etfs` (requires grundlagen): `index-bauen`, `indizes-vergleich` (MSCI World, FTSE All-World, EM, S&P 500),
  `laender-sektoren` (WorldMap with real fund weights, concentration), `kosten-varianten`
  (TER/Tracking Difference, thesaurierend/ausschüttend, Replikation), `checkpoint`
- `psychologie` (requires grundlagen): `crashs`, `panik-simulation`, `time-in-market`,
  `einmal-vs-sparplan`, `rebalancing`, `checkpoint`
- `anleihen` (requires grundlagen): `wie-anleihen-funktionieren` (Kupon, Laufzeit, Kurs vs Rendite),
  `zinsen-und-kurse` (Zinsänderungsrisiko, Duration-Intuition), `bonitaet` (Ratings, Staats- vs
  Unternehmensanleihen, Inflationsschutz), `anleihen-im-portfolio` (Risikopuffer, Korrelation zu Aktien,
  Aufteilung nach Alter/Ziel, Anleihen-ETFs), `checkpoint`
- `portfolio` "Portfoliotheorie" (requires aktien + anleihen; built LAST, mathematical, KaTeX formulas):
  `rendite-volatilitaet-mathe`, `kovarianz-korrelation`, `sharpe-alpha-beta`, `efficient-frontier`
  (interactive), `capm`, `optionen-griechen` (short options intro + Delta/Gamma/Theta/Vega), `checkpoint`
- Stubs ("bald verfügbar", TS only, no DB rows): `steuern` (Vorsorge & Steuern in DE), `spekulation`
  (Spekulation & Fallen)

## Content model
- Content lives in TS: `app/(dashboard)/tutorial/_content/<path>/` (lesson files, diagrams,
  optional `server_slots.tsx`). Metadata only in `_engine/catalog.ts`.
- DB mirrors catalog (ids, order, xp, reward, min_score) for server-side validation; new lessons need a
  migration upsert. Dev-only check warns on drift.
- Types (`_engine/types.ts`): `PathDef{id,title,icon,requires?,status:'available'|'soon',lessonIds}`,
  `LessonDef{id,title,steps}`, `Step = card{title,body,diagram?,slot?} | exercise{exercise}`,
  `Exercise = mc | true_false | slider | order | match` (each with explanation).
- `world_map.tsx` is server-only → rendered via per-path server slots, passed to the client player as ReactNode.
- Client player loads lesson content via `_content/index.ts` (lessonId → dynamic import).

## DB (schema `users`, files per manifest conventions)
- Tables: `tutorial_paths`, `tutorial_lessons` (xp, virtual_cash_reward, min_score), `lesson_progress`
  (first/last_completed_at, completions, best_score, mastery, reward snapshot, reward_paid_at,
  reward_depot_id, reward_transaction_id), `lesson_attempts` (berlin_day, score, xp_awarded),
  `learner_stats` (xp_total, streak_current, streak_best, last_active_day).
- Functions (SECURITY DEFINER, `search_path=''`): `can_view_learner`, `is_lesson_unlocked`,
  `complete_lesson(p_lesson_id, p_score, p_depot_id)` → passed, first_completion, xp_awarded,
  virtual_cash_awarded, mastery, streak, xp_total. Locks learner_stats row per user; idempotent payout by
  `reward_paid_at`; pays pending rewards when a depot the caller belongs to (`depots.is_depot_member`)
  is given; payout = 'movement' transaction like `04-functions/depots/grant_reward.sql`.
- View `learner_overview` (security_invoker) with effective streak.
- RLS: catalog readable by authenticated; progress/attempts/stats SELECT via can_view_learner; no write
  policies; SELECT-only grants; EXECUTE on complete_lesson to authenticated.
- Migration `dbinit/migrations/2026-12-05_tutorial_progress.sql`; seed `dbinit/seed/tutorial_catalog.sql`;
  tests `dbinit/tests/tutorial.sql` + additions to `tests/security.sql` and `verify_schema.sql`.
- Reward amounts (user-approved): lesson 100 €, checkpoint 500 € (virtual). Start cash 50k.
- Teacher view (user-requested, this pass): `users.tutorial_class_overview()` + per-lesson detail,
  teacher/admin only; frontend page for teachers showing per-student XP, streak, progress, mastery.

## Frontend engine (`_engine/`)
- `skill_tree.tsx` (winding trunk forking into branch columns; stacked on mobile; node states locked /
  available (pulse) / done with 1–3 crowns; checkpoints = trophy), header with XP + streak.
- `lesson_player.tsx` + pure reducer `player_machine.ts`; `exercises/*` each exporting `isCorrect`;
  order/match via tap-to-place (no drag dependency); `feedback_bar.tsx`, `complete_screen.tsx`, `blocks.tsx`
  (InfoCard, DataTable moved from slides).
- Routes: `tutorial/page.tsx`, `tutorial/[path]/[lesson]/page.tsx` (validate, redirect if locked).
- Data: `_engine/progress.ts` (server reads), `_engine/actions.ts` (server action → complete_lesson,
  revalidate). Regenerate types: `cd frontend && nu gen_types.nu`.
- Mobile-first: everything must work at 360px.

## Steps
S1 DB · S2 engine contract + UI · S3 grundlagen (move slide diagrams, delete `slides/`) · S4 aktien ·
S5 etfs · S6 psychologie · S7 anleihen · S8 integration (types, progress, actions) · S9 portfolio (last,
adds KaTeX) · S10 verify. Content steps only edit their own `_content/<path>/`.
