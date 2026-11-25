"use client"

import type { ReactNode } from "react"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

/** base-ui Slider reports a number, or an array for range sliders */
export const sliderValue = (value: number | readonly number[]) =>
	typeof value === "number" ? value : value[0]

export const tooltipStyle = {
	background: "var(--card)",
	border: "1px solid var(--border)",
	borderRadius: 8,
	fontSize: 12,
	color: "var(--foreground)",
}

export const axisTick = { fill: "var(--muted-foreground)", fontSize: 11 }

export const legendStyle = { fontSize: 12, color: "var(--muted-foreground)" }

export function formatK(v: number, digits = 1) {
	return v >= 1000 ? `${(v / 1000).toFixed(digits)}k €` : `${v} €`
}

/** Card-like frame; data-no-swipe keeps chart/slider drags from triggering swipes. */
export function DiagramFrame({
	children,
	className,
}: {
	children: ReactNode
	className?: string
}) {
	return (
		<div
			data-no-swipe
			className={cn(
				"flex min-w-0 flex-col gap-4 rounded-xl border bg-muted/40 p-4",
				className
			)}
		>
			{children}
		</div>
	)
}

export function SliderField({
	label,
	display,
	min,
	max,
	step,
	value,
	onChange,
}: {
	label: string
	display: string
	min: number
	max: number
	step: number
	value: number
	onChange: (v: number) => void
}) {
	return (
		<div className="flex min-w-[8rem] flex-1 flex-col gap-2">
			<div className="flex justify-between gap-2 text-sm">
				<span className="text-foreground/70">{label}</span>
				<span className="font-mono text-foreground">{display}</span>
			</div>
			<Slider
				min={min}
				max={max}
				step={step}
				value={[value]}
				onValueChange={v => onChange(sliderValue(v))}
			/>
		</div>
	)
}

/** Wrapping row of slider fields (stacks on narrow screens). */
export function Controls({ children }: { children: ReactNode }) {
	return <div className="flex flex-wrap gap-x-6 gap-y-4">{children}</div>
}

export function Stat({
	label,
	value,
	className,
}: {
	label: string
	value: string
	className?: string
}) {
	return (
		<div className="flex min-w-0 flex-1 flex-col gap-0.5 rounded-lg border bg-muted/60 p-3">
			<span className="text-xs text-muted-foreground">{label}</span>
			<span className={cn("text-lg font-bold", className)}>{value}</span>
		</div>
	)
}
