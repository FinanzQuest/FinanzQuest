"use client"

import { useState } from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { numberFormat } from "@/lib/util"
import {
	axisProps,
	type ChartConfig,
	ChartTooltip,
	gridProps,
	SlideChart,
	SlideTooltipContent,
} from "./slide-chart"
import { Figure, SlideHeader, SlideLayout } from "./slide-layout"

// Quellen:
// MSCI World:  chart.csv (Jahresendwerte, Dez), Basis Jan 2004 = 100
// Tagesgeld:   EONIA 2004-2018 (bekannte EZB-Phasen) + €STR 2019-2024 (bbk.csv), kumuliert
// Anleihen:    Bloomberg Global Aggregate Bond Index, bekannte Jahresrenditen, kumuliert
// Bitcoin:     btc-usd-max.csv (Jahresdurchschnitt), Basis 2014 = 100, null vor 2014

const HISTORICAL_DATA = [
	{
		year: "2004",
		tagesgeld: 102.0,
		anleihen: 104.9,
		msci: 102.7,
		bitcoin: null,
	},
	{
		year: "2005",
		tagesgeld: 104.2,
		anleihen: 106.3,
		msci: 129.8,
		bitcoin: null,
	},
	{
		year: "2006",
		tagesgeld: 107.1,
		anleihen: 110.6,
		msci: 139.6,
		bitcoin: null,
	},
	{
		year: "2007",
		tagesgeld: 111.3,
		anleihen: 121.1,
		msci: 136.1,
		bitcoin: null,
	},
	{
		year: "2008",
		tagesgeld: 115.6,
		anleihen: 126.9,
		msci: 85.4,
		bitcoin: null,
	},
	{
		year: "2009",
		tagesgeld: 116.4,
		anleihen: 135.7,
		msci: 107.2,
		bitcoin: null,
	},
	{
		year: "2010",
		tagesgeld: 116.9,
		anleihen: 143.2,
		msci: 129.2,
		bitcoin: null,
	},
	{
		year: "2011",
		tagesgeld: 117.9,
		anleihen: 151.2,
		msci: 126.0,
		bitcoin: null,
	},
	{
		year: "2012",
		tagesgeld: 118.2,
		anleihen: 157.7,
		msci: 143.1,
		bitcoin: null,
	},
	{
		year: "2013",
		tagesgeld: 118.3,
		anleihen: 153.6,
		msci: 173.5,
		bitcoin: null,
	},
	{
		year: "2014",
		tagesgeld: 118.4,
		anleihen: 154.5,
		msci: 206.8,
		bitcoin: 100.0,
	},
	{
		year: "2015",
		tagesgeld: 118.3,
		anleihen: 156.1,
		msci: 228.6,
		bitcoin: 51.8,
	},
	{
		year: "2016",
		tagesgeld: 117.9,
		anleihen: 159.3,
		msci: 253.8,
		bitcoin: 107.8,
	},
	{
		year: "2017",
		tagesgeld: 117.5,
		anleihen: 164.1,
		msci: 273.1,
		bitcoin: 764.6,
	},
	{
		year: "2018",
		tagesgeld: 117.0,
		anleihen: 162.1,
		msci: 261.1,
		bitcoin: 1444.0,
	},
	{
		year: "2019",
		tagesgeld: 116.4,
		anleihen: 173.2,
		msci: 339.8,
		bitcoin: 1399.5,
	},
	{
		year: "2020",
		tagesgeld: 115.8,
		anleihen: 183.0,
		msci: 360.5,
		bitcoin: 2101.0,
	},
	{
		year: "2021",
		tagesgeld: 115.1,
		anleihen: 174.4,
		msci: 475.8,
		bitcoin: 9018.4,
	},
	{
		year: "2022",
		tagesgeld: 115.1,
		anleihen: 146.2,
		msci: 413.6,
		bitcoin: 5379.1,
	},
	{
		year: "2023",
		tagesgeld: 118.8,
		anleihen: 153.3,
		msci: 494.2,
		bitcoin: 5473.6,
	},
	{
		year: "2024",
		tagesgeld: 123.1,
		anleihen: 155.6,
		msci: 623.8,
		bitcoin: 12515.0,
	},
]
const chartConfig = {
	tagesgeld: { label: "Tagesgeld", color: "var(--muted-foreground)" },
	anleihen: { label: "Staatsanleihen", color: "var(--overlay-1)" },
	msci: { label: "MSCI World ETF", color: "var(--win)" },
	bitcoin: { label: "Bitcoin", color: "var(--color-crypto)" },
} satisfies ChartConfig

