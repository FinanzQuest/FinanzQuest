"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { SlideLayout, SlideHeader, SlideSection, InfoCard } from "./slide-layout"
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	Cell,
} from "recharts"

function calcSparplan(monthly: number, rate: number, years: number) {
	// Returns yearly snapshots: { year, eingezahlt, zinseszins }
	let value = 0
	const data = []
	for (let y = 1; y <= years; y++) {
		for (let m = 0; m < 12; m++) {
			value = (value + monthly) * (1 + rate / 100 / 12)
		}
		const eingezahlt = monthly * 12 * y
		data.push({
			year: y,
			Eingezahlt: eingezahlt,
			Zinseszins: Math.round(value - eingezahlt),
		})
	}
	return data
}

function formatEur(v: number) {
	return v >= 1000 ? `${(v / 1000).toFixed(0)}k €` : `${v} €`
}

export function Slide10() {
	const [monthly, setMonthly] = useState(100)
	const [rate, setRate] = useState(7)
	const [years, setYears] = useState(30)

	const data = calcSparplan(monthly, rate, years)
	const last = data[data.length - 1]
	const endValue = last.Eingezahlt + last.Zinseszins
	const totalIn = last.Eingezahlt

	// Show every 5th year on chart to avoid clutter
	const chartData = data.filter((d) => d.year % 5 === 0 || d.year === years)

	return (
		<SlideLayout>
			<SlideHeader
				eyebrow="Praxis"
				title="Der Sparplan – regelmäßig investieren"
				subtitle="Vermögensaufbau beginnt nicht mit einem großen Einmalbetrag, sondern mit einem Teil des monatlichen Gehalts."
			/>

			<SlideSection>
				<p className="text-foreground/75 text-sm leading-relaxed">
					Die wenigsten haben gleich zu Beginn mehrere Tausend Euro zur
					Verfügung. Das ist auch gar nicht nötig: Ein{" "}
					<span className="text-foreground font-medium">Sparplan</span> legt
					automatisch jeden Monat einen festen Betrag in einen ETF an – z. B.
					50 € oder 150 € aus dem Gehalt.
				</p>
				<p className="text-foreground/75 text-sm leading-relaxed">
					Durch den{" "}
					<span className="text-foreground font-medium">Cost-Average-Effekt</span>{" "}
					kaufst du bei niedrigen Kursen automatisch mehr Anteile und bei hohen
					Kursen weniger. Das senkt deinen durchschnittlichen Einkaufspreis über
					die Zeit – ohne dass du aktiv eingreifen musst.
				</p>
			</SlideSection>

			<div className="rounded-xl border bg-muted/40 p-6 flex flex-col gap-6">
				<div className="grid grid-cols-3 gap-4">
					<div className="rounded-lg border bg-muted/60 p-3 flex flex-col gap-0.5">
						<span className="text-xs text-muted-foreground">Endwert nach {years} Jahren</span>
						<span className="text-xl font-bold text-emerald-500">{endValue.toLocaleString("de-DE")} €</span>
					</div>
					<div className="rounded-lg border bg-muted/60 p-3 flex flex-col gap-0.5">
						<span className="text-xs text-muted-foreground">Eigene Einzahlungen</span>
						<span className="text-xl font-bold text-foreground/70">{totalIn.toLocaleString("de-DE")} €</span>
					</div>
					<div className="rounded-lg border bg-muted/60 p-3 flex flex-col gap-0.5">
						<span className="text-xs text-muted-foreground">Zinseszins-Gewinn</span>
						<span className="text-xl font-bold text-blue-400">{last.Zinseszins.toLocaleString("de-DE")} €</span>
					</div>
				</div>

				<ResponsiveContainer width="100%" height={200}>
					<BarChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
						<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
						<XAxis
							dataKey="year"
							tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
							tickLine={false}
							tickFormatter={(v) => `J. ${v}`}
						/>
						<YAxis
							tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
							tickLine={false}
							tickFormatter={formatEur}
							width={55}
						/>
						<Tooltip
							contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12, color: "hsl(var(--foreground))" }}
							labelFormatter={(v) => `Nach ${v} Jahren`}
							formatter={(v: number, name: string) => [`${v.toLocaleString("de-DE")} €`, name]}
						/>
						<Legend wrapperStyle={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }} />
						<Bar dataKey="Eingezahlt" stackId="a" fill="hsl(var(--muted-foreground))" opacity={0.7} radius={[0, 0, 4, 4]} />
						<Bar dataKey="Zinseszins" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
					</BarChart>
				</ResponsiveContainer>

				<div className="grid grid-cols-3 gap-4">
					<div className="flex flex-col gap-2">
						<div className="flex justify-between text-sm">
							<span className="text-foreground/70">Monatliche Rate</span>
							<span className="text-foreground font-mono">{monthly} €</span>
						</div>
						<Slider min={25} max={500} step={25} value={[monthly]} onValueChange={([v]) => setMonthly(v)} />
					</div>
					<div className="flex flex-col gap-2">
						<div className="flex justify-between text-sm">
							<span className="text-foreground/70">Rendite</span>
							<span className="text-foreground font-mono">{rate} %</span>
						</div>
						<Slider min={1} max={12} step={0.5} value={[rate]} onValueChange={([v]) => setRate(v)} />
					</div>
					<div className="flex flex-col gap-2">
						<div className="flex justify-between text-sm">
							<span className="text-foreground/70">Laufzeit</span>
							<span className="text-foreground font-mono">{years} Jahre</span>
						</div>
						<Slider min={5} max={45} step={1} value={[years]} onValueChange={([v]) => setYears(v)} />
					</div>
				</div>
			</div>

			<InfoCard accent>
				Disziplin durch Automatisierung: Der Betrag wird monatlich abgebucht,
				bevor du ihn ausgeben kannst. So entsteht Vermögen ohne aktive
				Entscheidung jeden Monat.
			</InfoCard>
		</SlideLayout>
	)
}
