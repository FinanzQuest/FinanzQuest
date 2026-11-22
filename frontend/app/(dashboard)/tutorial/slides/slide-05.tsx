"use client"

import { useState } from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
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

const Y_MAX = (() => {
	const months = (65 - 18) * 12
	let value = 0
	for (let m = 0; m < months; m++) value = (value + 500) * (1 + 7 / 100 / 12)
	return Math.round(value)
})()

function calcSparplan(startAge: number, monthlyRate: number, rate: number) {
	const months = (65 - startAge) * 12
	let value = 0
	const yearlyData: { age: number; value: number }[] = []
	for (let m = 0; m < months; m++) {
		value = (value + monthlyRate) * (1 + rate / 100 / 12)
		if (m % 12 === 11) {
			yearlyData.push({
				age: startAge + Math.floor(m / 12) + 1,
				value: Math.round(value),
			})
		}
	}
	return yearlyData
}

export function Slide05() {
	const [ageA, setAgeA] = useState(25)
	const [ageB, setAgeB] = useState(35)
	const [monthly, setMonthly] = useState(100)

	const dataA = calcSparplan(ageA, monthly, 7)
	const dataB = calcSparplan(ageB, monthly, 7)

	const endA = dataA[dataA.length - 1]?.value ?? 0
	const endB = dataB[dataB.length - 1]?.value ?? 0

	// Merge into one array keyed by age for the chart
	const allAges = Array.from(
		new Set([...dataA.map(d => d.age), ...dataB.map(d => d.age)])
	).sort((a, b) => a - b)
	const chartData = allAges.map(age => ({
		age,
		A: dataA.find(d => d.age === age)?.value ?? null,
		B: dataB.find(d => d.age === age)?.value ?? null,
	}))

	const chartConfig = {
		A: { label: `Start mit ${ageA}`, color: "var(--win)" },
		B: { label: `Start mit ${ageB}`, color: "var(--muted-foreground)" },
	} satisfies ChartConfig

	return (
		<SlideLayout>
			<SlideHeader
				title="Der Faktor Zeit"
				subtitle="Zehn Jahre früher zu beginnen kann das Endergebnis mehr als verdoppeln - bei gleicher monatlicher Rate."
			/>

			<Text>
				Der Zinseszinseffekt braucht eines vor allem: <Em>Zeit</Em>. Je früher
				du anfängst, desto länger kann dein Geld wachsen - und desto größer wird
				der Unterschied.
			</Text>

			<Figure
				title="Vermögen mit 65"
				description="Monatlicher Sparplan bei 7 % Rendite pro Jahr."
			>
				<StatRow>
					<Stat
						size="lg"
						label={`Start mit ${ageA}`}
						value={currencyFormat.format(endA)}
						tone="win"
						hint={`${65 - ageA} Jahre Anlagezeit`}
					/>
					<Stat
						size="lg"
						label={`Start mit ${ageB}`}
						value={currencyFormat.format(endB)}
						tone="muted"
						hint={`${65 - ageB} Jahre Anlagezeit`}
					/>
				</StatRow>

				<SlideChart config={chartConfig}>
					<LineChart data={chartData} margin={{ top: 4, right: 4, left: 0 }}>
						<CartesianGrid {...gridProps} />
						<XAxis dataKey="age" {...axisProps} />
						<YAxis
							{...axisProps}
							width={72}
							tickFormatter={moneyTick}
							domain={[0, Y_MAX]}
						/>
						<ChartTooltip
							content={
								<SlideTooltipContent
									config={chartConfig}
									xKey="age"
									labelPrefix="Alter"
								/>
							}
						/>
						<ChartLegend content={<ChartLegendContent />} />
						<Line
							isAnimationActive={false}
							type="monotone"
							dataKey="A"
							stroke="var(--color-A)"
							strokeWidth={2.5}
							dot={false}
						/>
						<Line
							isAnimationActive={false}
							type="monotone"
							dataKey="B"
							stroke="var(--color-B)"
							strokeWidth={2}
							strokeDasharray="5 5"
							dot={false}
						/>
					</LineChart>
				</SlideChart>

				<SliderGrid>
					<SliderField
						label="Startalter A"
						display={`${ageA} Jahre`}
						value={ageA}
						onChange={v => setAgeA(Math.min(v, ageB - 1))}
						min={18}
						max={50}
						step={1}
					/>
					<SliderField
						label="Startalter B"
						display={`${ageB} Jahre`}
						value={ageB}
						onChange={v => setAgeB(Math.max(v, ageA + 1))}
						min={18}
						max={60}
						step={1}
					/>
					<SliderField
						label="Monatliche Rate"
						display={currencyFormat.format(monthly)}
						value={monthly}
						onChange={setMonthly}
						min={25}
						max={500}
						step={25}
					/>
				</SliderGrid>
			</Figure>

			{ageA < ageB && (
				<Callout variant="takeaway">
					{ageB - ageA} Jahre früher anfangen ergibt{" "}
					<Em>{currencyFormat.format(endA - endB)} mehr</Em> - obwohl in diesem
					Zeitraum nur {currencyFormat.format((ageB - ageA) * 12 * monthly)}{" "}
					mehr eingezahlt wurden. Den Rest erledigt der Zinseszins.
				</Callout>
			)}
		</SlideLayout>
	)
}
