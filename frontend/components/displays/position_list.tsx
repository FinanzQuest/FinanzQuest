import Link from "next/link"
import type React from "react"
import type { PositionSummary } from "@/database/custom_types"
import { currencyFormat } from "@/lib/cash_display_string"
import { getStockPagePath } from "@/lib/get_stock_path"
import { getIconURL } from "@/lib/icon_url"
import { cn } from "@/lib/utils"
import URLIcon from "../icon"

// Shared column template so the subgrid rows align with their container.
export const positionColumns =
	"grid-cols-[max-content_minmax(0,1fr)_max-content_max-content_max-content]"

export default function PositionList({
	positions,
}: {
	positions: PositionSummary[]
}) {
	return (
		<div
			className={cn(
				"grid gap-x-6 py-2 divide-y divide-border/50 gap-y-2",
				positionColumns
			)}
		>
			{positions.map(position => (
				<PositionRow key={position.asset_id} position={position} />
			))}
		</div>
	)
}

interface PositionRowProps extends React.ComponentPropsWithoutRef<"a"> {
	position: PositionSummary
}

export function PositionRow({
	position: {
		market_value,
		total_profit,
		total_invested,
		current_price,
		name,
		asset_type,
		asset_id,
		symbol,
		description,
	},
	className,
}: PositionRowProps) {
	const iconURL = symbol ? getIconURL(symbol, asset_type ?? "stock", 40) : null

	const profit = total_profit ?? 0
	const invested = total_invested ?? 0
	const profitPercent = invested > 0 ? (profit / invested) * 100 : 0
	const profitSign = profit > 0 ? "+" : ""
	const profitClass = profit >= 0 ? "text-win" : "text-loss"

	return (
		<Link
			href={asset_id ? getStockPagePath(asset_id) : ""}
			className={cn(
				"grid grid-cols-subgrid col-span-full items-center gap-x-6 px-5 py-3 hover:bg-muted/40 rounded-2xl border",

				className
			)}
		>
			<URLIcon
				className="h-[1.6lh] aspect-square w-auto rounded"
				size={100}
				iconURL={iconURL}
			/>
			<div className="flex flex-col justify-center min-w-0 gap-0.5">
				<span className="font-semibold text-lg truncate">{name ?? symbol}</span>
				{(symbol || description) && (
					<span className="text-sm text-muted-foreground truncate">
						{symbol}
						{symbol && description ? " · " : ""}
						{description}
					</span>
				)}
			</div>
			<div className="flex items-center justify-end text-lg number tabular-nums">
				{currencyFormat.format(market_value ?? 0)}
			</div>
			<div
				className={cn(
					"flex items-center justify-end gap-1 self-stretch border-l border-border/50 pl-6 text-lg number tabular-nums",
					profitClass
				)}
			>
				{profitSign}
				{currencyFormat.format(profit)}
				<span className="text-md">
					({profitSign}
					{Math.abs(profitPercent).toFixed(2)} %)
				</span>
			</div>
			<div className="flex items-center justify-end self-stretch border-l border-border/50 pl-6 text-lg number tabular-nums">
				{currencyFormat.format(current_price ?? 0)}
			</div>
		</Link>
	)
}
