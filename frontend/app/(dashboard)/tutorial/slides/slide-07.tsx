"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { SlideLayout, SlideHeader, SlideSection, InfoCard } from "./slide-layout"
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts"

function randomWalk(steps: number, volatility: number, trend: number) {
	let value = 1000
	return Array.from({ length: steps }, (_, i) => {
		value = value * (1 + trend + (Math.random() - 0.5) * volatility)
		return { month: i + 1, value: Math.max(0, Math.round(value)) }
	})
}

function avgWalk(n: number, steps: number, volatility: number, trend: number) {
	const walks = Array.from({ length: n }, () => randomWalk(steps, volatility, trend))
	return Array.from({ length: steps }, (_, i) => ({
		month: i + 1,
		value: Math.round(walks.reduce((sum, w) => sum + w[i].value, 0) / n),
	}))
}

function generateData() {
	const steps = 36
	return {
		single: randomWalk(steps, 0.18, 0.004),
		portfolio: avgWalk(20, steps, 0.18, 0.004),
	}
}

export function Slide07() {
	const [simData, setSimData] = useState(() => generateData())

	const rerun = useCallback(() => setSimData(generateData()), [])

	const chartData = simData.single.map((d, i) => ({
		month: d.month,
		Einzelaktie: d.value,
		Portfolio: simData.portfolio[i].value,
	}))

	return (
		<SlideLayout>
			<SlideHeader
				eyebrow="Risikomanagement"
				title="Diversifikation – Risikostreuung"
				subtitle="Nicht alles auf eine Karte setzen: Das Verteilen von Kapital auf viele Anlagen senkt das Risiko erheblich."
			/>

			<SlideSection>
				<p className="text-foreground/75 text-sm leading-relaxed">
					Angenommen, du investierst dein gesamtes Geld in die Aktie eines
					einzigen Unternehmens. Geht dieses Unternehmen pleite, ist dein
					gesamtes Kapital verloren. Diversifikation löst dieses Problem: Statt
					auf ein Unternehmen zu setzen, verteilst du dein Kapital auf viele
					verschiedene Anlagen.
				</p>
			</SlideSection>

			<div className="grid grid-cols-2 gap-4">
				<div className="rounded-xl border bg-muted/40 p-4 flex flex-col gap-1">
					<span className="text-foreground font-semibold text-sm">1.000 € – eine Aktie</span>
					<p className="text-foreground/60 text-xs leading-relaxed">
						Unternehmen geht pleite → vollständiger Verlust
					</p>
					<span className="text-rose-500 font-bold mt-1">− 1.000 €</span>
				</div>
				<div className="rounded-xl border bg-muted/40 p-4 flex flex-col gap-1">
					<span className="text-foreground font-semibold text-sm">1.000 € – 1.000 Aktien</span>
					<p className="text-foreground/60 text-xs leading-relaxed">
						Ein Unternehmen geht pleite → Verlust von ca. 1 €
					</p>
					<span className="text-emerald-500 font-bold mt-1">− 1 €</span>
				</div>
			</div>

			<div className="rounded-xl border bg-muted/40 p-6 flex flex-col gap-4">
				<div className="flex items-center justify-between">
					<span className="text-foreground font-semibold text-sm">
						Simulation: 36 Monate Kursverlauf
					</span>
					<Button variant="outline" size="sm" onClick={rerun}>
						Neue Simulation
					</Button>
				</div>
				<ResponsiveContainer width="100%" height={200}>
					<LineChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
						<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
						<XAxis
							dataKey="month"
							tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
							tickLine={false}
							label={{ value: "Monate", position: "insideBottomRight", fill: "hsl(var(--muted-foreground))", fontSize: 11, offset: -5 }}
						/>
						<YAxis
							tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
							tickLine={false}
							tickFormatter={(v) => `${v} €`}
							width={60}
						/>
						<Tooltip
							contentStyle={{
								background: "hsl(var(--card))",
								border: "1px solid hsl(var(--border))",
								borderRadius: 8,
								fontSize: 12,
								color: "hsl(var(--foreground))",
							}}
							labelFormatter={(v) => `Monat ${v}`}
							formatter={(v: number, name: string) => [`${v.toLocaleString("de-DE")} €`, name]}
						/>
						<Legend wrapperStyle={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }} />
						<Line type="monotone" dataKey="Einzelaktie" stroke="#f43f5e" strokeWidth={2} dot={false} />
						<Line type="monotone" dataKey="Portfolio" stroke="#10b981" strokeWidth={2.5} dot={false} />
					</LineChart>
				</ResponsiveContainer>
				<p className="text-muted-foreground text-xs">
					Beide Linien starten bei 1.000 €. Die Einzelaktie schwankt stark – das Portfolio aus 20 Aktien ist deutlich stabiler.
				</p>
			</div>
		</SlideLayout>
	)
}
