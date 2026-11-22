# FinanzQuest

Interaktive Lernapp zur privaten Altersvorsorge für Gymnasiasten (Klasse 9).
Gebaut mit Next.js (App Router), Shadcn UI, Tailwind CSS und Recharts.

---

## Stack

- **Next.js** – App Router (`app/`)
- **Shadcn UI** – Carousel, Card, Alert, Table, Chart, Slider, ToggleGroup, Button
- **Tailwind CSS** – Styling ausschließlich über die Tokens aus `globals.css`
- **Recharts** – alle Charts (AreaChart, LineChart, BarChart)
- **Lucide React** – Icons

---

## Dateistruktur

```
app/
  page.tsx                        # Haupt-Shell: Fullscreen-Carousel, Keyboard-Nav, Footer

components/
  slide-navigation.tsx            # Prev/Next Buttons
  slide-progress.tsx              # Fortschrittsdots (klickbar)
  slides/
    slide-layout.tsx              # Gemeinsame Layout-Bausteine (siehe unten)
    slide-01.tsx                  # Warum private Altersvorsorge?
    slide-02.tsx                  # Inflation & Kaufkraft          [interaktiv]
    slide-03.tsx                  # Rendite & Realrendite
    slide-04.tsx                  # Zinseszinseffekt               [interaktiv]
    slide-05.tsx                  # Faktor Zeit                    [interaktiv]
    slide-06.tsx                  # Risiko & Volatilität
    slide-07.tsx                  # Diversifikation                [interaktiv]
    slide-08.tsx                  # Wertpapierklassen + Chart      [interaktiv]
    slide-09.tsx                  # ETFs & TER-Vergleich           [interaktiv]
    slide-10.tsx                  # Sparplan-Rechner               [interaktiv]
    slide-11.tsx                  # Zusammenfassung + Quiz         [interaktiv]
    index.ts                      # Barrel-Export: slides[]
```

---

## Layout-Bausteine (`slide-layout.tsx`, `slide-chart.tsx`)

Alle Slides bauen auf diesen Komponenten auf. Sie folgen dem Look der übrigen
Dashboard-Seiten: neutrale Shadcn-Tokens, gedämpfte Labels, Mono-Zahlen, Farbe
nur mit Bedeutung (`text-win` / `text-loss`, Chart-Serien). Keine Tailwind-
Palettenfarben (emerald, amber, ...) und keine Hex-Werte.

| Komponente | Verwendung |
|---|---|
| `<SlideLayout>` | Äußerer Container, max-w-3xl, zentriert |
| `<SlideHeader eyebrow title subtitle>` | Seitenüberschrift wie auf den anderen Seiten |
| `<SlideSection title>` | Inhaltsblock mit optionaler h2 |
| `<Text>` / `<Em>` | Fließtext (gedämpft) / hervorgehobener Begriff |
| `<Callout title>` | Shadcn-`Alert` für Beispiele und Hinweise |
| `<Callout variant="takeaway">` | Merksatz der Slide |
| `<Stat label value tone size>` / `<StatRow>` | Kennzahl wie die Stats auf der Depot-Seite |
| `<Figure title description action>` | Shadcn-`Card` für Charts, Rechner, Quiz (kein Swipe darin) |
| `<SliderField>` / `<SliderGrid>` | Label + Wert + Slider |
| `<DataTable headers rows>` | Shadcn-`Table` |
| `<SlideChart config>` | Shadcn-`ChartContainer`, Farben über `ChartConfig` (`var(--win)` etc.) |
| `<SlideTooltipContent config xKey>` | Tooltip mit `currencyFormat` |

---

## Navigation

- **Klick** auf Prev/Next-Buttons im Footer
- **Tastatur** `←` / `→` (auch `↑` / `↓`)
- **Direktsprung** via Fortschrittsdots

---

## Platzhalterdaten ersetzen

### Slide 08 – Historische Wertentwicklung
In `slide-08.tsx` das Array `HISTORICAL_DATA` mit echten Indexdaten befüllen:

```ts
const HISTORICAL_DATA = [
  { year: "2004", tagesgeld: 100, anleihen: 100, msci: 100, bitcoin: 100 },
  // ...
]
```

Alle Werte sind auf Basis 100 (= Jahr 2004 = 100) indexiert.
Quellen: MSCI World Total Return, Bloomberg Aggregate Bond Index, Bundesbank Tagesgeldsatz, CoinGecko (Bitcoin).

---

## Neue Slide hinzufügen

1. Datei `components/slides/slide-XX.tsx` anlegen, `"use client"` wenn interaktiv
2. Bausteine aus `slide-layout.tsx` importieren
3. In `components/slides/index.ts` importieren und dem `slides`-Array hinzufügen – Reihenfolge im Array = Reihenfolge in der App

```ts
// index.ts
import { SlideXX } from "./slide-XX"
export const slides = [ ..., SlideXX ]
```

---

## Bekannte TODOs

- [ ] Echte Indexdaten in Slide 08 eintragen
- [ ] Slide 08: Bitcoin-Achse skaliert das Chart stark – ggf. logarithmische Y-Achse oder separate Achse ergänzen
- [ ] Quiz (Slide 11): Fragen bei Bedarf erweitern oder aus einer externen Datei laden
- [ ] Mobile-Optimierung prüfen (Slides sind auf Desktop ausgelegt)
- [ ] Accessibility: `aria-label` auf interaktiven Chart-Elementen ergänzen
