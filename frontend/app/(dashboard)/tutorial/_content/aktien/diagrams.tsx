"use client"

import { useId, useMemo, useState } from "react"
import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts"
import type { OverlayKey } from "@/lib/data/overlays"
import { BENCHMARKS, MOVING_AVERAGES, OVERLAY_COLOR } from "@/lib/data/overlays"
import { cn } from "@/lib/utils"

const nf = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 })
const fmt = (n: number) => nf.format(n)

function Panel({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 text-sm">
			{children}
		</div>
	)
}

function Stat({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex min-w-0 flex-col gap-0.5 rounded-lg bg-muted/50 px-3 py-2">
			<span className="text-xs text-muted-foreground">{label}</span>
			<span className="text-base font-semibold tabular-nums">{value}</span>
		</div>
	)
}

interface RangeProps {
	label: string
	value: number
	min: number
	max: number
	step: number
	unit: string
	onChange: (v: number) => void
}

function Range({ label, value, min, max, step, unit, onChange }: RangeProps) {
	const id = useId()
	return (
		<div className="flex flex-col gap-1">
			<label htmlFor={id} className="flex justify-between gap-2">
				<span>{label}</span>
				<span className="font-semibold tabular-nums">
					{fmt(value)} {unit}
				</span>
			</label>
			<input
				id={id}
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={e => onChange(Number(e.target.value))}
				className="w-full accent-primary"
			/>
		</div>
	)
}

/* ---------- Lektion 1: Gewinnmarge ---------- */

export function MarginExplorer() {
	const [revenue, setRevenue] = useState(100)
	const [profit, setProfit] = useState(12)
	const p = Math.min(profit, revenue)
	const margin = (p / revenue) * 100
	return (
		<Panel>
			<Range
				label="Umsatz"
				value={revenue}
				min={20}
				max={200}
				step={5}
				unit="Mio. €"
				onChange={setRevenue}
			/>
			<Range
				label="Gewinn"
				value={p}
				min={0}
				max={60}
				step={1}
				unit="Mio. €"
				onChange={setProfit}
			/>
			<div className="h-6 w-full overflow-hidden rounded-full bg-muted">
				<div
					className="h-full bg-primary transition-all"
					style={{ width: `${margin}%` }}
				/>
			</div>
			<div className="grid grid-cols-2 gap-2">
				<Stat label="Gewinnmarge" value={`${fmt(margin)} %`} />
				<Stat label="Kosten" value={`${fmt(revenue - p)} Mio. €`} />
			</div>
		</Panel>
	)
}

/* ---------- Lektion 2: KGV-Rechner ---------- */

export function KgvCalculator() {
	const [price, setPrice] = useState(100)
	const [eps, setEps] = useState(5)
	const kgv = price / eps
	const label =
		kgv < 12
			? "eher günstig bewertet"
			: kgv < 25
				? "durchschnittlich bewertet"
				: "eher teuer bewertet"
	return (
		<Panel>
			<Range
				label="Aktienkurs"
				value={price}
				min={20}
				max={300}
				step={5}
				unit="€"
				onChange={setPrice}
			/>
			<Range
				label="Gewinn je Aktie"
				value={eps}
				min={1}
				max={15}
				step={0.5}
				unit="€"
				onChange={setEps}
			/>
			<div className="grid grid-cols-2 gap-2">
				<Stat label="KGV" value={fmt(kgv)} />
				<Stat label="Gewinnrendite" value={`${fmt((eps / price) * 100)} %`} />
			</div>
			<p className="text-muted-foreground">
				Du zahlst {fmt(kgv)} Jahresgewinne für die Aktie: {label}.
			</p>
		</Panel>
	)
}

/* ---------- Beispielkurse (deterministisch) ---------- */

function series(
	n: number,
	start: number,
	drift: number,
	amp: number,
	seed: number
): number[] {
	const out: number[] = []
	let v = start
	for (let i = 0; i < n; i++) {
		const noise =
			Math.sin(i * 1.7 + seed) * 0.6 +
			Math.sin(i * 0.53 + seed * 2) * 0.4 +
			Math.cos(i * 3.1 + seed * 3) * 0.3
		v = v * (1 + drift + (amp * noise) / 100)
		out.push(v)
	}
	return out
}

function stdev(xs: number[]): number {
	const m = xs.reduce((a, b) => a + b, 0) / xs.length
	return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1))
}

/** Annualised volatility (percent) from daily returns. */
function annualVol(prices: number[]): number {
	const r = prices.slice(1).map((p, i) => p / prices[i] - 1)
	return stdev(r) * Math.sqrt(252) * 100
}

const AXIS = {
	stroke: "var(--muted-foreground)",
	fontSize: 11,
	tickLine: false,
	axisLine: false,
} as const

