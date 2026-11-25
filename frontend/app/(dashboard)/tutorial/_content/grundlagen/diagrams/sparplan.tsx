"use client"

import { useState } from "react"
import {
	Bar,
	CartesianGrid,
	ComposedChart,
	Legend,
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
	Stat,
	tooltipStyle,
} from "./shared"

function calcSparplan(monthly: number, rate: number, years: number) {
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

export function Sparplan() {
	const [monthly, setMonthly] = useState(100)
	const [rate, setRate] = useState(7)
	const [years, setYears] = useState(30)

	const data = calcSparplan(monthly, rate, years)
	const last = data[data.length - 1]
	const endValue = last.Eingezahlt + last.Zinseszins

	// every 5th year to avoid clutter
	const chartData = data.filter(d => d.year % 5 === 0 || d.year === years)

	return (
		<DiagramFrame>
			<div className="flex flex-wrap gap-3">
				<Stat
					label={`Endwert nach ${years} Jahren`}
					value={`${endValue.toLocaleString("de-DE")} €`}
					className="text-emerald-500"
				/>
				<Stat
					label="Eigene Einzahlungen"
					value={`${last.Eingezahlt.toLocaleString("de-DE")} €`}
					className="text-foreground/70"
				/>
				<Stat
					label="Zinseszins-Gewinn"
					value={`${last.Zinseszins.toLocaleString("de-DE")} €`}
					className="text-blue-400"
				/>
			</div>

			<ResponsiveContainer width="100%" height={200}>
				<ComposedChart
					data={chartData}
					margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
				>
					<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
					<XAxis
						dataKey="year"
						tick={axisTick}
						tickLine={false}
						tickFormatter={v => `J. ${v}`}
					/>
					<YAxis
						tick={axisTick}
						tickLine={false}
						tickFormatter={v => formatK(v, 0)}
						width={55}
					/>
					<Tooltip
						contentStyle={tooltipStyle}
						labelFormatter={v => `Nach ${v} Jahren`}
						formatter={(v, name) => [
							`${(v as number).toLocaleString("de-DE")} €`,
							name,
						]}
					/>
					<Legend wrapperStyle={legendStyle} />
					<Bar
						dataKey="Eingezahlt"
						stackId="a"
						fill="var(--muted-foreground)"
						opacity={0.7}
						radius={[0, 0, 4, 4]}
					/>
					<Bar
						dataKey="Zinseszins"
						stackId="a"
						fill="#10b981"
						radius={[4, 4, 0, 0]}
					/>
				</ComposedChart>
			</ResponsiveContainer>

			<Controls>
				<SliderField
					label="Monatliche Rate"
					display={`${monthly} €`}
					min={25}
					max={500}
					step={25}
					value={monthly}
					onChange={setMonthly}
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
					label="Laufzeit"
					display={`${years} Jahre`}
					min={5}
					max={45}
					step={1}
					value={years}
					onChange={setYears}
				/>
			</Controls>
		</DiagramFrame>
	)
}
