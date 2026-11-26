"use client"

import { useState } from "react"
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Line,
	LineChart,
	ReferenceLine,
	ResponsiveContainer,
	Scatter,
	ScatterChart,
	XAxis,
	YAxis,
} from "recharts"
import { Slider } from "@/components/ui/slider"
import {
	BAD,
	Frame,
	first,
	GOOD,
	GRID,
	Labeled,
	NEUTRAL,
	num,
	pct,
	Stat,
	tick,
} from "./shared"

/** Lesson 1: +r % then -r %: the arithmetic mean is 0, the wealth is not. */
export function WealthPaths() {
	const [r, setR] = useState(30)
	const up = 100 * (1 + r / 100)
	const down = up * (1 - r / 100)
	const geo = (Math.sqrt((1 + r / 100) * (1 - r / 100)) - 1) * 100
	const data = [
		{ s: "Start", v: 100 },
		{ s: `+${r} %`, v: up },
		{ s: `-${r} %`, v: down },
	]
	return (
		<Frame note="Zwei Jahre: erst +r %, dann -r %. Der Durchschnitt der beiden Renditen ist immer 0 %.">
			<div className="h-44 w-full">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={data}
						margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
					>
						<CartesianGrid stroke={GRID} vertical={false} />
						<XAxis dataKey="s" tick={tick} />
						<YAxis domain={[0, 200]} tick={tick} width={32} />
						<ReferenceLine y={100} stroke={GRID} strokeDasharray="4 4" />
						<Bar dataKey="v" radius={[4, 4, 0, 0]} isAnimationActive={false}>
							{data.map((d, i) => (
								<Cell
									key={d.s}
									fill={i === 2 ? (down < 100 ? BAD : GOOD) : NEUTRAL}
								/>
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			</div>
			<div className="mt-3 flex gap-3">
				<Stat label="Arithmetisch" value="0,0 %" />
				<Stat label="Endwert" value={num(down, 1)} />
				<Stat label="Geometrisch" value={pct(geo)} />
			</div>
			<Labeled label={`Schwankung r = ${r} %`}>
				<Slider
					aria-label="Rendite r in Prozent"
					min={0}
					max={80}
					step={5}
					value={[r]}
					onValueChange={v => setR(first(v))}
				/>
			</Labeled>
		</Frame>
	)
}

/** Lesson 1: sqrt(t) scaling of volatility from daily 1 %. */
export function SqrtTime() {
	const data = [
		{ h: "1 Tag", d: 1, s: 1 },
		{ h: "1 Woche", d: 5, s: Math.sqrt(5) },
		{ h: "1 Monat", d: 21, s: Math.sqrt(21) },
		{ h: "1 Jahr", d: 252, s: Math.sqrt(252) },
	]
	return (
		<Frame note="Tägliche Volatilität 1 %, 252 Handelstage pro Jahr. Der Zeitraum wächst um den Faktor 252, die Volatilität nur um √252 ≈ 15,9.">
			<div className="h-44 w-full">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={data}
						margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
					>
						<CartesianGrid stroke={GRID} vertical={false} />
						<XAxis dataKey="h" tick={tick} />
						<YAxis tick={tick} width={32} tickFormatter={v => `${v} %`} />
						<Bar
							dataKey="s"
							fill={NEUTRAL}
							radius={[4, 4, 0, 0]}
							isAnimationActive={false}
						/>
					</BarChart>
				</ResponsiveContainer>
			</div>
		</Frame>
	)
}

/** Deterministic standard-normal-ish samples, orthogonalised so the correlation is exact. */
function buildBase(n: number) {
	let seed = 12345
	const rnd = () => {
		seed = (seed * 1664525 + 1013904223) % 4294967296
		return (seed + 1) / 4294967297
	}
	const gauss = () =>
		Math.sqrt(-2 * Math.log(rnd())) * Math.cos(2 * Math.PI * rnd())
	const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length
	const norm = (a: number[]) => {
		const m = mean(a)
		const c = a.map(v => v - m)
		const sd = Math.sqrt(c.reduce((s, v) => s + v * v, 0) / (a.length - 1))
		return c.map(v => v / sd)
	}
	const x = norm(Array.from({ length: n }, gauss))
	const z0 = norm(Array.from({ length: n }, gauss))
	const dot = x.reduce((s, v, i) => s + v * (z0[i] as number), 0) / (n - 1)
	const z = norm(z0.map((v, i) => v - dot * (x[i] as number)))
	return { x, z }
}
const BASE = buildBase(60)

/** Lesson 2: scatter of two returns for an adjustable correlation. */
export function CorrelationScatter() {
	const [rho, setRho] = useState(0.6)
	const k = Math.sqrt(1 - rho * rho)
	const data = BASE.x.map((x, i) => ({
		a: 8 + 10 * x,
		b: 8 + 10 * (rho * x + k * (BASE.z[i] as number)),
	}))
	const color = rho > 0.05 ? GOOD : rho < -0.05 ? BAD : NEUTRAL
	return (
		<Frame note="Jeder Punkt ist ein Zeitraum: links/rechts die Rendite von A, oben/unten die von B (beide in %).">
			<div className="h-56 w-full">
				<ResponsiveContainer width="100%" height="100%">
					<ScatterChart margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
						<CartesianGrid stroke={GRID} />
						<XAxis
							dataKey="a"
							type="number"
							domain={[-30, 45]}
							ticks={[-20, 0, 20, 40]}
							tick={tick}
							name="A"
						/>
						<YAxis
							dataKey="b"
							type="number"
							domain={[-30, 45]}
							ticks={[-20, 0, 20, 40]}
							tick={tick}
							width={32}
							name="B"
						/>
						<ReferenceLine x={8} stroke={GRID} />
						<ReferenceLine y={8} stroke={GRID} />
						<Scatter data={data} fill={color} isAnimationActive={false} />
					</ScatterChart>
				</ResponsiveContainer>
			</div>
			<div className="mt-3 flex gap-3">
				<Stat label="Korrelation ρ" value={num(rho, 2)} />
				<Stat label="Kovarianz (σ = 10)" value={num(rho * 100, 0)} />
			</div>
			<Labeled label="Korrelation einstellen">
				<Slider
					aria-label="Korrelation"
					min={-1}
					max={1}
					step={0.05}
					value={[rho]}
					onValueChange={v => setRho(first(v))}
				/>
			</Labeled>
		</Frame>
	)
}

/** Lesson 3: Sharpe ratios of three funds. */
export function SharpeBars() {
	const rf = 2
	const funds = [
		{ n: "A", r: 8, s: 12 },
		{ n: "B", r: 12, s: 20 },
		{ n: "C", r: 10, s: 10 },
	].map(f => ({ ...f, sharpe: (f.r - rf) / f.s }))
	return (
		<Frame note="Risikofreier Zins 2 %. A: 8 % Rendite, 12 % Vol. B: 12 % / 20 %. C: 10 % / 10 %.">
			<div className="h-44 w-full">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={funds}
						margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
					>
						<CartesianGrid stroke={GRID} vertical={false} />
						<XAxis dataKey="n" tick={tick} tickFormatter={v => `Fonds ${v}`} />
						<YAxis domain={[0, 1]} tick={tick} width={32} />
						<Bar
							dataKey="sharpe"
							radius={[4, 4, 0, 0]}
							isAnimationActive={false}
						>
							{funds.map(f => (
								<Cell key={f.n} fill={f.sharpe > 0.6 ? GOOD : NEUTRAL} />
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			</div>
			<div className="mt-3 flex gap-3">
				{funds.map(f => (
					<Stat key={f.n} label={`Sharpe ${f.n}`} value={num(f.sharpe, 2)} />
				))}
			</div>
		</Frame>
	)
}

/** Lesson 3: asset return vs market return for an adjustable beta. */
export function BetaLine() {
	const [beta, setBeta] = useState(1.5)
	const data = [-10, -5, 0, 5, 10].map(m => ({ m, market: m, asset: beta * m }))
	return (
		<Frame note="Steigt der Markt um 1 %, steigt (oder fällt) die Aktie im Mittel um β %. Die Steigung der Linie ist Beta.">
			<div className="h-52 w-full">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart
						data={data}
						margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
					>
						<CartesianGrid stroke={GRID} />
						<XAxis
							dataKey="m"
							type="number"
							domain={[-10, 10]}
							ticks={[-10, -5, 0, 5, 10]}
							tick={tick}
							tickFormatter={v => `${v} %`}
						/>
						<YAxis
							domain={[-20, 20]}
							ticks={[-20, -10, 0, 10, 20]}
							tick={tick}
							width={36}
						/>
						<Line
							dataKey="market"
							stroke="var(--muted-foreground)"
							strokeDasharray="5 4"
							dot={false}
							isAnimationActive={false}
						/>
						<Line
							dataKey="asset"
							stroke={beta > 1 ? BAD : beta < 1 ? GOOD : NEUTRAL}
							strokeWidth={2.5}
							dot={false}
							isAnimationActive={false}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
			<div className="mt-3 flex gap-3">
				<Stat label="Beta" value={num(beta, 2)} />
				<Stat label="Markt +10 %" value={`Aktie ${pct(beta * 10)}`} />
			</div>
			<Labeled label="Beta einstellen (gestrichelt: Markt, Beta = 1)">
				<Slider
					aria-label="Beta"
					min={-0.5}
					max={2}
					step={0.1}
					value={[beta]}
					onValueChange={v => setBeta(first(v))}
				/>
			</Labeled>
		</Frame>
	)
}
