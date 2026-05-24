import Link from "next/link"
import type React from "react"
import { getStockPagePath } from "@/lib/get_stock_path"
import { Card } from "../ui/card"
import "./style.css"
import type { PositionSummary } from "@/database/custom_types"
import { currencyFormat } from "@/lib/cash_display_string"
import { getIconURL } from "@/lib/icon_url"
import { cn } from "@/lib/utils"
import URLIcon from "../icon"

export default function PositionList({
	positions,
}: {
	positions: PositionSummary[]
}) {
	// "grid  p-3 gap-3 rounded-xl"
	return (
		<div className="grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] pt-3 pb-6 gap-4">
			{positions.map(position => (
				<PositionRow key={position.asset_id} position={position} />
			))}
		</div>
	)
}

interface PositionRowProps extends React.ComponentPropsWithoutRef<"div"> {
	position: PositionSummary
}

export function PositionRow({
	position: {
		market_value,
		total_profit,
		current_price,
		name,
		asset_type,
		asset_id,
		symbol,
	},
	className,
}: PositionRowProps) {
	// "p-3 flex flex-row gap-3 border-b w-max"

	let indicatorClass =
		"bg-gradient-to-r from-accent-foreground/60 via-accent-foreground/25 to-transparent to-[100px] bg-no-repeat"
	if (total_profit && total_profit !== 0) {
		indicatorClass =
			total_profit > 0
				? "bg-gradient-to-r from-win/60 via-win/25 to-transparent to-[100px] bg-no-repeat"
				: "bg-gradient-to-r from-loss/35 to-transparent to-[100px] bg-no-repeat"
	}
	const iconURL = symbol ? getIconURL(symbol, asset_type ?? "stock", 40) : null

	return (
		<Card
			className={cn(
				className,
				"flex overflow-hidden flex-row flex-wrap rounded-xl max-w-[800px]",

				indicatorClass
			)}
		>
			<Link
				href={asset_id ? getStockPagePath(asset_id) : ""}
				className="flex flex-col p-6 pb-3 gap-1 items-start overflow-hidden"
			>
				<div className="flex flex-row gap-2">
					<URLIcon
						className="h-[1.4lh] aspect-square w-auto self-center rounded"
						size={100}
						iconURL={iconURL}
					/>
					<span className="text-2xl self-end font-bold hover:underline-offset-4 transition-all no-underline hover:underline">
						{name}
					</span>
				</div>
				<div className="mb-[.1lh] text-ellipsis whitespace-nowrap overflow-hidden max-w-full text-muted-foreground">
					{symbol}
				</div>
				{/*<div className="text-muted-foreground text-sm hidden md:block text-ellipsis max-w-full overflow-hidden whitespace-nowrap">
          {description}
        </div>*/}
			</Link>
			<div className="border-t row-span-1 row-start-2 self-end px-3 py-3 *:rounded-none col-start-1 h-fit gap-3 justify-evenly w-full flex flex-row overflow-hidden shadow bg-muted/10 backdrop-blur-3xl">
				<div>
					<div className="text-sm text-muted-foreground">Marktwert</div>
					<div className="text-lg number">
						{currencyFormat.format(market_value ?? 0)}
					</div>
				</div>
				<div>
					<div className="text-sm text-muted-foreground">Performance</div>
					<div className="text-lg number">
						{currencyFormat.format(total_profit ?? 0)}
					</div>
				</div>
				<div>
					<div className="text-sm text-muted-foreground">Aktueller Preis</div>
					<div className="text-lg number">
						{currencyFormat.format(current_price ?? 0)}
					</div>
				</div>
			</div>
		</Card>
	)
}
