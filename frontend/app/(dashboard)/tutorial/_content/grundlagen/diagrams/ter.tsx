"use client"

import {
	Area,
	AreaChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts"
import { currencyFormat } from "@/lib/cash_display_string"
import { axisTick, DiagramFrame, legendStyle, tooltipStyle } from "./shared"

function calcGrowthWithTER(
	start: number,
	grossReturn: number,
	ter: number,
	years: number
) {
	const netRate = (grossReturn - ter) / 100
	return Array.from({ length: years + 1 }, (_, i) => ({
		year: i,
		value: Math.round(start * (1 + netRate) ** i),
	}))
}

const etfData = calcGrowthWithTER(10000, 7, 0.2, 30)
const activeFundData = calcGrowthWithTER(10000, 7, 1.5, 30)

const chartData = etfData.map((d, i) => ({
	year: d.year,
	ETF: d.value,
	AktiverFonds: activeFundData[i].value,
}))

const label = (v: unknown) =>
	v === "ETF" ? "ETF (0,2 % TER)" : "Aktiver Fonds (1,5 % TER)"

export function TerVergleich() {
	const etfEnd = etfData[etfData.length - 1].value
	const fundEnd = activeFundData[activeFundData.length - 1].value

	return (
		<DiagramFrame>
			<div className="grid grid-cols-2 gap-3">
				<div className="flex flex-col gap-1 rounded-lg bg-muted p-3">
					<span className="text-xs text-muted-foreground">ETF (TER 0,2 %)</span>
					<span className="text-xl font-bold text-emerald-500">
						{etfEnd.toLocaleString("de-DE")} €
					</span>
				</div>
				<div className="flex flex-col gap-1 rounded-lg bg-muted p-3">
					<span className="text-xs text-muted-foreground">
						Aktiver Fonds (TER 1,5 %)
					</span>
					<span className="text-xl font-bold text-foreground/60">
						{fundEnd.toLocaleString("de-DE")} €
					</span>
				</div>
			</div>
			<ResponsiveContainer width="100%" height={180}>
				<AreaChart
					data={chartData}
					margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
				>
					<defs>
						<linearGradient id="etfGrad" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
							<stop offset="95%" stopColor="#10b981" stopOpacity={0} />
						</linearGradient>
						<linearGradient id="fundGrad" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="#71717a" stopOpacity={0.2} />
							<stop offset="95%" stopColor="#71717a" stopOpacity={0} />
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
						tickFormatter={v => currencyFormat.format(v)}
						width={60}
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
					<Area
						type="monotone"
						dataKey="AktiverFonds"
						stroke="var(--muted-foreground)"
						strokeWidth={2}
						fill="url(#fundGrad)"
						strokeDasharray="5 5"
					/>
					<Area
						type="monotone"
						dataKey="ETF"
						stroke="#10b981"
						strokeWidth={2.5}
						fill="url(#etfGrad)"
					/>
				</AreaChart>
			</ResponsiveContainer>
			<p className="text-xs text-muted-foreground">
				Gleiche Rendite vor Kosten (7 %), Startkapital 10.000 €, Laufzeit 30
				Jahre. Differenz:{" "}
				<span className="font-medium text-foreground">
					{(etfEnd - fundEnd).toLocaleString("de-DE")} €
				</span>{" "}
				- allein durch den Kostenunterschied.
			</p>
		</DiagramFrame>
	)
}
