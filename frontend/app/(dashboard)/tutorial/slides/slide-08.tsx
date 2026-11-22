"use client"

import { useCallback, useState } from "react"
import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts"
import { Button } from "@/components/ui/button"
import { SlideHeader, SlideLayout, SlideSection } from "./slide-layout"

/** Seeded PRNG (mulberry32): the first render is deterministic, so the
 * slide can be prerendered; "neu simulieren" picks a new seed. */
function prng(seed: number) {
	let a = seed >>> 0
	return () => {
		a = (a + 0x6d2b79f5) >>> 0
		let t = a
		t = Math.imul(t ^ (t >>> 15), t | 1)
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296
	}
}

// Monte-Carlo-Sim basically
function randomWalk(
	random: () => number,
	steps: number,
	volatility: number,
	trend: number,
	start: number
) {
	let value = start
	const series = [{ month: 0, value: start }]
	for (let i = 1; i <= steps; i++) {
		const shock = (random() * 2.0 - 1.0) * volatility
		value = value * (1 + trend + shock)
		series.push({ month: i, value: Math.max(0, Math.round(value)) })
	}
	return series
}

// Average of n monte-carlo walks
function avgWalk(
	random: () => number,
	n: number,
	steps: number,
	volatility: number,
	trend: number,
	start: number
) {
	const walks = Array.from({ length: n }, () =>
		randomWalk(random, steps, volatility, trend, start)
	)
	// + 1 to include the initial value
	return Array.from({ length: steps + 1 }, (_, i) => {
		const avgValue = walks.reduce((sum, w) => sum + w[i].value, 0) / n
		return {
			month: i + 1,
			value: Math.round(avgValue),
		}
	})
}

function generateData(seed: number) {
	const random = prng(seed)
	const steps = 36
	const start = 1000
	return {
		single: randomWalk(random, steps, 0.18, 0.004, start),
		portfolio: avgWalk(random, 20, steps, 0.18, 0.004, start),
	}
}

const INITIAL_SEED = 20261122

export function Slide08() {
	const [simData, setSimData] = useState(() => generateData(INITIAL_SEED))

	// event handler: a fresh random seed is fine here (not during render)
	const rerun = useCallback(
		() => setSimData(generateData(Math.floor(Math.random() * 2 ** 32))),
		[]
	)

	const chartData = simData.single.map((d, i) => ({
		month: d.month,
		Einzelaktie: d.value,
		Portfolio: simData.portfolio[i].value,
	}))

	return (
		<SlideLayout>
			<SlideHeader
				title="Diversifikation - Risikostreuung"
				subtitle="Nicht alles auf eine Karte setzen: Das Verteilen von Kapital auf viele Anlagen senkt das Risiko erheblich."
			/>

			<SlideSection>
				<p className="text-foreground/75 text-sm leading-relaxed">
					Angenommen, du investierst dein gesamtes Geld in die Aktie eines
					einzigen Unternehmens. Geht dieses Unternehmen pleite, ist dein
					gesamtes Kapital verloren. Diversifikation löst dieses Problem: Statt
					auf ein Unternehmen zu setzen, verteilst du dein Kapital auf viele
					verschiedene Anlagen.
				</p>
			</SlideSection>

			<div className="grid grid-cols-2 gap-4">
				<div className="rounded-xl border bg-muted/40 p-4 flex flex-col gap-1">
					<span className="text-foreground font-semibold text-sm">
						1.000 € - eine Aktie
					</span>
					<p className="text-foreground/60 text-xs leading-relaxed">
						Unternehmen geht pleite → vollständiger Verlust
					</p>
					<span className="text-rose-500 font-bold mt-1">− 1.000 €</span>
				</div>
				<div className="rounded-xl border bg-muted/40 p-4 flex flex-col gap-1">
					<span className="text-foreground font-semibold text-sm">
						1.000 € - 1.000 Aktien
					</span>
					<p className="text-foreground/60 text-xs leading-relaxed">
						Ein Unternehmen geht pleite → Verlust von ca. 1 €
					</p>
					<span className="text-emerald-500 font-bold mt-1">− 1 €</span>
				</div>
			</div>

			<div
				data-no-swipe
				className="rounded-xl border bg-muted/40 p-6 flex flex-col gap-4"
			>
				<div className="flex items-center justify-between">
					<span className="text-foreground font-semibold text-sm">
						Simulation: 36 Monate Kursverlauf
					</span>
					<Button variant="outline" size="sm" onClick={rerun}>
						Neue Simulation
					</Button>
				</div>
				<ResponsiveContainer width="100%" height={200}>
					<LineChart
						data={chartData}
						margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
					>
						<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
						<XAxis
							dataKey="month"
							tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
							tickLine={false}
							label={{
								value: "Monate",
								position: "insideBottomRight",
								fill: "var(--muted-foreground)",
								fontSize: 11,
								offset: -5,
							}}
						/>
						<YAxis
							tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
							tickLine={false}
							tickFormatter={v => `${v} €`}
							width={60}
						/>
						<Tooltip
							contentStyle={{
								background: "var(--card)",
								border: "1px solid var(--border)",
								borderRadius: 8,
								fontSize: 12,
								color: "var(--foreground)",
							}}
							labelFormatter={v => `Monat ${v}`}
							formatter={(v, name) => [
								`${(v as number).toLocaleString("de-DE")} €`,
								name,
							]}
						/>
						<Legend
							wrapperStyle={{
								fontSize: 12,
								color: "var(--muted-foreground)",
							}}
						/>
						<Line
							type="monotone"
							dataKey="Einzelaktie"
							stroke="#f43f5e"
							strokeWidth={2}
							dot={false}
						/>
						<Line
							type="monotone"
							dataKey="Portfolio"
							stroke="#10b981"
							strokeWidth={2.5}
							dot={false}
						/>
					</LineChart>
				</ResponsiveContainer>
				<p className="text-muted-foreground text-xs">
					Beide Linien starten bei 1.000 €. Die Einzelaktie schwankt stark - das
					Portfolio aus 20 Aktien ist deutlich stabiler.
				</p>
			</div>
		</SlideLayout>
	)
}