type SeriesKey = keyof typeof chartConfig
const SERIES = Object.keys(chartConfig) as SeriesKey[]

const ASSET_CLASSES: {
	series: SeriesKey
	title: string
	desc: string
	example: string
}[] = [
	{
		series: "tagesgeld",
		title: "Tagesgeld",
		desc: "Ein Sparkonto bei einer Bank, auf das du täglich zugreifen kannst. Die Bank zahlt dir dafür Zinsen - den Tagesgeldzins, der sich am Leitzins der EZB orientiert. Kein Verlustrisiko, aber die Rendite liegt oft unter der Inflation.",
		example: "z. B. bei DKB, ING, Consorsbank",
	},
	{
		series: "anleihen",
		title: "Anleihen",
		desc: "Du leihst einem Staat oder Unternehmen Geld und erhältst dafür regelmäßige Zinszahlungen. Geringeres Risiko als Aktien, aber auch deutlich geringere Rendite.",
		example: "z. B. Bundesanleihe, US Treasury",
	},
	{
		series: "msci",
		title: "Aktien & ETFs",
		desc: "Eine Aktie ist ein Anteil an einem Unternehmen. Ein ETF bündelt viele Aktien automatisch - z. B. den MSCI World mit 1.400 Unternehmen weltweit. Historisch hohe Rendite, aber mit Kursschwankungen.",
		example: "z. B. iShares MSCI World, S&P 500 ETF",
	},
	{
		series: "bitcoin",
		title: "Kryptowährungen",
		desc: "Digitale Währungen wie Bitcoin. Extrem hohe Volatilität, kein innerer Wert im klassischen Sinne, stark spekulativ.",
		example: "z. B. Bitcoin, Ethereum",
	},
]

export function Slide06() {
	const [active, setActive] = useState<SeriesKey[]>([
		"tagesgeld",
		"anleihen",
		"msci",
	])

	return (
		<SlideLayout>
			<SlideHeader
				eyebrow="Wertpapiere"
				title="Anlageklassen im Überblick"
				subtitle="Es gibt verschiedene Arten, Geld anzulegen - von sicheren Konten bis zu spekulativen Investments."
			/>

			<div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
				{ASSET_CLASSES.map(item => (
					<div key={item.title} className="flex flex-col gap-1.5">
						<span className="flex items-center gap-2 font-semibold">
							<span
								aria-hidden
								className="size-2.5 rounded-[2px]"
								style={{ background: chartConfig[item.series].color }}
							/>
							{item.title}
						</span>
						<p className="text-sm text-muted-foreground leading-relaxed text-pretty">
							{item.desc}
						</p>
						<span className="text-xs text-muted-foreground">
							{item.example}
						</span>
					</div>
				))}
			</div>

			<Figure
				title="Historische Wertentwicklung 2004-2024"
				description="Indexiert auf 100. Bitcoin erst ab 2014 verfügbar und mit stark abweichender Skala."
			>
				<ToggleGroup
					multiple
					variant="outline"
					size="sm"
					value={active}
					// keep at least one series visible
					onValueChange={(next: string[]) => {
						if (next.length > 0) setActive(next as SeriesKey[])
					}}
					aria-label="Angezeigte Anlageklassen"
					className="flex-wrap"
				>
					{SERIES.map(key => (
						<ToggleGroupItem key={key} value={key}>
							<span
								aria-hidden
								className="size-2 rounded-[2px]"
								style={{ background: chartConfig[key].color }}
							/>
							{chartConfig[key].label}
						</ToggleGroupItem>
					))}
				</ToggleGroup>

				<SlideChart config={chartConfig}>
					<LineChart
						data={HISTORICAL_DATA}
						margin={{ top: 4, right: 4, left: 0 }}
					>
						<CartesianGrid {...gridProps} />
						<XAxis dataKey="year" {...axisProps} />
						<YAxis
							{...axisProps}
							scale="pow"
							width={52}
							tickFormatter={v => numberFormat.format(v)}
						/>
						<ChartTooltip
							content={
								<SlideTooltipContent
									config={chartConfig}
									xKey="year"
									format={v => numberFormat.format(v)}
								/>
							}
						/>
						{SERIES.filter(key => active.includes(key)).map(key => (
							<Line
								key={key}
								isAnimationActive={false}
								type="monotone"
								dataKey={key}
								stroke={`var(--color-${key})`}
								strokeWidth={2}
								dot={false}
							/>
						))}
					</LineChart>
				</SlideChart>
			</Figure>
		</SlideLayout>
	)
}
