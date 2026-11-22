# Frontend (Next.js)

## Layout
- `app/` — App Router pages plus route-specific, single-use components
- `components/` — reused components; `components/ui/` = Shadcn primitives
- `lib/` — utilities and non-component code (`lib/util.ts` = formatters)
- `database/`, `utils/` — generated; never hand-edit (regenerate instead)

Styling rules load from `.claude/rules/frontend-ui.md` when you touch
`.tsx`/`.css` files. Skill for larger visual work: `design-taste-frontend`.

## Commands
- Dev: `yarn dev` · Build: `yarn build` · Tests: none yet, skip
- Lint/format: `biome check`. Biome comes from Nix on PATH; never `npx biome`
  (that fetches an unrelated 0.3.x package).
- Type check: `node_modules/.bin/tsc --noEmit`. Pre-existing errors exist
  (base-ui `asChild` typing, `components/charts/tree.tsx`,
  `displays/tab_view.tsx`, …); judge only errors in the files you touched.
- Regenerate DB types: `nu gen_types.nu` (needs local DB on :5432)

## Conventions
- Naming: camelCase functions, PascalCase components/types, snake_case
  variables and filenames
- Errors: Result-style objects `{ res, error, failed? }`; early returns
- State: cookies for cross-page state, `useState` for local state
- Money/prices: always format via `lib/util.ts`; no inline `toFixed`/rounding
- The file hierarchy isn't settled and some code is over-abstracted, so don't
  treat existing patterns as templates to copy.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
