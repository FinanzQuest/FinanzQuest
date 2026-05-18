"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { SlideLayout, SlideHeader, SlideSection, InfoCard } from "./slide-layout"
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts"

function calcPurchasingPower(startAmount: number, rate: number, years: number) {
	return Array.from({ length: years + 1 }, (_, i) => ({
		year: i,
		kaufkraft: Math.round(startAmount * Math.pow(1 - rate / 100, i)),
	}))
}

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
				subtitle="Inflation bedeutet: Preise steigen – und dein Geld wird dadurch Jahr für Jahr weniger wert."
			/>

			<SlideSection>
				<p className="text-foreground/75 text-sm leading-relaxed">
					Ein Beispiel aus dem Alltag: Eine Kinokarte hat vor 20 Jahren ca. 5 €
					gekostet, heute oft 15 €. Der Betrag auf deinem Konto bleibt gleich –
					aber du kannst damit weniger kaufen als früher. Diesen Effekt nennt man{" "}
					<span className="text-foreground font-medium">Kaufkraftverlust</span>.
				</p>
			</SlideSection>

			<div className="rounded-xl border bg-muted/40 p-6 flex flex-col gap-6">
				<div className="flex items-center justify-between flex-wrap gap-2">
					<span className="text-foreground font-semibold text-sm">
						Kaufkraft von 100 € über die Zeit
					</span>
					<div className="flex items-center gap-2">
						<span className="text-muted-foreground text-xs">
							Wert nach {years} Jahren:
						</span>
						<span className="text-2xl font-bold text-amber-500">
							{finalValue} €
						</span>
					</div>
				</div>

				<ResponsiveContainer width="100%" height={180}>
					<AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
						<defs>
							<linearGradient id="kaufkraftGrad" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
								<stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
							</linearGradient>
						</defs>
						<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
						<XAxis
							dataKey="year"
							tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
							tickLine={false}
							label={{ value: "Jahre", position: "insideBottomRight", fill: "hsl(var(--muted-foreground))", fontSize: 11, offset: -5 }}
						/>
						<YAxis
							tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
							tickLine={false}
							tickFormatter={(v) => `${v} €`}
						/>
						<Tooltip
							contentStyle={{
								background: "hsl(var(--card))",
								border: "1px solid hsl(var(--border))",
								borderRadius: 8,
								fontSize: 12,
								color: "hsl(var(--foreground))",
							}}
							labelFormatter={(v) => `Jahr ${v}`}
							formatter={(v: number) => [`${v} €`, "Kaufkraft"]}
						/>
						<Area
							type="monotone"
							dataKey="kaufkraft"
							stroke="#f59e0b"
							strokeWidth={2}
							fill="url(#kaufkraftGrad)"
						/>
					</AreaChart>
				</ResponsiveContainer>

				<div className="grid grid-cols-2 gap-6">
					<div className="flex flex-col gap-2">
						<div className="flex justify-between text-sm">
							<span className="text-foreground/70">Inflationsrate</span>
							<span className="text-foreground font-mono">{rate.toFixed(1)} %</span>
						</div>
						<Slider
							min={1} max={5} step={0.1}
							value={[rate]}
							onValueChange={([v]) => setRate(v)}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<div className="flex justify-between text-sm">
							<span className="text-foreground/70">Zeitraum</span>
							<span className="text-foreground font-mono">{years} Jahre</span>
						</div>
						<Slider
							min={1} max={50} step={1}
							value={[years]}
							onValueChange={([v]) => setYears(v)}
						/>
					</div>
				</div>
			</div>

			<InfoCard accent>
				Geld auf einem niedrig verzinsten Konto zu lassen ist keine neutrale
				Entscheidung – real bedeutet es einen schleichenden Wertverlust von Jahr
				zu Jahr. Die Lösung: Geld so anlegen, dass es mehr wächst als die
				Inflation steigt.
			</InfoCard>
		</SlideLayout>
	)
}
