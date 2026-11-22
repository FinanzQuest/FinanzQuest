"use client"

import { useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { currencyFormat } from "@/lib/cash_display_string"
import { numberFormat } from "@/lib/util"
import {
	axisProps,
	type ChartConfig,
	ChartTooltip,
	gridProps,
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

function calcPurchasingPower(startAmount: number, rate: number, years: number) {
	return Array.from({ length: years + 1 }, (_, i) => ({
		year: i,
		kaufkraft: Math.round(startAmount * (1 - rate / 100) ** i),
	}))
}

const chartConfig = {
	kaufkraft: { label: "Kaufkraft", color: "var(--loss)" },
} satisfies ChartConfig

export function Slide02() {
	const [rate, setRate] = useState(2.3)
	const [years, setYears] = useState(30)

	const data = calcPurchasingPower(100, rate, years)
	const finalValue = data[data.length - 1].kaufkraft

	return (
		<SlideLayout>
			<SlideHeader
				eyebrow="Grundlagen"
				title="Inflation und Kaufkraft"
				subtitle="Inflation bedeutet: Preise steigen - und dein Geld wird dadurch Jahr für Jahr weniger wert."
			/>

			<Text>
				Ein Beispiel aus dem Alltag: Eine Kinokarte hat vor 20 Jahren ca. 5 €
				gekostet, heute oft 15 €. Der Betrag auf deinem Konto bleibt gleich -
				aber du kannst damit weniger kaufen als früher. Diesen Effekt nennt man{" "}
				<Em>Kaufkraftverlust</Em>.
			</Text>

			<Figure
				title="Kaufkraft von 100 € über die Zeit"
				description="Was 100 € von heute in Zukunft noch wert sind."
			>
				<StatRow>
					<Stat
						size="lg"
						label={`Nach ${years} Jahren`}
						value={currencyFormat.format(finalValue)}
						tone="loss"
					/>
					<Stat
						label="Verlust"
						value={currencyFormat.format(finalValue - 100)}
						tone="muted"
					/>
				</StatRow>

				<SlideChart config={chartConfig}>
					<AreaChart data={data} margin={{ top: 4, right: 4, left: 0 }}>
						<defs>
							<linearGradient id="kaufkraftFill" x1="0" y1="0" x2="0" y2="1">
								<stop
									offset="5%"
									stopColor="var(--color-kaufkraft)"
									stopOpacity={0.3}
								/>
								<stop
									offset="95%"
									stopColor="var(--color-kaufkraft)"
									stopOpacity={0}
								/>
							</linearGradient>
						</defs>
						<CartesianGrid {...gridProps} />
						<XAxis dataKey="year" {...axisProps} />
						<YAxis
							{...axisProps}
							width={48}
							domain={[0, 100]}
							tickFormatter={v => currencyFormat.format(v)}
						/>
						<ChartTooltip
							content={
								<SlideTooltipContent
									config={chartConfig}
									xKey="year"
									labelPrefix="Jahr"
								/>
							}
						/>
						<Area
							type="monotone"
							dataKey="kaufkraft"
							stroke="var(--color-kaufkraft)"
							strokeWidth={2}
							fill="url(#kaufkraftFill)"
							isAnimationActive={false}
						/>
					</AreaChart>
				</SlideChart>

				<SliderGrid>
					<SliderField
						label="Inflationsrate"
						display={`${numberFormat.format(rate)} %`}
						value={rate}
						onChange={setRate}
						min={1}
						max={5}
						step={0.1}
					/>
					<SliderField
						label="Zeitraum"
						display={`${years} Jahre`}
						value={years}
						onChange={setYears}
						min={1}
						max={50}
						step={1}
					/>
				</SliderGrid>
			</Figure>

			<Callout variant="takeaway">
				Geld auf einem niedrig verzinsten Konto zu lassen ist keine neutrale
				Entscheidung - real bedeutet es einen schleichenden Wertverlust von Jahr
				zu Jahr. Die Lösung: Geld so anlegen, dass es mehr wächst als die
				Inflation steigt.
			</Callout>
		</SlideLayout>
	)
}
