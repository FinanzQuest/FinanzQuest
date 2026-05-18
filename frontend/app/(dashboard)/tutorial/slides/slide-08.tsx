"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { SlideLayout, SlideHeader, SlideSection, InfoCard } from "./slide-layout"
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts"

// Placeholder data 2004–2024 (index 100 = Jahr 2004)
const HISTORICAL_DATA = [
	{ year: "2004", tagesgeld: 100, anleihen: 100, msci: 100, bitcoin: 100 },
	{ year: "2006", tagesgeld: 106, anleihen: 107, msci: 132, bitcoin: 100 },
	{ year: "2008", tagesgeld: 112, anleihen: 118, msci: 82, bitcoin: 100 },
	{ year: "2010", tagesgeld: 115, anleihen: 128, msci: 112, bitcoin: 110 },
	{ year: "2012", tagesgeld: 117, anleihen: 138, msci: 138, bitcoin: 400 },
	{ year: "2014", tagesgeld: 118, anleihen: 150, msci: 190, bitcoin: 2800 },
	{ year: "2016", tagesgeld: 118, anleihen: 152, msci: 198, bitcoin: 4200 },
	{ year: "2018", tagesgeld: 119, anleihen: 153, msci: 230, bitcoin: 38000 },
	{ year: "2020", tagesgeld: 120, anleihen: 162, msci: 265, bitcoin: 28000 },
	{ year: "2022", tagesgeld: 121, anleihen: 145, msci: 290, bitcoin: 80000 },
	{ year: "2024", tagesgeld: 126, anleihen: 148, msci: 420, bitcoin: 120000 },
]

const SERIES = [
	{ key: "tagesgeld", label: "Tagesgeld", color: "#71717a" },
	{ key: "anleihen", label: "Staatsanleihen", color: "#f59e0b" },
	{ key: "msci", label: "MSCI World ETF", color: "#10b981" },
	{ key: "bitcoin", label: "Bitcoin", color: "#f97316" },
]

export function Slide08() {
	const [active, setActive] = useState<string[]>(["tagesgeld", "anleihen", "msci"])

	const toggle = (key: string) =>
		setActive((prev) =>
			prev.includes(key) ? (prev.length > 1 ? prev.filter((k) => k !== key) : prev) : [...prev, key]
		)

	return (
		<SlideLayout>
			<SlideHeader
				eyebrow="Wertpapiere"
				title="Anlageklassen im Überblick"
				subtitle="Es gibt verschiedene Arten von Wertpapieren – mit sehr unterschiedlichen Eigenschaften."
			/>

			<div className="grid grid-cols-2 gap-3">
				{[
					{
						title: "Aktien",
						color: "text-emerald-500",
						desc: "Ein Anteil an einem Unternehmen. Steigt der Wert des Unternehmens, steigt der Aktienkurs. Historisch hohe Rendite, entsprechend höheres Risiko.",
						example: "z. B. Apple, NVIDIA, Volkswagen",
					},
					{
						title: "Anleihen",
						color: "text-amber-500",
						desc: "Du leihst einem Staat oder Unternehmen Geld und erhältst dafür regelmäßige Zinszahlungen. Geringeres Risiko, aber auch deutlich geringere Rendite.",
						example: "z. B. Bundesanleihe, US Treasury",
					},
					{
						title: "Fonds & ETFs",
						color: "text-blue-400",
						desc: "Ein Fonds bündelt das Geld vieler Anleger und investiert es gemeinsam in viele Wertpapiere. Ein ETF bildet automatisch einen Index nach – z. B. den MSCI World mit 1.400 Unternehmen.",
						example: "z. B. iShares MSCI World, S&P 500 ETF",
					},
					{
						title: "Kryptowährungen",
						color: "text-orange-500",
						desc: "Digitale Währungen wie Bitcoin. Extrem hohe Volatilität, kein innerer Wert im klassischen Sinne, stark spekulativ.",
						example: "z. B. Bitcoin, Ethereum",
					},
				].map((item) => (
					<div key={item.title} className="rounded-xl border bg-muted/40 p-4 flex flex-col gap-2">
						<span className={`font-semibold text-sm ${item.color}`}>{item.title}</span>
						<p className="text-foreground/70 text-xs leading-relaxed">{item.desc}</p>
						<span className="text-muted-foreground text-xs">{item.example}</span>
					</div>
				))}
			</div>

			<SlideSection>
				<div className="flex items-center justify-between flex-wrap gap-2">
					<span className="text-foreground font-semibold text-sm">
						Historische Wertentwicklung 2004–2024 (Index: 100)
					</span>
					<div className="flex gap-2 flex-wrap">
						{SERIES.map((s) => (
							<Badge
								key={s.key}
								variant={active.includes(s.key) ? "default" : "outline"}
								className="cursor-pointer text-xs"
								style={active.includes(s.key) ? { background: s.color, color: "#fff", borderColor: s.color } : {}}
								onClick={() => toggle(s.key)}
							>
								{s.label}
							</Badge>
						))}
					</div>
				</div>
				<div className="rounded-xl border bg-muted/40 p-4">
					<ResponsiveContainer width="100%" height={200}>
						<LineChart data={HISTORICAL_DATA} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
							<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
							<XAxis dataKey="year" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} />
							<YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} width={50} />
							<Tooltip
								contentStyle={{
									background: "hsl(var(--card))",
									border: "1px solid hsl(var(--border))",
									borderRadius: 8,
									fontSize: 12,
									color: "hsl(var(--foreground))",
								}}
								formatter={(v: number, key: string) => {
									const s = SERIES.find((s) => s.key === key)
									return [`${v}`, s?.label ?? key]
								}}
							/>
							{SERIES.filter((s) => active.includes(s.key)).map((s) => (
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
					<p className="text-muted-foreground text-xs mt-2">
						Platzhalterdaten – werden durch echte Indexdaten ersetzt.
					</p>
				</div>
			</SlideSection>
		</SlideLayout>
	)
}
