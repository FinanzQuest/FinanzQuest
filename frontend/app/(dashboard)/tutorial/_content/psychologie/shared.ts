import { numberFormat } from "@/lib/util"

export const GREEN = "#10b981"
export const RED = "#f43f5e"
export const BLUE = "#6366f1"

/** Whole euros, e.g. "10.000 €". */
export const eur = (x: number) => `${numberFormat.format(Math.round(x))} €`

/** Linear interpolation through [month, value] knots, one value per month. */
export function interpolate(knots: [number, number][], months: number) {
	const out: number[] = []
	for (let m = 0; m <= months; m++) {
		let i = 0
		while (i < knots.length - 2 && knots[i + 1][0] < m) i++
		const [m0, v0] = knots[i]
		const [m1, v1] = knots[i + 1]
		out.push(v0 + ((v1 - v0) * (m - m0)) / (m1 - m0))
	}
	return out
}
