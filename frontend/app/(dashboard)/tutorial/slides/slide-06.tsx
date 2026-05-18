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
import { SlideHeader, SlideLayout, SlideSection } from "./slide-layout"

// Quellen:
// MSCI World:  chart.csv (Jahresendwerte, Dez), Basis Jan 2004 = 100
// Tagesgeld:   EONIA 2004–2018 (bekannte EZB-Phasen) + €STR 2019–2024 (bbk.csv), kumuliert
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

export function Slide06() {
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
		<SlideLayout>
			<SlideHeader
				eyebrow="Wertpapiere"
				title="Anlageklassen im Überblick"
				subtitle="Es gibt verschiedene Arten, Geld anzulegen – von sicheren Konten bis zu spekulativen Investments."
			/>

			<div className="grid grid-cols-2 gap-3">
				{[
					{
						title: "Tagesgeld",
						color: "text-zinc-400",
						desc: "Ein Sparkonto bei einer Bank, auf das du täglich zugreifen kannst. Die Bank zahlt dir dafür Zinsen – den Tagesgeldzins, der sich am Leitzins der EZB orientiert. Kein Verlustrisiko, aber die Rendite liegt oft unter der Inflation.",
						example: "z. B. bei DKB, ING, Consorsbank",
					},
					{
						title: "Anleihen",
						color: "text-amber-500",
						desc: "Du leihst einem Staat oder Unternehmen Geld und erhältst dafür regelmäßige Zinszahlungen. Geringeres Risiko als Aktien, aber auch deutlich geringere Rendite.",
						example: "z. B. Bundesanleihe, US Treasury",
					},
					{
						title: "Aktien & ETFs",
						color: "text-emerald-500",
						desc: "Eine Aktie ist ein Anteil an einem Unternehmen. Ein ETF bündelt viele Aktien automatisch – z. B. den MSCI World mit 1.400 Unternehmen weltweit. Historisch hohe Rendite, aber mit Kursschwankungen.",
						example: "z. B. iShares MSCI World, S&P 500 ETF",
					},
					{
						title: "Kryptowährungen",
						color: "text-orange-500",
						desc: "Digitale Währungen wie Bitcoin. Extrem hohe Volatilität, kein innerer Wert im klassischen Sinne, stark spekulativ.",
						example: "z. B. Bitcoin, Ethereum",
					},
				].map(item => (
					<div
						key={item.title}
						className="rounded-xl border bg-muted/40 p-4 flex flex-col gap-2"
					>
						<span className={`font-semibold text-sm ${item.color}`}>
							{item.title}
						</span>
						<p className="text-foreground/70 text-xs leading-relaxed">
							{item.desc}
						</p>
						<span className="text-muted-foreground text-xs">
							{item.example}
						</span>
					</div>
				))}
			</div>

			<SlideSection>
				<div className="flex items-center justify-between flex-wrap gap-2">
					<span className="text-foreground font-semibold text-sm">
						Historische Wertentwicklung 2004–2024 (Index: 100)
					</span>
					<div className="flex gap-2 flex-wrap">
						{SERIES.map(s => (
							<Badge
								key={s.key}
								variant={active.includes(s.key) ? "default" : "outline"}
								className="cursor-pointer text-xs"
								style={
									active.includes(s.key)
										? {
												background: s.color,
												color: "#fff",
												borderColor: s.color,
											}
										: {}
								}
								onClick={() => toggle(s.key)}
							>
								{s.label}
							</Badge>
						))}
					</div>
					<p className="text-muted-foreground text-xs">
						Bitcoin ab 2014 verfügbar. Achtung: stark abweichende Skala beim
						Einblenden.
					</p>
				</div>
				<div className="rounded-xl border bg-muted/40 p-4">
					<ResponsiveContainer width="100%" height={200}>
						<LineChart
							data={HISTORICAL_DATA}
							margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
						>
							<CartesianGrid
								strokeDasharray="3 3"
								stroke="hsl(var(--border))"
							/>
							<XAxis
								dataKey="year"
								tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
								tickLine={false}
							/>
							<YAxis
								scale="pow"
								tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
								tickLine={false}
								width={50}
							/>
							<Tooltip
								contentStyle={{
									background: "hsl(var(--card))",
									border: "1px solid hsl(var(--border))",
									borderRadius: 8,
									fontSize: 12,
									color: "hsl(var(--foreground))",
								}}
								formatter={(v: number, key: string) => {
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
				</div>
			</SlideSection>
		</SlideLayout>
	)
}
