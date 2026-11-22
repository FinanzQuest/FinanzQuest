"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
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
	DataTable,
	Em,
	Figure,
	SlideHeader,
	SlideLayout,
	SlideSection,
	Stat,
	StatRow,
	Text,
} from "./slide-layout"

function calcGrowthWithTER(
	start: number,
	grossReturn: number,
	ter: number,
	years: number
) {
	const netRate = (grossReturn - ter) / 100
	return Array.from({ length: years + 1 }, (_, i) => ({
		year: i,
		value: Math.round(start * (1 + netRate) ** i),
	}))
}

const etfData = calcGrowthWithTER(10000, 7, 0.2, 30)
const activeFundData = calcGrowthWithTER(10000, 7, 1.5, 30)

const chartData = etfData.map((d, i) => ({
	year: d.year,
	etf: d.value,
	fonds: activeFundData[i].value,
}))

const chartConfig = {
	etf: { label: "ETF (TER 0,2 %)", color: "var(--win)" },
	fonds: {
		label: "Aktiver Fonds (TER 1,5 %)",
		color: "var(--muted-foreground)",
	},
} satisfies ChartConfig

export function Slide09() {
	const etfEnd = etfData[etfData.length - 1].value
	const fundEnd = activeFundData[activeFundData.length - 1].value

	return (
		<SlideLayout>
			<SlideHeader
				title="ETFs genauer betrachtet"
				subtitle="ETFs kombinieren breite Risikostreuung mit sehr geringen Kosten - und genau das macht über Jahrzehnte einen enormen Unterschied."
			/>

			<SlideSection title="Was ist die TER?">
				<Text>
					Die <Em>TER (Total Expense Ratio)</Em> ist die jährliche Gebühr, die
					ein Fonds für seine Verwaltung erhebt. Sie wird automatisch vom
					Fondsvermögen abgezogen - du siehst sie nicht als separate Zahlung,
					aber sie schmälert deine Rendite jedes Jahr.
				</Text>
				<Text>
					Warum ist eine hohe TER so problematisch? Weil sie jedes Jahr anfällt
					und damit durch den Zinseszinseffekt über lange Zeiträume{" "}
					<Em>enorme Auswirkungen</Em> hat.
				</Text>
			</SlideSection>

			<Figure
				title="10.000 € über 30 Jahre"
				description="Gleiche Rendite vor Kosten (7 %), nur die TER unterscheidet sich."
			>
				<StatRow>
					<Stat
						size="lg"
						label="ETF"
						value={currencyFormat.format(etfEnd)}
						tone="win"
					/>
					<Stat
						size="lg"
						label="Aktiver Fonds"
						value={currencyFormat.format(fundEnd)}
						tone="muted"
					/>
					<Stat
						label="Differenz"
						value={currencyFormat.format(etfEnd - fundEnd)}
						hint="allein durch die Kosten"
					/>
				</StatRow>

				<SlideChart config={chartConfig}>
					<AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0 }}>
						<defs>
							<linearGradient id="etfFill" x1="0" y1="0" x2="0" y2="1">
								<stop
									offset="5%"
									stopColor="var(--color-etf)"
									stopOpacity={0.25}
								/>
								<stop
									offset="95%"
									stopColor="var(--color-etf)"
									stopOpacity={0}
								/>
							</linearGradient>
						</defs>
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
						<Area
							isAnimationActive={false}
							type="monotone"
							dataKey="fonds"
							stroke="var(--color-fonds)"
							strokeWidth={2}
							strokeDasharray="5 5"
							fill="none"
						/>
						<Area
							isAnimationActive={false}
							type="monotone"
							dataKey="etf"
							stroke="var(--color-etf)"
							strokeWidth={2.5}
							fill="url(#etfFill)"
						/>
					</AreaChart>
				</SlideChart>
			</Figure>

			<SlideSection title="Weitere wichtige ETF-Begriffe">
				<DataTable
					headers={["Begriff", "Bedeutung"]}
					rows={[
						[
							"Thesaurierend",
							"Erträge werden automatisch reinvestiert, der Zinseszinseffekt wirkt ohne Zutun",
						],
						[
							"Ausschüttend",
							"Erträge werden regelmäßig ausgezahlt und müssen selbst reinvestiert werden",
						],
						[
							"MSCI World",
							"Index aus ca. 1.400 Unternehmen aus 23 Industrieländern",
						],
						["S&P 500", "Index der 500 größten börsennotierten US-Unternehmen"],
					]}
				/>
			</SlideSection>
		</SlideLayout>
	)
}
