"use client"

import { useEffect, useState } from "react"
import {
	CartesianGrid,
	Line,
	LineChart,
	ReferenceLine,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts"
import { Button } from "@/components/ui/button"
import { signedPercentFormat } from "@/lib/util"
import { BLUE, eur, GREEN, interpolate, RED } from "./shared"

const MONTHS = 60
const START = 10000
const TICK_MS = 220

// Stylised crash (similar in shape to 2007-09), index = 100 at start.
const base = interpolate(
	[
		[0, 100],
		[6, 93],
		[10, 79],
		[14, 66],
		[17, 52],
		[20, 60],
		[24, 49],
		[30, 62],
		[40, 82],
		[52, 100],
		[60, 118],
	],
	MONTHS
)
const path = base.map((v, m) => (m === 0 ? v : v + Math.sin(m * 1.9) * 1.6))

function prefersReducedMotion() {
	if (typeof window === "undefined") return false
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function PanicGame() {
	const [month, setMonth] = useState(0)
	const [running, setRunning] = useState(false)
	const [soldAt, setSoldAt] = useState<number | null>(null)
	const [reduced, setReduced] = useState(false)

	useEffect(() => setReduced(prefersReducedMotion()), [])

	useEffect(() => {
		if (!running) return
		const t = setInterval(() => {
			setMonth(m => {
				if (m >= MONTHS - 1) {
					setRunning(false)
					return MONTHS
				}
				return m + 1
			})
		}, TICK_MS)
		return () => clearInterval(t)
	}, [running])

	const started = month > 0
	const finished = month >= MONTHS
	const value = path[month]
	const heldValue = (START * value) / 100
	const soldValue = soldAt === null ? null : (START * path[soldAt]) / 100
	const finalHold = (START * path[MONTHS]) / 100
	const data = path.slice(0, month + 1).map((v, m) => ({ m, v }))

	const sell = () => {
		setSoldAt(month)
		if (reduced) setRunning(false)
	}
	const reset = () => {
		setMonth(0)
		setSoldAt(null)
		setRunning(false)
	}
	const step = (n: number) => setMonth(m => Math.min(MONTHS, m + n))

	return (
		<div className="rounded-xl border border-border bg-card p-4 space-y-3">
			<div className="flex items-end justify-between gap-2">
				<div>
					<div className="text-xs text-muted-foreground">
						Monat {month} von {MONTHS}
					</div>
					<div className="text-2xl font-semibold tabular-nums">
						{eur(soldValue ?? heldValue)}
					</div>
				</div>
				<div
					className={`text-sm font-medium tabular-nums ${value >= 100 ? "text-emerald-500" : "text-rose-500"}`}
				>
					{signedPercentFormat.format((soldValue ?? heldValue) / START - 1)}
				</div>
			</div>
			<div
				className="h-44 w-full"
				role="img"
				aria-label="Kursverlauf der Crash-Simulation"
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
							domain={[0, MONTHS]}
							tick={{ fontSize: 11 }}
						/>
						<YAxis domain={[40, 125]} tick={{ fontSize: 11 }} />
						<ReferenceLine y={100} strokeDasharray="4 4" opacity={0.5} />
						{soldAt !== null && (
							<ReferenceLine
								x={soldAt}
								stroke={RED}
								label={{ value: "Verkauft", fontSize: 11, fill: RED }}
							/>
						)}
						<Line
							dataKey="v"
							stroke={BLUE}
							strokeWidth={2}
							dot={false}
							isAnimationActive={false}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>

			{!finished && (
				<div className="flex flex-wrap gap-2">
					{!started && !reduced && (
						<Button onClick={() => setRunning(true)}>Start</Button>
					)}
					{reduced && (
						<>
							<Button variant="outline" onClick={() => step(1)}>
								Nächster Monat
							</Button>
							<Button variant="outline" onClick={() => step(6)}>
								+6 Monate
							</Button>
						</>
					)}
					{started && !reduced && (
						<Button variant="outline" onClick={() => setRunning(r => !r)}>
							{running ? "Pause" : "Weiter"}
						</Button>
					)}
					{soldAt === null && started && (
						<Button variant="destructive" onClick={sell}>
							Verkaufen
						</Button>
					)}
					{!started && (
						<p className="text-xs text-muted-foreground basis-full">
							Du hast {eur(START)} (virtuell) in einen Welt-Index investiert.
							Halte durch oder verkaufe, wann Du willst.
						</p>
					)}
				</div>
			)}

			{finished && (
				<div className="space-y-2 text-sm">
					<div className="grid grid-cols-2 gap-2">
						<div className="rounded-lg bg-muted/50 p-3">
							<div className="text-xs text-muted-foreground">Du</div>
							<div
								className="font-semibold"
								style={{ color: soldAt === null ? GREEN : RED }}
							>
								{soldAt === null ? "Gehalten" : `Verkauft in Monat ${soldAt}`}
							</div>
							<div className="tabular-nums">{eur(soldValue ?? finalHold)}</div>
						</div>
						<div className="rounded-lg bg-muted/50 p-3">
							<div className="text-xs text-muted-foreground">Nur halten</div>
							<div className="font-semibold" style={{ color: GREEN }}>
								Monat {MONTHS}
							</div>
							<div className="tabular-nums">{eur(finalHold)}</div>
						</div>
					</div>
					<p className="text-foreground/75">
						{soldAt === null
							? "Du hast durchgehalten. Die Erholung hat den Absturz mehr als ausgeglichen. Das fühlt sich im Tief unmöglich an."
							: soldValue !== null && soldValue > START
								? "Du hast mit Gewinn verkauft, aber den späteren Anstieg verpasst."
								: "Verlust realisiert: Du hast den Kurs-Rückgang endgültig gemacht und die Erholung verpasst. Verluste schmerzen etwa doppelt so stark wie gleich große Gewinne freuen (Verlustaversion)."}
					</p>
					<Button variant="outline" onClick={reset}>
						Nochmal spielen
					</Button>
				</div>
			)}
		</div>
	)
}
