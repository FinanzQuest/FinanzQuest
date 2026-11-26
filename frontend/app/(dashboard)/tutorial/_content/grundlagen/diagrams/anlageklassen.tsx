"use client"

import { useState } from "react"
import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { axisTick, DiagramFrame, tooltipStyle } from "./shared"

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
const SERIES = [
	{ key: "tagesgeld", label: "Tagesgeld", color: "#71717a" },
	{ key: "anleihen", label: "Staatsanleihen", color: "#f59e0b" },
	{ key: "msci", label: "MSCI World ETF", color: "#10b981" },
	{ key: "bitcoin", label: "Bitcoin", color: "#f97316" },
]

export function Anlageklassen() {
	const [active, setActive] = useState<string[]>([
		"tagesgeld",
		"anleihen",
		"msci",
	])

	const toggle = (key: string) =>
		setActive(prev =>
			prev.includes(key)
				? prev.length > 1
					? prev.filter(k => k !== key)
					: prev
				: [...prev, key]
		)

	return (
		<DiagramFrame>
			<span className="text-sm font-semibold text-foreground">
				Historische Wertentwicklung 2004-2024 (Index: 100)
			</span>
			<div className="flex flex-wrap gap-2">
				{SERIES.map(s => (
					<Badge
						key={s.key}
						variant={active.includes(s.key) ? "default" : "outline"}
						className="cursor-pointer text-xs"
						style={
							active.includes(s.key)
								? { background: s.color, color: "#fff", borderColor: s.color }
								: {}
						}
						onClick={() => toggle(s.key)}
					>
						{s.label}
					</Badge>
				))}
			</div>
			<p className="text-xs text-muted-foreground">
				Bitcoin ab 2014 verfügbar. Achtung: stark abweichende Skala beim
				Einblenden.
			</p>
			<ResponsiveContainer width="100%" height={200}>
				<LineChart
					data={HISTORICAL_DATA}
					margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
				>
					<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
					<XAxis
						dataKey="year"
						tick={axisTick}
						tickLine={false}
						interval="preserveStartEnd"
						minTickGap={16}
					/>
					<YAxis scale="pow" tick={axisTick} tickLine={false} width={50} />
					<Tooltip
						contentStyle={tooltipStyle}
						formatter={(v, key) => {
							const s = SERIES.find(s => s.key === key)
							return [`${v}`, s?.label ?? key]
						}}
					/>
					{SERIES.filter(s => active.includes(s.key)).map(s => (
						<Line
							key={s.key}
							type="monotone"
							dataKey={s.key}
							stroke={s.color}
							strokeWidth={2}
							dot={false}
						/>
					))}
				</LineChart>
			</ResponsiveContainer>
		</DiagramFrame>
	)
}
