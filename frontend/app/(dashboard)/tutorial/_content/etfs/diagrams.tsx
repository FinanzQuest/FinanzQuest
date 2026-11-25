"use client"

import { useState } from "react"
import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts"
import { Slider } from "@/components/ui/slider"
import { numberFormat } from "@/lib/util"

const PRIMARY = "var(--foreground)"
const SECONDARY = "var(--chart-2)"
const one = (v: number | readonly number[]) =>
	Array.isArray(v) ? (v[0] ?? 0) : (v as number)
const TICK = { fill: "var(--muted-foreground)", fontSize: 11 }

const eur = (v: unknown) => `${numberFormat.format(Math.round(Number(v)))} €`

function Frame({
	children,
	note,
}: {
	children: React.ReactNode
	note?: string
}) {
	return (
		<div className="flex flex-col gap-2 rounded-2xl border bg-card p-3">
			{children}
			{note && <p className="text-xs text-muted-foreground">{note}</p>}
		</div>
	)
}

/** Horizontal bars, one value per row (percent). */
export function HBars({
	data,
	height,
	note,
	unit = " %",
}: {
	data: { name: string; value: number }[]
	height?: number
	note?: string
	unit?: string
}) {
	return (
		<Frame note={note}>
			<div style={{ height: height ?? data.length * 30 + 20 }}>
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={data}
						layout="vertical"
						margin={{ left: 0, right: 16, top: 0, bottom: 0 }}
					>
						<XAxis type="number" hide />
						<YAxis
							type="category"
							dataKey="name"
							width={96}
							tick={TICK}
							axisLine={false}
							tickLine={false}
						/>
						<Tooltip
							formatter={v => `${numberFormat.format(Number(v))}${unit}`}
							cursor={{ fill: "var(--muted)" }}
						/>
						<Bar
							dataKey="value"
							name="Anteil"
							fill={PRIMARY}
							radius={4}
							label={{
								position: "right",
								fontSize: 11,
								fill: "var(--muted-foreground)",
								formatter: (v: unknown) =>
									`${numberFormat.format(Number(v))}${unit}`,
							}}
						/>
					</BarChart>
				</ResponsiveContainer>
			</div>
		</Frame>
	)
}

/** Vertical grouped bars with two series. */
export function CompareBars({
	data,
	a,
	b,
	note,
	unit = "%",
}: {
	data: { name: string; a: number; b: number }[]
	a: string
	b: string
	note?: string
	unit?: string
}) {
	return (
		<Frame note={note}>
			<div className="h-56">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart data={data} margin={{ left: -16, right: 8, top: 8 }}>
						<CartesianGrid vertical={false} stroke="var(--border)" />
						<XAxis
							dataKey="name"
							tick={TICK}
							axisLine={false}
							tickLine={false}
						/>
						<YAxis tick={TICK} axisLine={false} tickLine={false} unit={unit} />
						<Tooltip
							formatter={v => `${numberFormat.format(Number(v))} ${unit}`}
							cursor={{ fill: "var(--muted)" }}
						/>
						<Legend wrapperStyle={{ fontSize: 12 }} />
						<Bar dataKey="a" name={a} fill={PRIMARY} radius={[4, 4, 0, 0]} />
						<Bar dataKey="b" name={b} fill={SECONDARY} radius={[4, 4, 0, 0]} />
					</BarChart>
				</ResponsiveContainer>
			</div>
		</Frame>
	)
}

const FIRMS = [
	{ name: "Alpha", cap: 500 },
	{ name: "Beta", cap: 300 },
	{ name: "Gamma", cap: 150 },
	{ name: "Delta", cap: 50 },
]

