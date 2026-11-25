"use client"

import { useState } from "react"
import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts"
import {
	axisTick,
	Controls,
	DiagramFrame,
	formatK,
	legendStyle,
	SliderField,
	tooltipStyle,
} from "./shared"

function calcGrowth(startCapital: number, rate: number, years: number) {
	return Array.from({ length: years + 1 }, (_, i) => ({
		year: i,
		mitZinseszins: Math.round(startCapital * (1 + rate / 100) ** i),
		ohneZinseszins: Math.round(startCapital + startCapital * (rate / 100) * i),
	}))
}

const label = (v: unknown) =>
	v === "mitZinseszins" ? "Mit Zinseszins" : "Ohne Zinseszins"

export function Zinseszins() {
	const [startCapital, setStartCapital] = useState(1000)
	const [rate, setRate] = useState(7)
	const [years, setYears] = useState(30)

	const data = calcGrowth(startCapital, rate, years)
	const withCompound = data[data.length - 1].mitZinseszins
	const withoutCompound = data[data.length - 1].ohneZinseszins

	return (
		<DiagramFrame>
			<div className="flex flex-wrap items-center justify-between gap-4">
				<span className="text-sm font-semibold text-foreground">
					Wachstum über {years} Jahre
				</span>
				<div className="flex gap-6">
					<div className="flex flex-col items-end">
						<span className="text-xs text-muted-foreground">
							ohne Zinseszins
						</span>
						<span className="font-bold text-foreground/60">
							{formatK(withoutCompound)}
						</span>
					</div>
					<div className="flex flex-col items-end">
						<span className="text-xs text-muted-foreground">
							mit Zinseszins
						</span>
						<span className="text-xl font-bold text-emerald-500">
							{formatK(withCompound)}
						</span>
					</div>
				</div>
			</div>

			<ResponsiveContainer width="100%" height={200}>
				<LineChart
					data={data}
					margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
				>
					<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
					<XAxis
						dataKey="year"
						tick={axisTick}
						tickLine={false}
						label={{
							value: "Jahre",
							position: "insideBottomRight",
							fill: "var(--muted-foreground)",
							fontSize: 11,
							offset: -5,
						}}
					/>
					<YAxis
						tick={axisTick}
						tickLine={false}
						tickFormatter={formatK}
						width={55}
					/>
					<Tooltip
						contentStyle={tooltipStyle}
						labelFormatter={v => `Jahr ${v}`}
						formatter={(v, name) => [
							`${(v as number).toLocaleString("de-DE")} €`,
							label(name),
						]}
					/>
					<Legend formatter={label} wrapperStyle={legendStyle} />
					<Line
						isAnimationActive={false}
						type="monotone"
						dataKey="ohneZinseszins"
						stroke="var(--muted-foreground)"
						strokeWidth={2}
						dot={false}
						strokeDasharray="5 5"
					/>
					<Line
						isAnimationActive={false}
						type="monotone"
						dataKey="mitZinseszins"
						stroke="#10b981"
						strokeWidth={2.5}
						dot={false}
					/>
				</LineChart>
			</ResponsiveContainer>

			<Controls>
				<SliderField
					label="Startkapital"
					display={`${startCapital.toLocaleString("de-DE")} €`}
					min={100}
					max={10000}
					step={100}
					value={startCapital}
					onChange={setStartCapital}
				/>
				<SliderField
					label="Rendite"
					display={`${rate} %`}
					min={1}
					max={12}
					step={0.5}
					value={rate}
					onChange={setRate}
				/>
				<SliderField
					label="Zeitraum"
					display={`${years} Jahre`}
					min={5}
					max={50}
					step={1}
					value={years}
					onChange={setYears}
				/>
			</Controls>
		</DiagramFrame>
	)
}
