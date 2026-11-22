import Link from "next/link"
import type React from "react"
import type { PositionSummary } from "@/database/custom_types"
import { currencyFormat } from "@/lib/cash_display_string"
import { getStockPagePath } from "@/lib/get_stock_path"
import { getIconURL } from "@/lib/icon_url"
import { cn } from "@/lib/utils"
import URLIcon from "../icon"

const signedPercent = new Intl.NumberFormat("de-DE", {
	style: "percent",
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
	signDisplay: "exceptZero",
})
const signedCurrency = new Intl.NumberFormat("de-DE", {
	style: "currency",
	currency: "EUR",
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
	signDisplay: "exceptZero",
})

// Fixed column widths: every row lines up, whatever its name length or icon.
// Phones: icon | name | value with the profit below it.
const columns =
	"grid-cols-[2.5rem_minmax(0,1fr)_auto] md:grid-cols-[2.5rem_minmax(0,1fr)_8.5rem_9.5rem_7.5rem]"

export default function PositionList({
	positions,
}: {
	positions: PositionSummary[]
}) {
	return (
		<div className="flex flex-col gap-2 py-2">
			<div
				className={cn(
					"hidden md:grid gap-x-5 px-4 text-xs text-muted-foreground",
					columns
				)}
				aria-hidden
			>
				<span />
				<span>Wertpapier</span>
				<span className="text-right">Wert</span>
				<span className="text-right">Gewinn / Verlust</span>
				<span className="text-right">Kurs</span>
			</div>
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
	const iconURL = symbol ? getIconURL(symbol, asset_type ?? "stock", 80) : null
	const profit = total_profit ?? 0
	const invested = total_invested ?? 0
	const profitRatio = invested > 0 ? profit / invested : 0
	const profitClass =
		profit > 0 ? "text-win" : profit < 0 ? "text-loss" : "text-muted-foreground"

	return (
		<Link
			href={asset_id ? getStockPagePath(asset_id) : ""}
			className={cn(
				"grid items-center gap-x-5 px-4 py-3 rounded-2xl border hover:bg-muted/40 transition-colors",
				columns,
				className
			)}
		>
			<URLIcon
				className="size-10 rounded-lg"
				size={80}
				iconURL={iconURL}
				fallback={symbol}
			/>
			<div className="flex flex-col justify-center min-w-0 gap-0.5">
				<span className="font-semibold truncate">{name ?? symbol}</span>
				{(symbol || description) && (
					<span className="text-sm text-muted-foreground truncate">
						{symbol}
						{symbol && description ? " · " : ""}
						{description}
					</span>
				)}
			</div>
			{/* phones: value and profit stacked; md+: their own columns */}
			<div className="flex flex-col items-end md:contents">
				<span className="text-right number tabular-nums font-semibold md:text-lg">
					{currencyFormat.format(market_value ?? 0)}
				</span>
				<span
					className={cn(
						"flex flex-col items-end text-sm md:text-base number tabular-nums md:border-l md:border-border/50 md:self-stretch md:justify-center",
						profitClass
					)}
				>
					<span className="hidden md:inline">
						{signedCurrency.format(profit)}
					</span>
					<span className="text-xs md:text-sm">
						{signedPercent.format(profitRatio)}
					</span>
				</span>
			</div>
			<span className="hidden md:flex items-center justify-end self-stretch border-l border-border/50 number tabular-nums">
				{currencyFormat.format(current_price ?? 0)}
			</span>
		</Link>
	)
}
