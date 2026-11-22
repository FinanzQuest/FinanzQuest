// Chart overlays: 100/200-day moving averages and market benchmarks drawn
// over an asset's price chart.

/**
 * Benchmarks: ETFs tracking the index, traded on Xetra in EUR like the
 * asset prices shown, so the lines are comparable.
 */
export const BENCHMARKS = [
	{ key: "sp500", label: "S&P 500", symbol: "SXR8.DE" },
	{ key: "world", label: "MSCI World", symbol: "EUNL.DE" },
	{ key: "em", label: "Schwellenländer", symbol: "IS3N.DE" },
	{ key: "allworld", label: "FTSE All-World", symbol: "VWCE.DE" },
] as const

export type BenchmarkKey = (typeof BENCHMARKS)[number]["key"]
export type MovingAverageKey = "ma100" | "ma200"
export type OverlayKey = MovingAverageKey | BenchmarkKey

export const MOVING_AVERAGES: { key: MovingAverageKey; label: string }[] = [
	{ key: "ma100", label: "100-Tage-Linie" },
	{ key: "ma200", label: "200-Tage-Linie" },
]

export const OVERLAY_COLOR: Record<OverlayKey, string> = {
	ma100: "var(--overlay-1)",
	ma200: "var(--overlay-2)",
	sp500: "var(--overlay-3)",
	world: "var(--overlay-4)",
	em: "var(--overlay-5)",
	allworld: "var(--overlay-6)",
}

export const OVERLAY_LABEL: Record<OverlayKey, string> = Object.fromEntries([
	...MOVING_AVERAGES.map(m => [m.key, m.label]),
	...BENCHMARKS.map(b => [b.key, b.label]),
]) as Record<OverlayKey, string>

export const isBenchmark = (key: OverlayKey): key is BenchmarkKey =>
	BENCHMARKS.some(b => b.key === key)

/** A value series sorted by time (ISO date or timestamp strings). */
export type Series = { t: string; v: number }[]

/**
 * Value of `series` at time `t`: the last point at or before it (as-of
 * join). Daily points are compared by date, so an intraday bar gets the
 * value of its day; weekly chart points get the last daily value of that
 * week's start.
 */
export function asOf(series: Series, t: string): number | null {
	const key = t.length > 10 && series[0]?.t.length === 10 ? t.slice(0, 10) : t
	let lo = 0
	let hi = series.length - 1
	let found = -1
	while (lo <= hi) {
		const mid = (lo + hi) >> 1
		if (series[mid].t <= key) {
			found = mid
			lo = mid + 1
		} else {
			hi = mid - 1
		}
	}
	return found >= 0 ? series[found].v : null
}

/** Per chart point: overlay values (benchmarks rebased) and benchmark changes. */
export type OverlayValues = Partial<Record<OverlayKey, number | null>> & {
	/** benchmark change since the first point of the chart, as a fraction */
	change?: Partial<Record<BenchmarkKey, number | null>>
}

/**
 * Adds the active overlays to every chart row. Benchmarks are rebased to
 * the asset's first close in view, so both lines start together and the
 * gap shows the relative performance.
 */
export function withOverlays<
	T extends { tstamp: string; close?: number | null },
>(
	rows: T[],
	active: OverlayKey[],
	series: Partial<Record<OverlayKey, Series>>
): Array<T & OverlayValues> {
	if (active.length === 0) return rows
	const first = rows.find(r => r.close != null)
	const base: Partial<Record<BenchmarkKey, number | null>> = {}
	for (const key of active) {
		const s = series[key]
		if (s && isBenchmark(key) && first) base[key] = asOf(s, first.tstamp)
	}
	return rows.map(row => {
		const out: T & OverlayValues = { ...row, change: {} }
		for (const key of active) {
			const s = series[key]
			if (!s) continue
			const v = row.close == null ? null : asOf(s, row.tstamp)
			if (!isBenchmark(key)) {
				out[key] = v
				continue
			}
			const b = base[key]
			const change = v != null && b ? v / b - 1 : null
			if (out.change) out.change[key] = change
			out[key] =
				change != null && first?.close != null
					? first.close * (1 + change)
					: null
		}
		return out
	})
}

/** Smallest and largest value of the price and the overlays (for the y-axis). */
export function overlayRange(
	rows: Array<OverlayValues & { close?: number | null }>,
	active: OverlayKey[]
): [number, number] | null {
	let min = Number.POSITIVE_INFINITY
	let max = Number.NEGATIVE_INFINITY
	for (const row of rows) {
		for (const v of [row.close, ...active.map(k => row[k])]) {
			if (v == null || !Number.isFinite(v)) continue
			if (v < min) min = v
			if (v > max) max = v
		}
	}
	return min <= max ? [min, max] : null
}
