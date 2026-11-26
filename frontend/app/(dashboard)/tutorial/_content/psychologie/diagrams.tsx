"use client"

import { useState } from "react"
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Line,
	LineChart,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts"
import { cn } from "@/lib/utils"
import { BLUE, eur, GREEN, interpolate, RED } from "./shared"

const box = "rounded-xl border border-border bg-card p-4 space-y-3"

// ---- Missing the best days ------------------------------------------------

const bestDays = [
	{ label: "Immer dabei", value: 10 },
	{ label: "10 beste Tage verpasst", value: 6 },
	{ label: "20 verpasst", value: 3 },
	{ label: "30 verpasst", value: 1 },
	{ label: "40 verpasst", value: -1 },
]

export function MissingBestDays() {
	return (
		<div className={box}>
			<div className="text-sm font-medium">Rendite pro Jahr (ca.)</div>
			<div
				className="h-48 w-full"
				role="img"
				aria-label="Rendite pro Jahr, je mehr der besten Börsentage fehlen, desto niedriger"
			>
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={bestDays}
						margin={{ top: 8, right: 8, bottom: 0, left: -20 }}
					>
						<CartesianGrid
							strokeDasharray="3 3"
							opacity={0.3}
							vertical={false}
						/>
						<XAxis
							dataKey="label"
							tick={{ fontSize: 10 }}
							interval={0}
							tickFormatter={l => l.split(" ")[0]}
						/>
						<YAxis unit=" %" tick={{ fontSize: 11 }} />
						<Bar dataKey="value" isAnimationActive={false}>
							{bestDays.map(d => (
								<Cell key={d.label} fill={d.value < 0 ? RED : GREEN} />
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			</div>
			<p className="text-xs text-muted-foreground">
				Gerundete Größenordnung für den S&amp;P 500 über ca. 20 Jahre, nach
				Auswertungen von J.P. Morgan Asset Management. Genaue Werte hängen vom
				Zeitraum ab. Balken: Immer dabei, 10, 20, 30, 40 beste Tage verpasst.
			</p>
		</div>
	)
}

// ---- Lump sum vs Sparplan ---------------------------------------------------

const MONTHS = 24
const TOTAL = 12000

const scenarios = {
	up: {
		label: "Steigend",
		knots: [
			[0, 100],
			[24, 130],
		],
	},
	crash: {
		label: "Crash, dann Erholung",
		knots: [
			[0, 100],
			[8, 60],
			[24, 105],
		],
	},
	flat: {
		label: "Seitwärts",
		knots: [
			[0, 100],
			[6, 112],
			[12, 96],
			[18, 110],
			[24, 100],
		],
	},
} satisfies Record<string, { label: string; knots: [number, number][] }>

type ScenarioId = keyof typeof scenarios

export function LumpVsSparplan() {
	const [id, setId] = useState<ScenarioId>("up")
	const prices = interpolate(scenarios[id].knots, MONTHS)
	const end = prices[MONTHS]
	const lump = (TOTAL / prices[0]) * end
	const rate = TOTAL / MONTHS
	let units = 0
	for (let m = 0; m < MONTHS; m++) units += rate / prices[m]
	const plan = units * end
	const data = prices.map((v, m) => ({ m, v }))
	return (
		<div className={box}>
			<div className="flex flex-wrap gap-2">
				{(Object.keys(scenarios) as ScenarioId[]).map(k => (
					<button
						key={k}
						type="button"
						aria-pressed={k === id}
						onClick={() => setId(k)}
						className={cn(
							"rounded-full border px-3 py-1.5 text-xs font-medium transition-colors motion-reduce:transition-none",
							k === id
								? "border-foreground bg-foreground text-background"
								: "border-border text-muted-foreground hover:text-foreground"
						)}
					>
						{scenarios[k].label}
					</button>
				))}
			</div>
			<div
				className="h-32 w-full"
				role="img"
				aria-label="Kursverlauf des gewählten Szenarios"
			>
				<ResponsiveContainer width="100%" height="100%">
					<LineChart
						data={data}
						margin={{ top: 8, right: 8, bottom: 0, left: -20 }}
					>
						<CartesianGrid strokeDasharray="3 3" opacity={0.3} />
						<XAxis dataKey="m" tick={{ fontSize: 11 }} />
						<YAxis domain={[50, 140]} tick={{ fontSize: 11 }} />
						<Line
							dataKey="v"
							stroke={BLUE}
							strokeWidth={2}
							dot={false}
							isAnimationActive={false}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
			<div className="grid grid-cols-2 gap-2 text-center">
				<Result
					label={`Einmalanlage ${eur(TOTAL)}`}
					value={lump}
					best={lump >= plan}
				/>
				<Result
					label={`Sparplan ${eur(rate)} x ${MONTHS}`}
					value={plan}
					best={plan > lump}
				/>
			</div>
			<p className="text-xs text-muted-foreground">
				Vereinfachte Szenarien, keine Prognose. Beide investieren insgesamt{" "}
				{eur(TOTAL)}.
			</p>
		</div>
	)
}

function Result({
	label,
	value,
	best,
}: {
	label: string
	value: number
	best: boolean
}) {
	return (
		<div
			className={cn(
				"rounded-lg p-3",
				best ? "bg-emerald-500/15" : "bg-muted/50"
			)}
		>
			<div className="text-base font-semibold tabular-nums">{eur(value)}</div>
			<div className="text-[11px] text-muted-foreground leading-tight">
				{label}
			</div>
		</div>
	)
}

// ---- Rebalancing --------------------------------------------------------------

const BOND_RETURN = 2

export function RebalanceDemo() {
	const [stockReturn, setStockReturn] = useState(30)
	const [balanced, setBalanced] = useState(false)
	const stocks = 7000 * (1 + stockReturn / 100)
	const bonds = 3000 * (1 + BOND_RETURN / 100)
	const total = stocks + bonds
	const share = stocks / total
	const shown = balanced ? 0.7 : share
	const trade = stocks - total * 0.7
	return (
		<div className={box}>
			<label className="block text-sm">
				Aktien-Rendite im Jahr:{" "}
				<span className="font-semibold">{stockReturn} %</span>
				<input
					type="range"
					min={-40}
					max={40}
					step={5}
					value={stockReturn}
					onChange={e => {
						setStockReturn(Number(e.target.value))
						setBalanced(false)
					}}
					className="mt-2 w-full"
				/>
			</label>
			<div
				className="flex h-8 w-full overflow-hidden rounded-lg text-xs font-medium text-white"
				role="img"
				aria-label={`Aktienanteil ${Math.round(shown * 100)} Prozent`}
			>
				<div
					className="flex items-center justify-center transition-[width] duration-500 motion-reduce:transition-none"
					style={{ width: `${shown * 100}%`, background: BLUE }}
				>
					Aktien {Math.round(shown * 100)} %
				</div>
				<div className="flex flex-1 items-center justify-center bg-slate-500">
					Anleihen {Math.round((1 - shown) * 100)} %
				</div>
			</div>
			<p className="text-sm text-foreground/75">
				Start: 7.000 € Aktien und 3.000 € Anleihen (70/30). Anleihen bringen{" "}
				{BOND_RETURN} %. Depotwert jetzt: {eur(total)}.
			</p>
			<button
				type="button"
				onClick={() => setBalanced(b => !b)}
				disabled={Math.abs(trade) < 1}
				className="rounded-lg border border-border px-3 py-2 text-sm font-medium disabled:opacity-50"
			>
				{balanced ? "Zurück zum Drift" : "Rebalancen auf 70/30"}
			</button>
			{balanced && (
				<p className="text-sm">
					{trade > 0
						? `Verkaufe Aktien für ${eur(trade)} und kaufe Anleihen.`
						: `Verkaufe Anleihen für ${eur(-trade)} und kaufe Aktien.`}
				</p>
			)}
		</div>
	)
}
