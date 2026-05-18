"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
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
	ReferenceLine,
} from "recharts"

function calcSparplan(startAge: number, monthlyRate: number, rate: number) {
	const months = (65 - startAge) * 12
	let value = 0
	const yearlyData: { age: number; value: number }[] = []
	for (let m = 0; m < months; m++) {
		value = (value + monthlyRate) * (1 + rate / 100 / 12)
		if (m % 12 === 11) {
			yearlyData.push({ age: startAge + Math.floor(m / 12) + 1, value: Math.round(value) })
		}
	}
	return yearlyData
}

function formatEur(v: number) {
	return v >= 1000 ? `${(v / 1000).toFixed(0)}k €` : `${v} €`
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
	const allAges = Array.from(new Set([...dataA.map((d) => d.age), ...dataB.map((d) => d.age)])).sort((a, b) => a - b)
	const chartData = allAges.map((age) => ({
		age,
		A: dataA.find((d) => d.age === age)?.value ?? null,
		B: dataB.find((d) => d.age === age)?.value ?? null,
	}))

	return (
		<SlideLayout>
			<SlideHeader
				eyebrow="Grundlagen"
				title="Der Faktor Zeit"
				subtitle="Zehn Jahre früher zu beginnen kann das Endergebnis mehr als verdoppeln – bei gleicher monatlicher Rate."
			/>

			<SlideSection>
				<p className="text-foreground/75 text-sm leading-relaxed">
					Der Zinseszinseffekt braucht eines vor allem:{" "}
					<span className="text-foreground font-medium">Zeit</span>. Je früher
					du anfängst, desto länger kann dein Geld wachsen – und desto größer
					wird der Unterschied.
				</p>
			</SlideSection>

			<div className="rounded-xl border bg-muted/40 p-6 flex flex-col gap-6">
				<div className="grid grid-cols-2 gap-4">
					<div className="rounded-lg border bg-muted/60 p-4 flex flex-col gap-1">
						<span className="text-xs text-muted-foreground">Start mit {ageA}</span>
						<span className="text-2xl font-bold text-emerald-500">{endA.toLocaleString("de-DE")} €</span>
						<span className="text-xs text-foreground/60">{65 - ageA} Jahre Anlagezeit</span>
					</div>
					<div className="rounded-lg border bg-muted/60 p-4 flex flex-col gap-1">
						<span className="text-xs text-muted-foreground">Start mit {ageB}</span>
						<span className="text-2xl font-bold text-foreground/70">{endB.toLocaleString("de-DE")} €</span>
						<span className="text-xs text-foreground/60">{65 - ageB} Jahre Anlagezeit</span>
					</div>
				</div>

				<ResponsiveContainer width="100%" height={200}>
					<LineChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
						<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
						<XAxis
							dataKey="age"
							tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
							tickLine={false}
							label={{ value: "Alter", position: "insideBottomRight", fill: "hsl(var(--muted-foreground))", fontSize: 11, offset: -5 }}
						/>
						<YAxis
							tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
							tickLine={false}
							tickFormatter={formatEur}
							width={55}
						/>
						<Tooltip
							contentStyle={{
								background: "hsl(var(--card))",
								border: "1px solid hsl(var(--border))",
								borderRadius: 8,
								fontSize: 12,
								color: "hsl(var(--foreground))",
							}}
							labelFormatter={(v) => `Alter ${v}`}
							formatter={(v: number, name: string) => [
								`${v.toLocaleString("de-DE")} €`,
								name === "A" ? `Start mit ${ageA}` : `Start mit ${ageB}`,
							]}
						/>
						<Legend
							formatter={(v) => v === "A" ? `Start mit ${ageA}` : `Start mit ${ageB}`}
							wrapperStyle={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}
						/>
						<Line type="monotone" dataKey="A" stroke="#10b981" strokeWidth={2.5} dot={false} connectNulls={false} />
						<Line type="monotone" dataKey="B" stroke="hsl(var(--muted-foreground))" strokeWidth={2} dot={false} strokeDasharray="5 5" connectNulls={false} />
					</LineChart>
				</ResponsiveContainer>

				<div className="grid grid-cols-3 gap-4">
					<div className="flex flex-col gap-2">
						<div className="flex justify-between text-sm">
							<span className="text-foreground/70">Startalter A</span>
							<span className="text-foreground font-mono">{ageA} Jahre</span>
						</div>
						<Slider min={18} max={50} step={1} value={[ageA]} onValueChange={([v]) => setAgeA(Math.min(v, ageB - 1))} />
					</div>
					<div className="flex flex-col gap-2">
						<div className="flex justify-between text-sm">
							<span className="text-foreground/70">Startalter B</span>
							<span className="text-foreground font-mono">{ageB} Jahre</span>
						</div>
						<Slider min={18} max={60} step={1} value={[ageB]} onValueChange={([v]) => setAgeB(Math.max(v, ageA + 1))} />
					</div>
					<div className="flex flex-col gap-2">
						<div className="flex justify-between text-sm">
							<span className="text-foreground/70">Monatliche Rate</span>
							<span className="text-foreground font-mono">{monthly} €</span>
						</div>
						<Slider min={25} max={500} step={25} value={[monthly]} onValueChange={([v]) => setMonthly(v)} />
					</div>
				</div>
			</div>

			<InfoCard accent>
				{ageA < ageB && (
					<>
						{ageB - ageA} Jahre früher anfangen ergibt{" "}
						<span className="font-semibold">
							{(endA - endB).toLocaleString("de-DE")} € mehr
						</span>{" "}
						– obwohl in diesem Zeitraum nur{" "}
						{((ageB - ageA) * 12 * monthly).toLocaleString("de-DE")} € mehr
						eingezahlt wurden. Den Rest erledigt der Zinseszins.
					</>
				)}
			</InfoCard>
		</SlideLayout>
	)
}
