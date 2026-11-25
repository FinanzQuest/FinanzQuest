"use client"

import { useState } from "react"
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts"
import {
	axisTick,
	Controls,
	DiagramFrame,
	SliderField,
	tooltipStyle,
} from "./shared"

function calcPurchasingPower(startAmount: number, rate: number, years: number) {
	return Array.from({ length: years + 1 }, (_, i) => ({
		year: i,
		kaufkraft: Math.round(startAmount * (1 - rate / 100) ** i),
	}))
}

export function Kaufkraft() {
	const [rate, setRate] = useState(2.3)
	const [years, setYears] = useState(30)

	const data = calcPurchasingPower(100, rate, years)
	const finalValue = data[data.length - 1].kaufkraft

	return (
		<DiagramFrame>
			<div className="flex flex-wrap items-center justify-between gap-2">
				<span className="text-sm font-semibold text-foreground">
					Kaufkraft von 100 € über die Zeit
				</span>
				<div className="flex items-center gap-2">
					<span className="text-xs text-muted-foreground">
						Wert nach {years} Jahren:
					</span>
					<span className="text-2xl font-bold text-amber-500">
						{finalValue} €
					</span>
				</div>
			</div>

			<ResponsiveContainer width="100%" height={180}>
				<AreaChart
					className="[&>svg]:overflow-visible"
					data={data}
					margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
				>
					<defs>
						<linearGradient id="kaufkraftGrad" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
							<stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
						</linearGradient>
					</defs>
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
						tickFormatter={v => `${v} €`}
						domain={[0, 100]}
					/>
					<Tooltip
						contentStyle={tooltipStyle}
						labelFormatter={v => `Jahr ${v}`}
						formatter={v => [`${v} €`, "Kaufkraft"]}
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

			<Controls>
				<SliderField
					label="Inflationsrate"
					display={`${rate.toFixed(1)} %`}
					min={1}
					max={5}
					step={0.1}
					value={rate}
					onChange={setRate}
				/>
				<SliderField
					label="Zeitraum"
					display={`${years} Jahre`}
					min={1}
					max={50}
					step={1}
					value={years}
					onChange={setYears}
				/>
			</Controls>
		</DiagramFrame>
	)
}
