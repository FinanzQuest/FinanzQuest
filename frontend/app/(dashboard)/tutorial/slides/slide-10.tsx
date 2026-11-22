"use client"

import { useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { currencyFormat } from "@/lib/cash_display_string"
import { numberFormat } from "@/lib/util"
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
	Callout,
	Em,
	Figure,
	SlideHeader,
	SlideLayout,
	SliderField,
	SliderGrid,
	Stat,
	StatRow,
	Text,
} from "./slide-layout"

function calcSparplan(monthly: number, rate: number, years: number) {
	// yearly snapshots: paid in vs. gained through compound interest
	let value = 0
	const data = []
	for (let y = 1; y <= years; y++) {
		for (let m = 0; m < 12; m++) {
			value = (value + monthly) * (1 + rate / 100 / 12)
		}
		const eingezahlt = monthly * 12 * y
		data.push({
			year: y,
			eingezahlt,
			zinseszins: Math.round(value - eingezahlt),
		})
	}
	return data
}

const chartConfig = {
	eingezahlt: { label: "Eingezahlt", color: "var(--muted-foreground)" },
	zinseszins: { label: "Zinseszins", color: "var(--win)" },
} satisfies ChartConfig

export function Slide10() {
	const [monthly, setMonthly] = useState(100)
	const [rate, setRate] = useState(7)
	const [years, setYears] = useState(30)

	const data = calcSparplan(monthly, rate, years)
	const last = data[data.length - 1]
	const endValue = last.eingezahlt + last.zinseszins

	// every 5th year (and the last one) keeps the bars readable
	const chartData = data.filter(d => d.year % 5 === 0 || d.year === years)

	return (
		<SlideLayout>
			<SlideHeader
				title="Der Sparplan - regelmäßig investieren"
				subtitle="Vermögensaufbau beginnt nicht mit einem großen Einmalbetrag, sondern mit einem Teil des monatlichen Gehalts."
			/>

			<Text>
				Die wenigsten haben gleich zu Beginn mehrere Tausend Euro zur Verfügung.
				Das ist auch gar nicht nötig: Ein <Em>Sparplan</Em> legt automatisch
				jeden Monat einen festen Betrag in einen ETF an - z. B. 50 € oder 150 €
				aus dem Gehalt.
			</Text>

			<Figure title="Sparplan-Rechner">
				<StatRow>
					<Stat
						size="lg"
						label={`Endwert nach ${years} Jahren`}
						value={currencyFormat.format(endValue)}
					/>
					<Stat
						label="Eigene Einzahlungen"
						value={currencyFormat.format(last.eingezahlt)}
						tone="muted"
					/>
					<Stat
						label="Zinseszins-Gewinn"
						value={`+${currencyFormat.format(last.zinseszins)}`}
						tone="win"
					/>
				</StatRow>

				<SlideChart config={chartConfig}>
					<BarChart data={chartData} margin={{ top: 4, right: 4, left: 0 }}>
						<CartesianGrid {...gridProps} />
						<XAxis
							dataKey="year"
							{...axisProps}
							tickFormatter={v => `${v} J.`}
						/>
						<YAxis {...axisProps} width={72} tickFormatter={moneyTick} />
						<ChartTooltip
							cursor={{ fill: "var(--muted)", opacity: 0.5 }}
							content={
								<SlideTooltipContent
									config={chartConfig}
									xKey="year"
									labelPrefix="Jahr"
								/>
							}
						/>
						<ChartLegend content={<ChartLegendContent />} />
						<Bar
							isAnimationActive={false}
							dataKey="eingezahlt"
							stackId="a"
							fill="var(--color-eingezahlt)"
							fillOpacity={0.6}
							radius={[0, 0, 4, 4]}
						/>
						<Bar
							isAnimationActive={false}
							dataKey="zinseszins"
							stackId="a"
							fill="var(--color-zinseszins)"
							radius={[4, 4, 0, 0]}
						/>
					</BarChart>
				</SlideChart>

				<SliderGrid>
					<SliderField
						label="Monatliche Rate"
						display={currencyFormat.format(monthly)}
						value={monthly}
						onChange={setMonthly}
						min={25}
						max={500}
						step={25}
					/>
					<SliderField
						label="Rendite"
						display={`${numberFormat.format(rate)} %`}
						value={rate}
						onChange={setRate}
						min={1}
						max={12}
						step={0.5}
					/>
					<SliderField
						label="Laufzeit"
						display={`${years} Jahre`}
						value={years}
						onChange={setYears}
						min={5}
						max={45}
						step={1}
					/>
				</SliderGrid>
			</Figure>

			<Callout variant="takeaway">
				Disziplin durch Automatisierung: Der Betrag wird monatlich abgebucht,
				bevor du ihn ausgeben kannst. So entsteht Vermögen ohne aktive
				Entscheidung jeden Monat.
			</Callout>
		</SlideLayout>
	)
}