/* ---------- Lektion 3: Volatilität ---------- */

export function VolatilityCompare() {
	const data = useMemo(() => {
		const calm = series(120, 100, 0.0005, 0.35, 1)
		const wild = series(120, 100, 0.0005, 1.6, 2)
		return {
			rows: calm.map((c, i) => ({ t: i, calm: c, wild: wild[i] })),
			calmVol: annualVol(calm),
			wildVol: annualVol(wild),
		}
	}, [])
	return (
		<Panel>
			<div className="h-44 w-full">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart
						data={data.rows}
						margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
					>
						<CartesianGrid stroke="var(--border)" vertical={false} />
						<XAxis dataKey="t" hide />
						<YAxis {...AXIS} domain={["auto", "auto"]} tickFormatter={fmt} />
						<Line
							dataKey="calm"
							stroke="var(--overlay-1)"
							dot={false}
							strokeWidth={2}
							isAnimationActive={false}
						/>
						<Line
							dataKey="wild"
							stroke="var(--overlay-5)"
							dot={false}
							strokeWidth={2}
							isAnimationActive={false}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
			<div className="grid grid-cols-2 gap-2">
				<Stat label="Ruhige Aktie (blau)" value={`${fmt(data.calmVol)} %`} />
				<Stat label="Wilde Aktie (rot)" value={`${fmt(data.wildVol)} %`} />
			</div>
			<p className="text-muted-foreground">
				Beispieldaten, nicht echt. Beide Aktien starten bei 100 und haben
				ähnlichen Trend, aber sehr verschiedene Volatilität.
			</p>
		</Panel>
	)
}

/* ---------- Lektion 3: Beta ---------- */

export function BetaExplorer() {
	const [beta, setBeta] = useState(1.5)
	const rows = useMemo(() => {
		const market = [0, 2, -1, 3, -2, 4, -3, 2, 1, -4, 3, 0]
		let m = 100
		let s = 100
		return market.map((r, i) => {
			m *= 1 + r / 100
			s *= 1 + (r * beta) / 100
			return { t: i, markt: m, aktie: s }
		})
	}, [beta])
	return (
		<Panel>
			<Range
				label="Beta der Aktie"
				value={beta}
				min={0.3}
				max={2}
				step={0.1}
				unit=""
				onChange={setBeta}
			/>
			<div className="h-44 w-full">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart
						data={rows}
						margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
					>
						<CartesianGrid stroke="var(--border)" vertical={false} />
						<XAxis dataKey="t" hide />
						<YAxis {...AXIS} domain={[70, 130]} tickFormatter={fmt} />
						<Line
							dataKey="markt"
							stroke="var(--muted-foreground)"
							strokeDasharray="4 3"
							dot={false}
							strokeWidth={2}
							isAnimationActive={false}
						/>
						<Line
							dataKey="aktie"
							stroke="var(--overlay-2)"
							dot={false}
							strokeWidth={2}
							isAnimationActive={false}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
			<p className="text-muted-foreground">
				Gestrichelt: Gesamtmarkt. Orange: Aktie. Bei Beta {fmt(beta)} bewegt sie
				sich etwa {fmt(beta)}-mal so stark wie der Markt.
			</p>
		</Panel>
	)
}

/* ---------- Lektion 3: 52-Wochen-Spanne ---------- */

export function RangeBar() {
	const [pos, setPos] = useState(70)
	const low = 80
	const high = 140
	const price = low + ((high - low) * pos) / 100
	return (
		<Panel>
			<Range
				label="Aktueller Kurs"
				value={price}
				min={low}
				max={high}
				step={1}
				unit="€"
				onChange={v => setPos(((v - low) / (high - low)) * 100)}
			/>
			<div className="relative h-2 rounded-full bg-muted">
				<div
					className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-primary"
					style={{ left: `${pos}%` }}
				/>
			</div>
			<div className="flex justify-between text-xs text-muted-foreground">
				<span>Tief {low} €</span>
				<span>Hoch {high} €</span>
			</div>
			<p className="text-muted-foreground">
				Der Kurs liegt {fmt(pos)} % der Spanne über dem Jahrestief und{" "}
				{fmt(((high - price) / high) * 100)} % unter dem Jahreshoch.
			</p>
		</Panel>
	)
}

/* ---------- Lektion 4: Candlestick ---------- */

