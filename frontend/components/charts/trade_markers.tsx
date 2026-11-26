import { ReferenceDot } from "recharts"
import { currencyFormat } from "@/lib/cash_display_string"
import {
	type Trade,
	type TradesByX,
	tradeKind,
	tradeTotal,
} from "@/lib/data/trades"
import { dayFormat, formatDateString, numberFormat } from "@/lib/util"

export interface TradeMarker {
	x: string
	y: number
	trades: Trade[]
}

const isBuy = (trades: Trade[]) =>
	trades.reduce((net, t) => net + t.amount, 0) >= 0

/** Green "K" (Kauf) / red "V" (Verkauf) dots on the price line. */
export function tradeDots(markers: TradeMarker[]) {
	return markers.map(m => {
		const buy = isBuy(m.trades)
		return (
			<ReferenceDot
				key={m.x}
				x={m.x}
				y={m.y}
				ifOverflow="visible"
				shape={({ cx, cy }: { cx?: number | string; cy?: number | string }) => (
					<g pointerEvents="none">
						<circle
							cx={cx}
							cy={cy}
							r={9}
							fill={buy ? "var(--win)" : "var(--loss)"}
							stroke="var(--background)"
							strokeWidth={1.5}
						/>
						<text
							x={cx}
							y={cy}
							textAnchor="middle"
							dominantBaseline="central"
							fontSize={10}
							fontWeight={700}
							fill="var(--background)"
						>
							{buy ? "K" : "V"}
						</text>
					</g>
				)}
			/>
		)
	})
}

/** Tooltip block listing the trades drawn on the hovered row. */
export function TradeTooltipRows({
	trades,
	x,
}: {
	trades?: TradesByX
	x: string
}) {
	const list = trades?.[x]
	if (!list?.length) return null
	return (
		<div className="mt-2 flex flex-col gap-1.5 border-t pt-2 text-xs">
			{list.map(t => (
				<div key={t.id} className="flex flex-col">
					<span className="font-semibold">
						{tradeKind(t) === "buy" ? "Kauf" : "Verkauf"}
						<span className="font-normal text-muted-foreground">
							{" "}
							{formatDateString(t.tstamp) ||
								dayFormat.format(new Date(t.tstamp))}
						</span>
					</span>
					<span className="number">
						{numberFormat.format(Math.abs(t.amount))} x{" "}
						{currencyFormat.format(t.price ?? 0)} ={" "}
						{currencyFormat.format(tradeTotal(t))}
					</span>
				</div>
			))}
		</div>
	)
}
