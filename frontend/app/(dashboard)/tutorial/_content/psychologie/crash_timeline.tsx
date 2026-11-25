"use client"

import { useState } from "react"
import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts"
import { cn } from "@/lib/utils"
import { RED } from "./shared"

interface Crash {
	id: string
	label: string
	period: string
	drawdown: number
	monthsDown: number
	monthsRecovery: number
	cause: string
}

// Approximate values for a global stock index (MSCI World, USD), rounded.
const crashes: Crash[] = [
	{
		id: "dotcom",
		label: "Dotcom",
		period: "2000 bis 2003",
		drawdown: -49,
		monthsDown: 31,
		monthsRecovery: 84,
		cause: "Internet-Aktien waren völlig überbewertet, die Blase platzte.",
	},
	{
		id: "fin",
		label: "Finanzkrise",
		period: "2007 bis 2009",
		drawdown: -57,
		monthsDown: 17,
		monthsRecovery: 66,
		cause: "Platzende US-Immobilienkredite brachten Banken ins Wanken.",
	},
	{
		id: "euro",
		label: "Euro-Krise",
		period: "2011",
		drawdown: -19,
		monthsDown: 5,
		monthsRecovery: 12,
		cause: "Angst vor Staatspleiten in Südeuropa und US-Schuldenstreit.",
	},
	{
		id: "covid",
		label: "Covid",
		period: "2020",
		drawdown: -34,
		monthsDown: 1,
		monthsRecovery: 6,
		cause:
			"Lockdowns weltweit. Ein sehr schneller Absturz mit schneller Erholung.",
	},
	{
		id: "zins",
		label: "Zinswende",
		period: "2022",
		drawdown: -26,
		monthsDown: 9,
		monthsRecovery: 24,
		cause: "Hohe Inflation, die Notenbanken erhöhten die Zinsen stark.",
	},
]

export function CrashTimeline() {
	const [id, setId] = useState("dotcom")
	const c = crashes.find(x => x.id === id) ?? crashes[0]
	const trough = 100 + c.drawdown
	const data = [
		{ m: 0, v: 100 },
		{ m: c.monthsDown, v: trough },
		{ m: c.monthsRecovery, v: 100 },
	]
	return (
		<div className="rounded-xl border border-border bg-card p-4 space-y-3">
			<div className="flex flex-wrap gap-2">
				{crashes.map(x => (
					<button
						key={x.id}
						type="button"
						onClick={() => setId(x.id)}
						aria-pressed={x.id === id}
						className={cn(
							"rounded-full border px-3 py-1.5 text-xs font-medium transition-colors motion-reduce:transition-none",
							x.id === id
								? "border-foreground bg-foreground text-background"
								: "border-border text-muted-foreground hover:text-foreground"
						)}
					>
						{x.label}
					</button>
				))}
			</div>
			<div className="grid grid-cols-3 gap-2 text-center">
				<Stat label="Tiefster Stand" value={`ca. ${c.drawdown} %`} red />
				<Stat label="Absturz" value={`ca. ${c.monthsDown} Mon.`} />
				<Stat
					label="Bis zum alten Hoch"
					value={`ca. ${c.monthsRecovery} Mon.`}
				/>
			</div>
			<p className="text-sm text-foreground/75">
				<span className="font-medium">{c.period}:</span> {c.cause}
			</p>
			<div
				className="h-40 w-full"
				role="img"
				aria-label={`Schematischer Verlauf: Absturz um ca. ${Math.abs(c.drawdown)} Prozent, danach Erholung nach ca. ${c.monthsRecovery} Monaten`}
			>
				<ResponsiveContainer width="100%" height="100%">
					<LineChart
						data={data}
						margin={{ top: 8, right: 8, bottom: 0, left: -20 }}
					>
						<CartesianGrid strokeDasharray="3 3" opacity={0.3} />
						<XAxis
							dataKey="m"
							type="number"
							domain={[0, 84]}
							tick={{ fontSize: 11 }}
						/>
						<YAxis domain={[30, 105]} tick={{ fontSize: 11 }} />
						<Line
							dataKey="v"
							stroke={RED}
							strokeWidth={2}
							dot
							isAnimationActive={false}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
			<p className="text-xs text-muted-foreground">
				Schematisch, x-Achse in Monaten ab Hoch. Gerundete Näherungswerte für
				einen Welt-Aktienindex (MSCI World, USD); Quelle: Größenordnungen nach
				öffentlichen Indexdaten von MSCI, keine exakten Werte.
			</p>
		</div>
	)
}

function Stat({
	label,
	value,
	red,
}: {
	label: string
	value: string
	red?: boolean
}) {
	return (
		<div className="rounded-lg bg-muted/50 p-2">
			<div className={cn("text-sm font-semibold", red && "text-rose-500")}>
				{value}
			</div>
			<div className="text-[11px] text-muted-foreground leading-tight">
				{label}
			</div>
		</div>
	)
}
