"use client"

import { useCallback, useState } from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { Button } from "@/components/ui/button"
import { currencyFormat } from "@/lib/cash_display_string"
import {
	axisProps,
	type ChartConfig,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	gridProps,
	moneyTick,
	SlideChart,
	SlideTooltipContent,
} from "./slide-chart"
import {
	Figure,
	SlideHeader,
	SlideLayout,
	Stat,
	StatRow,
	Text,
} from "./slide-layout"

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

const chartConfig = {
	einzelaktie: { label: "Einzelaktie", color: "var(--loss)" },
	portfolio: { label: "Portfolio (20 Aktien)", color: "var(--win)" },
} satisfies ChartConfig

export function Slide08() {
	const [simData, setSimData] = useState(() => generateData(INITIAL_SEED))

	// event handler: a fresh random seed is fine here (not during render)
	const rerun = useCallback(
		() => setSimData(generateData(Math.floor(Math.random() * 2 ** 32))),
		[]
	)

	const chartData = simData.single.map((d, i) => ({
		month: d.month,
		einzelaktie: d.value,
		portfolio: simData.portfolio[i].value,
	}))

	return (
		<SlideLayout>
			<SlideHeader
				title="Diversifikation - Risikostreuung"
				subtitle="Nicht alles auf eine Karte setzen: Das Verteilen von Kapital auf viele Anlagen senkt das Risiko erheblich."
			/>

			<Text>
				Angenommen, du investierst dein gesamtes Geld in die Aktie eines
				einzigen Unternehmens. Geht dieses Unternehmen pleite, ist dein gesamtes
				Kapital verloren. Diversifikation löst dieses Problem: Statt auf ein
				Unternehmen zu setzen, verteilst du dein Kapital auf viele verschiedene
				Anlagen.
			</Text>

			<StatRow>
				<Stat
					size="lg"
					label="1.000 € in einer Aktie"
					value={currencyFormat.format(-1000)}
					tone="loss"
					hint="Unternehmen geht pleite: vollständiger Verlust"
				/>
				<Stat
					size="lg"
					label="1.000 € in 1.000 Aktien"
					value={currencyFormat.format(-1)}
					tone="muted"
					hint="Ein Unternehmen geht pleite: Verlust von ca. 1 €"
				/>
			</StatRow>

			<Figure
				title="Simulation: 36 Monate Kursverlauf"
				description="Beide starten bei 1.000 €. Die Einzelaktie schwankt stark, das Portfolio aus 20 Aktien ist deutlich stabiler."
				action={
					<Button variant="outline" size="sm" onClick={rerun}>
						Neu simulieren
					</Button>
				}
			>
				<SlideChart config={chartConfig}>
					<LineChart data={chartData} margin={{ top: 4, right: 4, left: 0 }}>
						<CartesianGrid {...gridProps} />
						<XAxis dataKey="month" {...axisProps} />
						<YAxis {...axisProps} width={72} tickFormatter={moneyTick} />
						<ChartTooltip
							content={
								<SlideTooltipContent
									config={chartConfig}
									xKey="month"
									labelPrefix="Monat"
								/>
							}
						/>
						<ChartLegend content={<ChartLegendContent />} />
						<Line
							isAnimationActive={false}
							type="monotone"
							dataKey="einzelaktie"
							stroke="var(--color-einzelaktie)"
							strokeWidth={2}
							dot={false}
						/>
						<Line
							isAnimationActive={false}
							type="monotone"
							dataKey="portfolio"
							stroke="var(--color-portfolio)"
							strokeWidth={2.5}
							dot={false}
						/>
					</LineChart>
				</SlideChart>
			</Figure>
		</SlideLayout>
	)
}
