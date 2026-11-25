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

const Y_MAX = (() => {
	const months = (65 - 18) * 12
	let value = 0
	for (let m = 0; m < months; m++) value = (value + 500) * (1 + 7 / 100 / 12)
	return Math.round(value)
})()

function calcSparplan(startAge: number, monthlyRate: number, rate: number) {
	const months = (65 - startAge) * 12
	let value = 0
	const yearlyData: { age: number; value: number }[] = []
	for (let m = 0; m < months; m++) {
		value = (value + monthlyRate) * (1 + rate / 100 / 12)
		if (m % 12 === 11) {
			yearlyData.push({
				age: startAge + Math.floor(m / 12) + 1,
				value: Math.round(value),
			})
		}
	}
	return yearlyData
}

export function FaktorZeit() {
	const [ageA, setAgeA] = useState(25)
	const [ageB, setAgeB] = useState(35)
	const [monthly, setMonthly] = useState(100)

	const dataA = calcSparplan(ageA, monthly, 7)
	const dataB = calcSparplan(ageB, monthly, 7)

	const endA = dataA[dataA.length - 1]?.value ?? 0
	const endB = dataB[dataB.length - 1]?.value ?? 0

	const allAges = Array.from(
		new Set([...dataA.map(d => d.age), ...dataB.map(d => d.age)])
	).sort((a, b) => a - b)
	const chartData = allAges.map(age => ({
		age,
		A: dataA.find(d => d.age === age)?.value ?? null,
		B: dataB.find(d => d.age === age)?.value ?? null,
	}))

	const nameOf = (key: unknown) =>
		key === "A" ? `Start mit ${ageA}` : `Start mit ${ageB}`

	return (
		<DiagramFrame>
			<div className="grid grid-cols-2 gap-3">
				<div className="flex flex-col gap-1 rounded-lg border bg-muted/60 p-3">
					<span className="text-xs text-muted-foreground">
						Start mit {ageA}
					</span>
					<span className="text-xl font-bold text-emerald-500">
						{endA.toLocaleString("de-DE")} €
					</span>
					<span className="text-xs text-foreground/60">
						{65 - ageA} Jahre Anlagezeit
					</span>
				</div>
				<div className="flex flex-col gap-1 rounded-lg border bg-muted/60 p-3">
					<span className="text-xs text-muted-foreground">
						Start mit {ageB}
					</span>
					<span className="text-xl font-bold text-foreground/70">
						{endB.toLocaleString("de-DE")} €
					</span>
					<span className="text-xs text-foreground/60">
						{65 - ageB} Jahre Anlagezeit
					</span>
				</div>
			</div>

			<ResponsiveContainer width="100%" height={200}>
				<LineChart
					data={chartData}
					margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
				>
					<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
					<XAxis
						dataKey="age"
						tick={axisTick}
						tickLine={false}
						label={{
							value: "Alter",
							position: "insideBottomRight",
							fill: "var(--muted-foreground)",
							fontSize: 11,
							offset: -5,
						}}
					/>
					<YAxis
						tick={axisTick}
						tickLine={false}
						tickFormatter={v => formatK(v, 0)}
						width={55}
						domain={[0, Y_MAX]}
					/>
					<Tooltip
						contentStyle={tooltipStyle}
						labelFormatter={v => `Alter ${v}`}
						formatter={(v, name) => [
							`${(v as number).toLocaleString("de-DE")} €`,
							nameOf(name),
						]}
					/>
					<Legend formatter={nameOf} wrapperStyle={legendStyle} />
					<Line
						type="monotone"
						dataKey="A"
						stroke="#10b981"
						strokeWidth={2.5}
						dot={false}
						connectNulls={false}
					/>
					<Line
						type="monotone"
						dataKey="B"
						stroke="var(--muted-foreground)"
						strokeWidth={2}
						dot={false}
						strokeDasharray="5 5"
						connectNulls={false}
					/>
				</LineChart>
			</ResponsiveContainer>

			<Controls>
				<SliderField
					label="Startalter A"
					display={`${ageA} Jahre`}
					min={18}
					max={50}
					step={1}
					value={ageA}
					onChange={v => setAgeA(Math.min(v, ageB - 1))}
				/>
				<SliderField
					label="Startalter B"
					display={`${ageB} Jahre`}
					min={18}
					max={60}
					step={1}
					value={ageB}
					onChange={v => setAgeB(Math.max(v, ageA + 1))}
				/>
				<SliderField
					label="Monatliche Rate"
					display={`${monthly} €`}
					min={25}
					max={500}
					step={25}
					value={monthly}
					onChange={setMonthly}
				/>
			</Controls>

			{ageA < ageB && (
				<p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm leading-relaxed text-emerald-700 dark:text-emerald-200">
					{ageB - ageA} Jahre früher anfangen ergibt{" "}
					<span className="font-semibold">
						{(endA - endB).toLocaleString("de-DE")} € mehr
					</span>{" "}
					- obwohl in diesem Zeitraum nur{" "}
					{((ageB - ageA) * 12 * monthly).toLocaleString("de-DE")} € mehr
					eingezahlt wurden. Den Rest erledigt der Zinseszins.
				</p>
			)}
		</DiagramFrame>
	)
}
