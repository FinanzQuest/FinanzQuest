"use client"

import { type ReactNode, useState } from "react"
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Line,
	LineChart,
	ReferenceDot,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts"
import { Slider } from "@/components/ui/slider"

const GOOD = "#10b981"
const BAD = "#f43f5e"
const NEUTRAL = "#6366f1"
const MUTED = "var(--muted-foreground)"
const GRID = "var(--border)"

const tick = { fontSize: 11, fill: MUTED }

function Frame({ children, note }: { children: ReactNode; note?: string }) {
	return (
		<div className="rounded-xl border border-border bg-card p-3 sm:p-4">
			{children}
			{note ? (
				<p className="mt-2 text-xs text-muted-foreground">{note}</p>
			) : null}
		</div>
	)
}

function Stat({ label, value }: { label: string; value: string }) {
	return (
		<div className="min-w-0 flex-1">
			<div className="text-xs text-muted-foreground">{label}</div>
			<div className="text-lg font-semibold tabular-nums">{value}</div>
		</div>
	)
}

const pct = (v: number, d = 1) =>
	`${v.toLocaleString("de-DE", { minimumFractionDigits: d, maximumFractionDigits: d })} %`

/** Price in % of face value for a bond with annual coupon (in %) and market rate (in %). */
export function bondPrice(coupon: number, years: number, rate: number): number {
	const r = rate / 100
	let p = 0
	for (let t = 1; t <= years; t++) p += coupon / (1 + r) ** t
	return p + 100 / (1 + r) ** years
}

/** Yield to maturity (in %) for a price in % of face value, by bisection. */
function ytm(coupon: number, years: number, price: number): number {
	let lo = -5
	let hi = 30
	for (let i = 0; i < 60; i++) {
		const mid = (lo + hi) / 2
		if (bondPrice(coupon, years, mid) > price) lo = mid
		else hi = mid
	}
	return (lo + hi) / 2
}