export function CandleAnatomy() {
	const [bull, setBull] = useState(true)
	const open = bull ? 40 : 80
	const close = bull ? 80 : 40
	const high = 95
	const low = 25
	const y = (v: number) => 110 - v
	const color = bull ? "var(--overlay-6)" : "var(--overlay-5)"
	const labels: [number, string][] = [
		[high, "Höchstkurs"],
		[open, "Eröffnung"],
		[close, "Schlusskurs"],
		[low, "Tiefstkurs"],
	]
	return (
		<Panel>
			<div className="flex gap-2">
				{[true, false].map(b => (
					<button
						key={String(b)}
						type="button"
						onClick={() => setBull(b)}
						className={cn(
							"flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
							bull === b
								? "border-primary bg-primary/10"
								: "border-border text-muted-foreground"
						)}
					>
						{b ? "Kurs gestiegen" : "Kurs gefallen"}
					</button>
				))}
			</div>
			<svg
				viewBox="0 0 300 120"
				className="h-40 w-full"
				role="img"
				aria-label="Aufbau einer Kerze: Docht, Körper, Eröffnung, Schluss"
			>
				<line
					x1="100"
					x2="100"
					y1={y(high)}
					y2={y(low)}
					stroke={color}
					strokeWidth="3"
				/>
				<rect
					x="82"
					width="36"
					y={y(Math.max(open, close))}
					height={Math.abs(open - close)}
					fill={color}
					rx="2"
				/>
				{labels.map(([v, t]) => (
					<g key={t}>
						<line
							x1="120"
							x2="160"
							y1={y(v)}
							y2={y(v)}
							stroke="var(--border)"
							strokeDasharray="3 3"
						/>
						<text x="166" y={y(v) + 4} fontSize="12" fill="var(--foreground)">
							{t}
						</text>
					</g>
				))}
			</svg>
			<p className="text-muted-foreground">
				{bull
					? "Grün: Der Schlusskurs liegt über dem Eröffnungskurs."
					: "Rot: Der Schlusskurs liegt unter dem Eröffnungskurs."}{" "}
				Der Körper zeigt Eröffnung bis Schluss, die Dochte Hoch und Tief.
			</p>
		</Panel>
	)
}

/* ---------- Lektion 4: Overlays ---------- */

const N = 320

function sma(xs: number[], w: number): (number | null)[] {
	return xs.map((_, i) =>
		i < w - 1 ? null : xs.slice(i - w + 1, i + 1).reduce((a, b) => a + b, 0) / w
	)
}

export function OverlayDemo() {
	const [active, setActive] = useState<OverlayKey[]>(["ma100"])
	const rows = useMemo(() => {
		const asset = series(N, 100, 0.0006, 0.9, 4)
		const ma100 = sma(asset, 100)
		const ma200 = sma(asset, 200)
		const bm = {
			sp500: series(N, 100, 0.0007, 0.6, 5),
			world: series(N, 100, 0.0005, 0.5, 6),
			em: series(N, 100, 0.0002, 0.7, 7),
			allworld: series(N, 100, 0.0005, 0.5, 8),
		}
		return asset.map((a, i) => ({
			t: i,
			asset: a,
			ma100: ma100[i],
			ma200: ma200[i],
			sp500: bm.sp500[i],
			world: bm.world[i],
			em: bm.em[i],
			allworld: bm.allworld[i],
		}))
	}, [])
	const toggle = (k: OverlayKey) =>
		setActive(a => (a.includes(k) ? a.filter(x => x !== k) : [...a, k]))
	const chips = [...MOVING_AVERAGES, ...BENCHMARKS]
	return (
		<Panel>
			<div className="flex flex-wrap gap-2">
				{chips.map(c => (
					<button
						key={c.key}
						type="button"
						aria-pressed={active.includes(c.key)}
						onClick={() => toggle(c.key)}
						className={cn(
							"flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
							active.includes(c.key)
								? "border-primary bg-primary/10"
								: "border-border text-muted-foreground"
						)}
					>
						<span
							className="size-2 rounded-full"
							style={{ background: OVERLAY_COLOR[c.key] }}
						/>
						{c.label}
					</button>
				))}
			</div>
			<div className="h-52 w-full">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart
						data={rows}
						margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
					>
						<CartesianGrid stroke="var(--border)" vertical={false} />
						<XAxis dataKey="t" hide />
						<YAxis {...AXIS} domain={["auto", "auto"]} tickFormatter={fmt} />
						<Line
							dataKey="asset"
							stroke="var(--foreground)"
							dot={false}
							strokeWidth={2}
							isAnimationActive={false}
						/>
						{chips
							.filter(c => active.includes(c.key))
							.map(c => (
								<Line
									key={c.key}
									dataKey={c.key}
									stroke={OVERLAY_COLOR[c.key]}
									dot={false}
									strokeWidth={1.5}
									connectNulls={false}
									isAnimationActive={false}
								/>
							))}
					</LineChart>
				</ResponsiveContainer>
			</div>
			<p className="text-muted-foreground">
				Schwarz/weiß: Beispielaktie. Alle Linien starten bei 100, so siehst du,
				wer besser lief. Beispieldaten, nicht echt.
			</p>
		</Panel>
	)
}
