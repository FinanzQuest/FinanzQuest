"use client"

import { useState } from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
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

function calcGrowth(startCapital: number, rate: number, years: number) {
	return Array.from({ length: years + 1 }, (_, i) => ({
		year: i,
		mitZinseszins: Math.round(startCapital * (1 + rate / 100) ** i),
		ohneZinseszins: Math.round(startCapital + startCapital * (rate / 100) * i),
	}))
}

const chartConfig = {
	mitZinseszins: { label: "Mit Zinseszins", color: "var(--win)" },
	ohneZinseszins: {
		label: "Ohne Zinseszins",
		color: "var(--muted-foreground)",
	},
} satisfies ChartConfig

export function Slide04() {
	const [startCapital, setStartCapital] = useState(1000)
	const [rate, setRate] = useState(7)
	const [years, setYears] = useState(30)

	const data = calcGrowth(startCapital, rate, years)
	const withCompound = data[data.length - 1].mitZinseszins
	const withoutCompound = data[data.length - 1].ohneZinseszins

	return (
		<SlideLayout>
			<SlideHeader
				title="Der Zinseszinseffekt"
				subtitle="Zinsen auf Zinsen - über Jahrzehnte führt das zu exponentiellem Wachstum."
			/>

			<Text>
				Stell dir vor, du legst 1.000 € bei 7 % Rendite an. Nach einem Jahr hast
				du 1.070 €. Im zweiten Jahr bekommst du nicht nochmal 70 € - sondern 7 %
				auf <Em>1.070 €</Em>, also 74,90 €. Im dritten Jahr wieder 7 % auf den
				gewachsenen Betrag, und so weiter. Du bekommst also{" "}
				<Em>Zinsen auf deine Zinsen</Em>.
			</Text>

			<Figure title={`Wachstum über ${years} Jahre`}>
				<StatRow>
					<Stat
						size="lg"
						label="Mit Zinseszins"
						value={currencyFormat.format(withCompound)}
						tone="win"
					/>
					<Stat
						label="Ohne Zinseszins"
						value={currencyFormat.format(withoutCompound)}
						tone="muted"
					/>
				</StatRow>

				<SlideChart config={chartConfig}>
					<LineChart data={data} margin={{ top: 4, right: 4, left: 0 }}>
						<CartesianGrid {...gridProps} />
						<XAxis dataKey="year" {...axisProps} />
						<YAxis {...axisProps} width={72} tickFormatter={moneyTick} />
						<ChartTooltip
							content={
								<SlideTooltipContent
									config={chartConfig}
									xKey="year"
									labelPrefix="Jahr"
								/>
							}
						/>
						<ChartLegend content={<ChartLegendContent />} />
						<Line
							isAnimationActive={false}
							type="monotone"
							dataKey="ohneZinseszins"
							stroke="var(--color-ohneZinseszins)"
							strokeWidth={2}
							strokeDasharray="5 5"
							dot={false}
						/>
						<Line
							isAnimationActive={false}
							type="monotone"
							dataKey="mitZinseszins"
							stroke="var(--color-mitZinseszins)"
							strokeWidth={2.5}
							dot={false}
						/>
					</LineChart>
				</SlideChart>

				<SliderGrid>
					<SliderField
						label="Startkapital"
						display={currencyFormat.format(startCapital)}
						value={startCapital}
						onChange={setStartCapital}
						min={100}
						max={10000}
						step={100}
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
						label="Zeitraum"
						display={`${years} Jahre`}
						value={years}
						onChange={setYears}
						min={5}
						max={50}
						step={1}
					/>
				</SliderGrid>
			</Figure>

			<Callout variant="takeaway">
				Je früher du anfängst, desto länger kann der Zinseszinseffekt wirken -
				und desto größer wird der Unterschied zwischen den beiden Kurven.
			</Callout>
		</SlideLayout>
	)
}
