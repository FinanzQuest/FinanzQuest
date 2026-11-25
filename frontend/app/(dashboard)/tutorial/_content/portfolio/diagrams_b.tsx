"use client"

import { useState } from "react"
import {
	CartesianGrid,
	Line,
	LineChart,
	ReferenceDot,
	ReferenceLine,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
	AMBER,
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

// two-asset world: stocks and bonds (annual figures in %)
const STOCK = { mu: 8, sigma: 18 }
const BOND = { mu: 3, sigma: 5 }
const RF = 1

function mix(w: number, rho: number) {
	const mu = w * STOCK.mu + (1 - w) * BOND.mu
	const v =
		w * w * STOCK.sigma ** 2 +
		(1 - w) ** 2 * BOND.sigma ** 2 +
		2 * w * (1 - w) * rho * STOCK.sigma * BOND.sigma
	return { mu, sigma: Math.sqrt(Math.max(v, 0)) }
}

/** Lesson 4: portfolio curve of two assets, minimum variance point, tangency portfolio. */
export function FrontierExplorer() {
	const [rho, setRho] = useState(0.2)
	const [w, setW] = useState(40)
	const curve = Array.from({ length: 101 }, (_, i) => mix(i / 100, rho))
	const cur = mix(w / 100, rho)
	let minI = 0
	let tanI = 0
	let best = -Infinity
	curve.forEach((p, i) => {
		if (p.sigma < (curve[minI] as { sigma: number }).sigma) minI = i
		const s = (p.mu - RF) / p.sigma
		if (s > best) {
			best = s
			tanI = i
		}
	})
	const minP = curve[minI] as { mu: number; sigma: number }
	const tanP = curve[tanI] as { mu: number; sigma: number }
	const cml = [
		{ sigma: 0, mu: RF },
		{ sigma: 20, mu: RF + best * 20 },
	]
	return (
		<Frame note="Jeder Punkt der Kurve ist eine Mischung aus Aktien (8 % Rendite, 18 % Vol.) und Anleihen (3 % / 5 %). Grün: minimales Risiko, gelb: höchste Sharpe Ratio, Linie: Mischung mit risikofreiem Zins (1 %).">
			<div className="h-60 w-full">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
						<CartesianGrid stroke={GRID} />
						<XAxis
							dataKey="sigma"
							type="number"
							domain={[0, 20]}
							ticks={[0, 5, 10, 15, 20]}
							tick={tick}
							tickFormatter={v => `${v} %`}
						/>
						<YAxis
							dataKey="mu"
							type="number"
							domain={[0, 10]}
							ticks={[0, 2, 4, 6, 8, 10]}
							tick={tick}
							width={36}
							allowDataOverflow
						/>
						<Line
							data={cml}
							dataKey="mu"
							stroke={AMBER}
							strokeDasharray="5 4"
							dot={false}
							isAnimationActive={false}
							legendType="none"
						/>
						<Line
							data={curve}
							dataKey="mu"
							stroke={NEUTRAL}
							strokeWidth={2.5}
							dot={false}
							isAnimationActive={false}
						/>
						<ReferenceDot
							x={minP.sigma}
							y={minP.mu}
							r={6}
							fill={GOOD}
							stroke="none"
						/>
						<ReferenceDot
							x={tanP.sigma}
							y={tanP.mu}
							r={6}
							fill={AMBER}
							stroke="none"
						/>
						<ReferenceDot
							x={cur.sigma}
							y={cur.mu}
							r={7}
							fill={BAD}
							stroke="var(--card)"
							strokeWidth={2}
						/>
						<ReferenceLine y={RF} stroke={GRID} />
					</LineChart>
				</ResponsiveContainer>
			</div>
			<div className="mt-3 flex gap-3">
				<Stat label="Rendite" value={pct(cur.mu)} />
				<Stat label="Risiko σ" value={pct(cur.sigma)} />
				<Stat label="Sharpe" value={num((cur.mu - RF) / cur.sigma, 2)} />
			</div>
			<div className="mt-2 text-xs text-muted-foreground">
				Minimales Risiko bei {num(minI, 0)} % Aktien, beste Sharpe Ratio bei{" "}
				{num(tanI, 0)} % Aktien.
			</div>
			<Labeled label={`Korrelation Aktien/Anleihen: ${num(rho, 2)}`}>
				<Slider
					aria-label="Korrelation"
					min={-1}
					max={1}
					step={0.05}
					value={[rho]}
					onValueChange={v => setRho(first(v))}
				/>
			</Labeled>
			<Labeled label={`Aktienanteil: ${w} %`}>
				<Slider
					aria-label="Aktienanteil in Prozent"
					min={0}
					max={100}
					step={1}
					value={[w]}
					onValueChange={v => setW(first(v))}
				/>
			</Labeled>
		</Frame>
	)
}

/** Lesson 5: Security Market Line with an adjustable beta. */
export function SecurityMarketLine() {
	const [beta, setBeta] = useState(1.2)
	const rf = 2
	const rm = 8
	const exp = rf + beta * (rm - rf)
	const data = [0, 2].map(b => ({ b, r: rf + b * (rm - rf) }))
	return (
		<Frame note="Risikofreier Zins 2 %, erwartete Marktrendite 8 %. Die Gerade ist die Wertpapierlinie (Security Market Line).">
			<div className="h-52 w-full">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart
						data={data}
						margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
					>
						<CartesianGrid stroke={GRID} />
						<XAxis
							dataKey="b"
							type="number"
							domain={[0, 2]}
							ticks={[0, 0.5, 1, 1.5, 2]}
							tick={tick}
							tickFormatter={v => num(v, 1)}
						/>
						<YAxis
							domain={[0, 16]}
							ticks={[0, 4, 8, 12, 16]}
							tick={tick}
							width={36}
							tickFormatter={v => `${v} %`}
						/>
						<Line
							dataKey="r"
							stroke={NEUTRAL}
							strokeWidth={2.5}
							dot={false}
							isAnimationActive={false}
						/>
						<ReferenceDot x={1} y={rm} r={5} fill={GOOD} stroke="none" />
						<ReferenceDot
							x={beta}
							y={exp}
							r={7}
							fill={BAD}
							stroke="var(--card)"
							strokeWidth={2}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
			<div className="mt-3 flex gap-3">
				<Stat label="Beta" value={num(beta, 2)} />
				<Stat label="Erwartete Rendite" value={pct(exp)} />
			</div>
			<Labeled label="Beta einstellen (grüner Punkt: der Markt, Beta = 1)">
				<Slider
					aria-label="Beta"
					min={0}
					max={2}
					step={0.1}
					value={[beta]}
					onValueChange={v => setBeta(first(v))}
				/>
			</Labeled>
		</Frame>
	)
}

/** Lesson 5: portfolio volatility of n equally weighted stocks (each 30 %, pairwise rho 0.3). */
export function DiversificationCurve() {
	const s = 30
	const rho = 0.3
	const data = Array.from({ length: 30 }, (_, i) => {
		const n = i + 1
		return { n, v: s * Math.sqrt(1 / n + (1 - 1 / n) * rho) }
	})
	const floor = s * Math.sqrt(rho)
	return (
		<Frame note="Jede Aktie hat 30 % Volatilität, paarweise Korrelation 0,3. Mit mehr Aktien verschwindet das unsystematische Risiko, das systematische bleibt (gestrichelt: ca. 16,4 %).">
			<div className="h-52 w-full">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart
						data={data}
						margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
					>
						<CartesianGrid stroke={GRID} vertical={false} />
						<XAxis
							dataKey="n"
							type="number"
							domain={[1, 30]}
							ticks={[1, 5, 10, 20, 30]}
							tick={tick}
						/>
						<YAxis
							domain={[0, 35]}
							ticks={[0, 10, 20, 30]}
							tick={tick}
							width={36}
							tickFormatter={v => `${v} %`}
						/>
						<ReferenceLine y={floor} stroke={BAD} strokeDasharray="5 4" />
						<Line
							dataKey="v"
							stroke={NEUTRAL}
							strokeWidth={2.5}
							dot={false}
							isAnimationActive={false}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
			<div className="mt-1 text-center text-xs text-muted-foreground">
				Anzahl der Aktien im Portfolio
			</div>
		</Frame>
	)
}

function cdf(x: number): number {
	// Abramowitz-Stegun approximation of the standard normal CDF
	const t = 1 / (1 + 0.2316419 * Math.abs(x))
	const d = 0.3989423 * Math.exp((-x * x) / 2)
	const p =
		d *
		t *
		(0.3193815 +
			t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
	return x > 0 ? 1 - p : p
}

/** Black-Scholes call value (r = 2 %), for illustration of the Greeks only. */
function bsCall(S: number, K: number, T: number, sigma: number) {
	const r = 0.02
	const d1 =
		(Math.log(S / K) + (r + (sigma * sigma) / 2) * T) / (sigma * Math.sqrt(T))
	const d2 = d1 - sigma * Math.sqrt(T)
	return { value: S * cdf(d1) - K * Math.exp(-r * T) * cdf(d2), delta: cdf(d1) }
}

/** Lesson 6: payoff at expiry for long call / long put, adjustable price at expiry. */
export function OptionPayoff() {
	const [kind, setKind] = useState<"call" | "put">("call")
	const [price, setPrice] = useState(112)
	const K = 100
	const premium = 5
	const profit = (s: number) =>
		(kind === "call" ? Math.max(s - K, 0) : Math.max(K - s, 0)) - premium
	const data = [60, K - premium, K, K + premium, 140].map(s => ({
		s,
		p: profit(s),
	}))
	const cur = profit(price)
	return (
		<Frame note="Basispreis 100, Prämie 5 (das kostet die Option). Die Linie zeigt Deinen Gewinn oder Verlust bei Fälligkeit je Aktie.">
			<div className="mb-2 flex gap-2">
				<Button
					type="button"
					size="sm"
					variant={kind === "call" ? "default" : "outline"}
					onClick={() => setKind("call")}
				>
					Call
				</Button>
				<Button
					type="button"
					size="sm"
					variant={kind === "put" ? "default" : "outline"}
					onClick={() => setKind("put")}
				>
					Put
				</Button>
			</div>
			<div className="h-52 w-full">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart
						data={data}
						margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
					>
						<CartesianGrid stroke={GRID} />
						<XAxis
							dataKey="s"
							type="number"
							domain={[60, 140]}
							ticks={[60, 80, 100, 120, 140]}
							tick={tick}
						/>
						<YAxis
							domain={[-10, 40]}
							ticks={[-10, 0, 10, 20, 30, 40]}
							tick={tick}
							width={32}
						/>
						<ReferenceLine y={0} stroke={GRID} />
						<ReferenceLine x={K} stroke={GRID} strokeDasharray="4 4" />
						<Line
							dataKey="p"
							stroke={NEUTRAL}
							strokeWidth={2.5}
							dot={false}
							isAnimationActive={false}
						/>
						<ReferenceDot
							x={price}
							y={cur}
							r={7}
							fill={cur >= 0 ? GOOD : BAD}
							stroke="var(--card)"
							strokeWidth={2}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
			<div className="mt-3 flex gap-3">
				<Stat label="Aktienkurs bei Fälligkeit" value={num(price, 0)} />
				<Stat label="Gewinn / Verlust" value={num(cur, 0)} />
			</div>
			<Labeled label="Aktienkurs bei Fälligkeit">
				<Slider
					aria-label="Aktienkurs bei Fälligkeit"
					min={60}
					max={140}
					step={1}
					value={[price]}
					onValueChange={v => setPrice(first(v))}
				/>
			</Labeled>
		</Frame>
	)
}

/** Lesson 6: call value today vs. intrinsic value, with Delta as slope. */
export function DeltaCurve() {
	const [S, setS] = useState(100)
	const K = 100
	const data = Array.from({ length: 41 }, (_, i) => {
		const s = 60 + 2 * i
		return {
			s,
			today: bsCall(s, K, 0.5, 0.25).value,
			expiry: Math.max(s - K, 0),
		}
	})
	const cur = bsCall(S, K, 0.5, 0.25)
	return (
		<Frame note="Call mit Basispreis 100, 6 Monate Restlaufzeit, 25 % Volatilität (Black-Scholes, nur zur Illustration). Delta ist die Steigung der Kurve am Punkt.">
			<div className="h-52 w-full">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart
						data={data}
						margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
					>
						<CartesianGrid stroke={GRID} />
						<XAxis
							dataKey="s"
							type="number"
							domain={[60, 140]}
							ticks={[60, 80, 100, 120, 140]}
							tick={tick}
						/>
						<YAxis
							domain={[0, 40]}
							ticks={[0, 10, 20, 30, 40]}
							tick={tick}
							width={32}
						/>
						<Line
							dataKey="expiry"
							stroke="var(--muted-foreground)"
							strokeDasharray="5 4"
							dot={false}
							isAnimationActive={false}
						/>
						<Line
							dataKey="today"
							stroke={NEUTRAL}
							strokeWidth={2.5}
							dot={false}
							isAnimationActive={false}
						/>
						<ReferenceDot
							x={S}
							y={cur.value}
							r={7}
							fill={BAD}
							stroke="var(--card)"
							strokeWidth={2}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
			<div className="mt-3 flex gap-3">
				<Stat label="Aktienkurs" value={num(S, 0)} />
				<Stat label="Optionswert" value={num(cur.value, 1)} />
				<Stat label="Delta" value={num(cur.delta, 2)} />
			</div>
			<Labeled label="Aktienkurs heute (gestrichelt: Wert bei Fälligkeit)">
				<Slider
					aria-label="Aktienkurs"
					min={60}
					max={140}
					step={1}
					value={[S]}
					onValueChange={v => setS(first(v))}
				/>
			</Labeled>
		</Frame>
	)
}
