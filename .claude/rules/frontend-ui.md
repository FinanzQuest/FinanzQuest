---
paths:
  - "frontend/**/*.tsx"
  - "frontend/**/*.css"
---

# Frontend styling & UI

- Shadcn first: check `frontend/components/ui/` before building any primitive
  (button, dialog, input, card, table, …). Compose primitives
  (`Card` + `CardHeader` + `CardContent`) instead of rebuilding them with divs.
- Use existing variant/size props (`variant="outline"`, `size="sm"`) rather
  than overriding with custom classes.
- Never hardcode colors (hex/rgb, Tailwind arbitrary color values). Use the
  semantic tokens (`bg-background`, `text-muted-foreground`, `border-border`,
  `bg-primary`, …). If a color is missing, add a token in `app/globals.css`
  first.
- Custom Tailwind only for layout/spacing that Shadcn doesn't own.
- Display money/prices only through the formatters in `frontend/lib/util.ts`.