/** Mini index of four fictional firms: cap-weighted vs equal-weighted. */
export function IndexBuilder() {
	const [moves, setMoves] = useState([10, 0, 0, -20])
	const totalCap = FIRMS.reduce((s, f) => s + f.cap, 0)
	const capRet = FIRMS.reduce((s, f, i) => s + (f.cap / totalCap) * moves[i], 0)
	const eqRet = moves.reduce((s, m) => s + m, 0) / FIRMS.length
	const data = FIRMS.map(f => ({
		name: f.name,
		a: Math.round((f.cap / totalCap) * 100),
		b: 100 / FIRMS.length,
	}))
	return (
		<div className="flex flex-col gap-3">
			<CompareBars
				data={data}
				a="Marktkap.-gewichtet"
				b="Gleichgewichtet"
				note="Gewichte im Index in %. Marktkapitalisierung: 500 / 300 / 150 / 50 Mrd. € (erfunden)."
			/>
			<div className="flex flex-col gap-4 rounded-2xl border bg-card p-4">
				{FIRMS.map((f, i) => (
					<div key={f.name} className="flex flex-col gap-2">
						<div className="flex justify-between text-sm">
							<span>{f.name} Kurs</span>
							<span className="font-semibold tabular-nums">
								{moves[i] > 0 ? "+" : ""}
								{moves[i]} %
							</span>
						</div>
						<Slider
							min={-50}
							max={50}
							step={5}
							value={[moves[i]]}
							onValueChange={v =>
								setMoves(m => m.map((x, j) => (j === i ? one(v) : x)))
							}
						/>
					</div>
				))}
				<div className="grid grid-cols-2 gap-3 text-center text-sm">
					<div className="rounded-xl bg-muted p-3">
						<div className="text-xs text-muted-foreground">Marktkap.-Index</div>
						<div className="text-lg font-bold tabular-nums">
							{numberFormat.format(capRet)} %
						</div>
					</div>
					<div className="rounded-xl bg-muted p-3">
						<div className="text-xs text-muted-foreground">Gleichgewichtet</div>
						<div className="text-lg font-bold tabular-nums">
							{numberFormat.format(eqRet)} %
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

/** 30 years, 10.000 EUR at 6 % gross: ETF with chosen TER vs. 0 % costs. */
export function FeeDrag() {
	const [ter, setTer] = useState(0.2)
	const gross = 6
	const data = Array.from({ length: 31 }, (_, y) => ({
		year: y,
		free: 10000 * (1 + gross / 100) ** y,
		costly: 10000 * (1 + (gross - ter) / 100) ** y,
	}))
	const last = data[30]
	const lost = last.free - last.costly
	return (
		<div className="flex flex-col gap-3">
			<Frame note="Annahme: 6 % Rendite pro Jahr vor Kosten, 10.000 € Einmalanlage. Nur ein Rechenbeispiel, keine Prognose.">
				<div className="h-56">
					<ResponsiveContainer width="100%" height="100%">
						<LineChart data={data} margin={{ left: -8, right: 8, top: 8 }}>
							<CartesianGrid vertical={false} stroke="var(--border)" />
							<XAxis
								dataKey="year"
								tick={TICK}
								axisLine={false}
								tickLine={false}
								unit=" J."
							/>
							<YAxis
								tick={TICK}
								axisLine={false}
								tickLine={false}
								tickFormatter={v => `${Math.round(Number(v) / 1000)}k`}
							/>
							<Tooltip formatter={eur} labelFormatter={l => `Jahr ${l}`} />
							<Legend wrapperStyle={{ fontSize: 12 }} />
							<Line
								dataKey="free"
								name="ohne Kosten"
								stroke={SECONDARY}
								dot={false}
								strokeWidth={2}
							/>
							<Line
								dataKey="costly"
								name={`mit ${numberFormat.format(ter)} % TER`}
								stroke={PRIMARY}
								dot={false}
								strokeWidth={2}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>
			</Frame>
			<div className="flex flex-col gap-3 rounded-2xl border bg-card p-4">
				<div className="flex justify-between text-sm">
					<span>Jährliche Kosten (TER)</span>
					<span className="font-semibold tabular-nums">
						{numberFormat.format(ter)} %
					</span>
				</div>
				<Slider
					min={0}
					max={2}
					step={0.05}
					value={[ter]}
					onValueChange={v => setTer(one(v))}
				/>
				<p className="text-sm text-muted-foreground">
					Nach 30 Jahren fehlen dir{" "}
					<strong className="text-foreground">{eur(lost)}</strong> (
					{numberFormat.format((lost / last.free) * 100)} % des Endwerts).
				</p>
			</div>
		</div>
	)
}
