"use client"

import type { ReactNode } from "react"

export const GOOD = "#10b981"
export const BAD = "#f43f5e"
export const NEUTRAL = "#6366f1"
export const AMBER = "#f59e0b"
export const MUTED = "var(--muted-foreground)"
export const GRID = "var(--border)"

export const tick = { fontSize: 11, fill: MUTED }

export function Frame({
	children,
	note,
}: {
	children: ReactNode
	note?: string
}) {
	return (
		<div className="rounded-xl border border-border bg-card p-3 sm:p-4">
			{children}
			{note ? (
				<p className="mt-2 text-xs text-muted-foreground">{note}</p>
			) : null}
		</div>
	)
}

export function Stat({ label, value }: { label: string; value: string }) {
	return (
		<div className="min-w-0 flex-1">
			<div className="text-xs text-muted-foreground">{label}</div>
			<div className="text-base font-semibold tabular-nums sm:text-lg">
				{value}
			</div>
		</div>
	)
}

export function Labeled({
	label,
	children,
}: {
	label: string
	children: ReactNode
}) {
	return (
		<div className="mt-3">
			<div className="mb-2 text-xs text-muted-foreground">{label}</div>
			{children}
		</div>
	)
}

export const num = (v: number, d = 1) =>
	v.toLocaleString("de-DE", {
		minimumFractionDigits: d,
		maximumFractionDigits: d,
	})

export const pct = (v: number, d = 1) => `${num(v, d)} %`

export const first = (v: number | readonly number[]) =>
	Array.isArray(v) ? (v[0] as number) : (v as number)
