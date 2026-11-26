import type { Transaction } from "@/database/custom_types"
import { msPerDay } from "@/lib/util"

/** One ledger row of an asset: amount > 0 buy, amount < 0 sell. */
export type Trade = Pick<
	Transaction,
	"id" | "tstamp" | "amount" | "price" | "commission"
>

export const tradeKind = (t: Trade) => (t.amount >= 0 ? "buy" : "sell")
export const tradeTotal = (t: Trade) => Math.abs(t.amount) * (t.price ?? 0)

/** Trades by chart x value (the row timestamp they are drawn on). */
export type TradesByX = Record<string, Trade[]>

/** Trades pinned to chart rows; those outside the visible range are dropped. */
export function tradesOnRows(
	rows: Array<{ x: string; y: number | null | undefined }>,
	trades: Trade[],
	intraday: boolean
) {
	const times = rows.map(r => Date.parse(r.x))
	const first = times.at(0)
	const last = times.at(-1)
	if (first === undefined || last === undefined) return []
	const tolerance = intraday ? msPerDay : 7 * msPerDay
	const byX = new Map<string, { x: string; y: number; trades: Trade[] }>()
	for (const trade of trades) {
		const t = Date.parse(trade.tstamp)
		if (Number.isNaN(t) || t < first || t > last + tolerance) continue
		const i = times.findLastIndex(rt => rt <= t)
		const row = rows[i]
		if (!row || row.y == null) continue
		const entry = byX.get(row.x) ?? { x: row.x, y: row.y, trades: [] }
		entry.trades.push(trade)
		byX.set(row.x, entry)
	}
	return [...byX.values()]
}

export function groupByX(
	markers: Array<{ x: string; trades: Trade[] }>
): TradesByX {
	return Object.fromEntries(markers.map(m => [m.x, m.trades]))
}

export interface PositionStats {
	shares: number
	/** Einstandskurs: average cost per share of the open shares */
	avgPrice: number | null
	/** cost basis of the open shares (incl. commission) */
	invested: number
	realized: number
	firstBuy: string | null
	count: number
}

/** Moving-average cost basis over the ledger (oldest first). */
export function positionStats(trades: Trade[]): PositionStats {
	let shares = 0
	let cost = 0
	let realized = 0
	let firstBuy: string | null = null
	for (const t of trades) {
		const value = tradeTotal(t)
		if (t.amount > 0) {
			shares += t.amount
			cost += value + t.commission
			firstBuy ??= t.tstamp
		} else if (t.amount < 0 && shares > 0) {
			const sold = Math.min(-t.amount, shares)
			const basis = (cost / shares) * sold
			realized += value - t.commission - basis
			cost -= basis
			shares -= sold
		}
	}
	if (shares < 1e-9) {
		shares = 0
		cost = 0
	}
	return {
		shares,
		avgPrice: shares > 0 ? cost / shares : null,
		invested: cost,
		realized,
		firstBuy,
		count: trades.length,
	}
}