/** Lesson 1: cash-flow timeline of a 5-year bond, adjustable purchase price. */
export function BondCashflow() {
	const [price, setPrice] = useState(100)
	const face = 1000
	const coupon = 30
	const data = [
		{ year: "Kauf", flow: -price * 10 },
		...[1, 2, 3, 4].map(y => ({ year: `J${y}`, flow: coupon })),
		{ year: "J5", flow: coupon + face },
	]
	const total = coupon * 5 + face - price * 10
	const y = ytm(3, 5, price)
	return (
		<Frame note="Beispiel: Nennwert 1.000 €, Kupon 3 %, Laufzeit 5 Jahre. Der Kurs wird in % vom Nennwert angegeben.">
			<div className="h-52 w-full">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={data}
						margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
					>
						<CartesianGrid stroke={GRID} vertical={false} />
						<XAxis dataKey="year" tick={tick} />
						<YAxis tick={tick} width={44} />
						<Bar dataKey="flow" radius={3}>
							{data.map(d => (
								<Cell key={d.year} fill={d.flow < 0 ? BAD : GOOD} />
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			</div>
			<div className="mt-3 flex gap-3">
				<Stat label="Kaufkurs" value={pct(price)} />
				<Stat
					label="Gewinn gesamt"
					value={`${total.toLocaleString("de-DE")} €`}
				/>
				<Stat label="Rendite p. a." value={pct(y, 2)} />
			</div>
			<Slider
				className="mt-3"
				aria-label="Kaufkurs in Prozent vom Nennwert"
				min={90}
				max={110}
				step={1}
				value={[price]}
				onValueChange={v => setPrice(Array.isArray(v) ? v[0] : v)}
			/>
		</Frame>
	)
}

/** Lesson 2: price of a 10y 3% bond as a function of the market rate. */
export function RatePriceCurve() {
	const [rate, setRate] = useState(3)
	const data = Array.from({ length: 33 }, (_, i) => {
		const r = i * 0.25
		return { r, p: bondPrice(3, 10, r) }
	})
	const p = bondPrice(3, 10, rate)
	const diff = p - 100
	return (
		<Frame note="10-jährige Anleihe, Kupon 3 %, Nennwert 100. Der Marktzins ist die Rendite, die neue Anleihen gerade bieten.">
			<div className="h-52 w-full">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart
						data={data}
						margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
					>
						<CartesianGrid stroke={GRID} vertical={false} />
						<XAxis
							dataKey="r"
							type="number"
							domain={[0, 8]}
							ticks={[0, 2, 4, 6, 8]}
							tick={tick}
							tickFormatter={v => `${v} %`}
						/>
						<YAxis domain={[60, 130]} tick={tick} width={36} />
						<Line
							dataKey="p"
							stroke={NEUTRAL}
							strokeWidth={2}
							dot={false}
							isAnimationActive={false}
						/>
						<ReferenceDot
							x={rate}
							y={p}
							r={6}
							fill={diff < -0.05 ? BAD : diff > 0.05 ? GOOD : NEUTRAL}
							stroke="none"
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
			<div className="mt-3 flex gap-3">
				<Stat label="Marktzins" value={pct(rate)} />
				<Stat
					label="Kurs"
					value={p.toLocaleString("de-DE", { maximumFractionDigits: 1 })}
				/>
				<Stat label="Kursänderung" value={pct(diff)} />
			</div>
			<Slider
				className="mt-3"
				aria-label="Marktzins in Prozent"
				min={0}
				max={8}
				step={0.25}
				value={[rate]}
				onValueChange={v => setRate(Array.isArray(v) ? v[0] : v)}
			/>
		</Frame>
	)
}

/** Lesson 2: price change for +1 percentage point by maturity (3% coupon, from 3% to 4%). */
export function DurationBars() {
	const data = [2, 5, 10, 20, 30].map(n => ({
		n: `${n} J.`,
		chg: (bondPrice(3, n, 4) / bondPrice(3, n, 3) - 1) * 100,
	}))
	return (
		<Frame note="Kursänderung bei Zinsanstieg von 3 % auf 4 %, Kupon 3 %. Je länger die Laufzeit, desto stärker der Hebel.">
			<div className="h-48 w-full">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={data}
						margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
					>
						<CartesianGrid stroke={GRID} vertical={false} />
						<XAxis dataKey="n" tick={tick} />
						<YAxis tick={tick} width={40} tickFormatter={v => `${v} %`} />
						<Bar
							dataKey="chg"
							fill={BAD}
							radius={3}
							isAnimationActive={false}
						/>
					</BarChart>
				</ResponsiveContainer>
			</div>
		</Frame>
	)
}

/** Lesson 2: rough 2022 returns (ca., rounded). */
export function Crash2022() {
	const data = [
		{ name: "Euro-Staatsanl. (lang)", v: -25 },
		{ name: "Euro-Anleihen gesamt", v: -17 },
		{ name: "Aktien Welt (EUR)", v: -13 },
		{ name: "Tagesgeld", v: 0.5 },
	]
	return (
		<Frame note="Ca.-Werte für das Kalenderjahr 2022, gerundet; je nach Index leicht abweichend. Stand: Rückblick, keine Prognose.">
			<div className="h-52 w-full">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={data}
						layout="vertical"
						margin={{ top: 4, right: 12, left: 0, bottom: 0 }}
					>
						<CartesianGrid stroke={GRID} horizontal={false} />
						<XAxis
							type="number"
							domain={[-30, 5]}
							tick={tick}
							tickFormatter={v => `${v} %`}
						/>
						<YAxis type="category" dataKey="name" tick={tick} width={104} />
						<Bar dataKey="v" radius={3} isAnimationActive={false}>
							{data.map(d => (
								<Cell key={d.name} fill={d.v < 0 ? BAD : GOOD} />
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			</div>
		</Frame>
	)
}

const IG = new Set(["AAA", "AA", "A", "BBB"])

/** Lesson 3: typical yield premium by rating bucket (illustrative, ca.). */
export function SpreadBars() {
	const data = [
		{ r: "AAA", v: 0 },
		{ r: "AA", v: 0.3 },
		{ r: "A", v: 0.6 },
		{ r: "BBB", v: 1.2 },
		{ r: "BB", v: 2.5 },
		{ r: "B", v: 4.5 },
		{ r: "CCC", v: 9 },
	]
	return (
		<Frame note="Illustrativer Risikoaufschlag gegenüber sicheren Staatsanleihen in Prozentpunkten, ca.-Werte; schwankt stark mit der Marktlage.">
			<div className="h-48 w-full">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={data}
						margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
					>
						<CartesianGrid stroke={GRID} vertical={false} />
						<XAxis dataKey="r" tick={tick} />
						<YAxis tick={tick} width={40} tickFormatter={v => `${v}`} />
						<Bar dataKey="v" radius={3} isAnimationActive={false}>
							{data.map(d => (
								<Cell key={d.r} fill={IG.has(d.r) ? GOOD : BAD} />
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			</div>
			<p className="mt-1 text-xs text-muted-foreground">
				Grün = Investment Grade (ab BBB), rot = High Yield.
			</p>
		</Frame>
	)
}

const STOCK_RET = 7
const BOND_RET = 3
const STOCK_WORST = -35
const BOND_WORST = -15

/** Lesson 4: stock/bond mix, expected return vs. worst year (simplified). */
export function MixSlider() {
	const [w, setW] = useState(60)
	const at = (s: number) => ({
		s,
		ret: (s * STOCK_RET + (100 - s) * BOND_RET) / 100,
		worst: (s * STOCK_WORST + (100 - s) * BOND_WORST) / 100,
	})
	const data = Array.from({ length: 11 }, (_, i) => at(i * 10))
	const cur = at(w)
	return (
		<Frame note="Stark vereinfachte Annahmen: Aktien ca. 7 % p. a., Anleihen ca. 3 % p. a.; schlechtestes Jahr Aktien ca. -35 %, Anleihen ca. -15 %, einfach gewichtet. Kein Versprechen, nur Intuition.">
			<div className="h-52 w-full">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart
						data={data}
						margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
					>
						<CartesianGrid stroke={GRID} vertical={false} />
						<XAxis
							dataKey="s"
							type="number"
							domain={[0, 100]}
							ticks={[0, 25, 50, 75, 100]}
							tick={tick}
							tickFormatter={v => `${v} %`}
						/>
						<YAxis
							domain={[-40, 10]}
							tick={tick}
							width={40}
							tickFormatter={v => `${v}`}
						/>
						<Line
							dataKey="ret"
							stroke={GOOD}
							strokeWidth={2}
							dot={false}
							isAnimationActive={false}
						/>
						<Line
							dataKey="worst"
							stroke={BAD}
							strokeWidth={2}
							dot={false}
							isAnimationActive={false}
						/>
						<ReferenceDot x={w} y={cur.ret} r={5} fill={GOOD} stroke="none" />
						<ReferenceDot x={w} y={cur.worst} r={5} fill={BAD} stroke="none" />
					</LineChart>
				</ResponsiveContainer>
			</div>
			<div className="mt-3 flex gap-3">
				<Stat label="Aktien / Anleihen" value={`${w} / ${100 - w}`} />
				<Stat label="Erwartung p. a." value={pct(cur.ret)} />
				<Stat label="Worst Year" value={pct(cur.worst)} />
			</div>
			<Slider
				className="mt-3"
				aria-label="Aktienanteil in Prozent"
				min={0}
				max={100}
				step={5}
				value={[w]}
				onValueChange={v => setW(Array.isArray(v) ? v[0] : v)}
			/>
			<p className="mt-2 text-xs text-muted-foreground">
				Grün = erwartete Rendite, rot = schlechtestes Jahr.
			</p>
		</Frame>
	)
}
