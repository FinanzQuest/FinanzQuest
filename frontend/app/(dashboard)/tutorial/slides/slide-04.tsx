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
} from "recharts"

function calcGrowth(startCapital: number, rate: number, years: number) {
	return Array.from({ length: years + 1 }, (_, i) => ({
		year: i,
		mitZinseszins: Math.round(startCapital * Math.pow(1 + rate / 100, i)),
		ohneZinseszins: Math.round(startCapital + startCapital * (rate / 100) * i),
	}))
}

function formatEur(v: number) {
	return v >= 1000 ? `${(v / 1000).toFixed(1)}k €` : `${v} €`
}

export function Slide04() {
	const [startCapital, setStartCapital] = useState(1000)
	const [rate, setRate] = useState(7)
	const [years, setYears] = useState(30)

	const data = calcGrowth(startCapital, rate, years)
	const withCompound = data[data.length - 1].mitZinseszins
	const withoutCompound = data[data.length - 1].ohneZinseszins

	return (
		<SlideLayout>
			<SlideHeader
				eyebrow="Grundlagen"
				title="Der Zinseszinseffekt"
				subtitle="Zinsen auf Zinsen – über Jahrzehnte führt das zu exponentiellem Wachstum."
			/>

			<SlideSection>
				<p className="text-foreground/75 text-sm leading-relaxed">
					Stell dir vor, du legst 1.000 € bei 7 % Rendite an. Nach einem Jahr
					hast du 1.070 €. Im zweiten Jahr bekommst du nicht nochmal 70 € –
					sondern 7 % auf{" "}
					<span className="text-foreground font-medium">1.070 €</span>, also
					74,90 €. Im dritten Jahr wieder 7 % auf den gewachsenen Betrag, und so
					weiter. Du bekommst also{" "}
					<span className="text-foreground font-medium">Zinsen auf deine Zinsen</span>.
				</p>
			</SlideSection>

			<div className="rounded-xl border bg-muted/40 p-6 flex flex-col gap-6">
				<div className="flex items-center justify-between flex-wrap gap-4">
					<span className="text-foreground font-semibold text-sm">
						Wachstum über {years} Jahre
					</span>
					<div className="flex gap-6">
						<div className="flex flex-col items-end">
							<span className="text-muted-foreground text-xs">ohne Zinseszins</span>
							<span className="font-bold text-foreground/60">{formatEur(withoutCompound)}</span>
						</div>
						<div className="flex flex-col items-end">
							<span className="text-muted-foreground text-xs">mit Zinseszins</span>
							<span className="font-bold text-emerald-500 text-xl">{formatEur(withCompound)}</span>
						</div>
					</div>
				</div>

				<ResponsiveContainer width="100%" height={200}>
					<LineChart data={data} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
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
							labelFormatter={(v) => `Jahr ${v}`}
							formatter={(v: number, name: string) => [
								`${v.toLocaleString("de-DE")} €`,
								name === "mitZinseszins" ? "Mit Zinseszins" : "Ohne Zinseszins",
							]}
						/>
						<Legend
							formatter={(v) => v === "mitZinseszins" ? "Mit Zinseszins" : "Ohne Zinseszins"}
							wrapperStyle={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}
						/>
						<Line type="monotone" dataKey="ohneZinseszins" stroke="hsl(var(--muted-foreground))" strokeWidth={2} dot={false} strokeDasharray="5 5" />
						<Line type="monotone" dataKey="mitZinseszins" stroke="#10b981" strokeWidth={2.5} dot={false} />
					</LineChart>
				</ResponsiveContainer>

				<div className="grid grid-cols-3 gap-4">
					<div className="flex flex-col gap-2">
						<div className="flex justify-between text-sm">
							<span className="text-foreground/70">Startkapital</span>
							<span className="text-foreground font-mono">{startCapital.toLocaleString("de-DE")} €</span>
						</div>
						<Slider min={100} max={10000} step={100} value={[startCapital]} onValueChange={([v]) => setStartCapital(v)} />
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
							<span className="text-foreground/70">Zeitraum</span>
							<span className="text-foreground font-mono">{years} Jahre</span>
						</div>
						<Slider min={5} max={50} step={1} value={[years]} onValueChange={([v]) => setYears(v)} />
					</div>
				</div>
			</div>

			<InfoCard accent>
				Je früher du anfängst, desto länger kann der Zinseszinseffekt wirken –
				und desto größer wird der Unterschied zwischen den beiden Kurven.
			</InfoCard>
		</SlideLayout>
	)
}
