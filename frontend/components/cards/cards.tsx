import { X } from "lucide-react"
import type { ComponentPropsWithoutRef } from "react"
import { Badge } from "@/components/ui/badge"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import type {
	Asset,
	Depot,
	DepotPosition,
	StockPrice,
} from "@/database/custom_types"
import { currencyFormat, to_display_string } from "@/lib/cash_display_string"
import { getIconURL } from "@/lib/icon_url"
import { toAbsoluteTimeString } from "@/lib/util"
import { cn } from "@/lib/utils"
import URLIcon from "../icon"
import ChangeStat from "../stat/change_stat"
import BuyStockDialog from "../transaction_dialogs/buy_stock_dialog"
import SellStockDialog from "../transaction_dialogs/sell_stock_dialog"

type CardProps = ComponentPropsWithoutRef<"div">

type Price = Omit<StockPrice, "asset_id">

interface StockHeaderProps extends CardProps {
	stock: Asset
	currentPrice?: Price
	referencePrice?: Price
	dateString?: string
	depot?: Depot | null
	position?: DepotPosition
	commission: number
}

function calculateChange(currentPrice?: Price, referencePrice?: Price) {
	if (!currentPrice?.close || !currentPrice.open || !referencePrice?.close)
		return { change24h: null, absoluteChange: null, relativeChange: null }

	const change24h = currentPrice.close - (referencePrice?.close ?? 0)
	const absoluteChange = currentPrice.close - currentPrice.open
	const relativeChange = (absoluteChange / currentPrice.open) * 100
	return { change24h, absoluteChange, relativeChange }
}

export function StockHeader({
	className,
	stock: asset,
	currentPrice,
	referencePrice,
	dateString,
	depot,
	position,
	commission,
}: StockHeaderProps) {
	const stats = calculateChange(currentPrice, referencePrice)
	const lastUpdated = dateString ?? currentPrice?.tstamp
	const close = currentPrice?.close ?? null
	const buyLimit = Math.max(0, (depot?.cash ?? 0) - commission)
	const sellLimit = position?.worth ?? 0

	return (
		<header className={cn("flex flex-col gap-4", className)}>
			<div className="flex flex-row flex-wrap items-center justify-between gap-x-6 gap-y-4">
				<div className="flex flex-row gap-4 items-center">
					<URLIcon
						className="size-[4lh] rounded-lg"
						size={100}
						iconURL={getIconURL(asset.symbol, asset.asset_type, 128)}
					/>
					<div className="flex flex-col gap-0.5">
						<span className="text-3xl font-extrabold tracking-tight">
							{asset.symbol}
						</span>
						<span className="text-muted-foreground">{asset.name}</span>
						<span className="text-sm text-muted-foreground">
							{asset.description}
						</span>
					</div>
				</div>
				{depot && close != null && (
					<div className="flex flex-row gap-3">
						<BuyStockDialog
							stock={{
								name: asset.name,
								id: asset.id,
								price: close,
							}}
							depot={{ id: depot.id, monetaryAssets: depot.cash }}
							commission={commission}
							limit={buyLimit}
							triggerSize="lg"
						/>
						<SellStockDialog
							stock={{
								name: asset.name,
								id: asset.id,
								price: close,
							}}
							depot={{ id: depot.id, monetaryAssets: depot.cash }}
							commission={commission}
							limit={sellLimit}
							triggerSize="lg"
						/>
					</div>
				)}
			</div>
			<div className="flex flex-col gap-1">
				<span className="text-sm text-muted-foreground">Aktueller Wert</span>
				<span className="text-[clamp(2rem,4vw,3.5rem)] leading-none font-extrabold number tabular-nums tracking-tight">
					{currencyFormat.format(close ?? 0)}
				</span>
			</div>
			<div className="flex flex-row gap-x-8 gap-y-3 flex-wrap">
				<ChangeStat
					label="24h"
					value={stats.change24h ?? 0}
					prev={referencePrice?.close ?? null}
				/>
				<ChangeStat
					label="Heute"
					value={stats.absoluteChange ?? 0}
					prev={currentPrice?.open ?? null}
				/>
			</div>
			<span className="text-xs text-muted-foreground">
				{lastUpdated
					? `Stand des ${toAbsoluteTimeString(new Date(lastUpdated))}`
					: ""}
			</span>
		</header>
	)
}

interface ErrorCardProps extends CardProps {
	error: Error
}

export function ErrorCard({ error, className }: ErrorCardProps) {
	return (
		<Card className={cn(className)}>
			<CardHeader>
				<CardTitle className="flex flex-row gap-1">
					<X className="stroke-destructive" />
					Failed to fetch data
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p>{error.message}</p>
			</CardContent>
			<CardFooter>
				<Badge className="w-fit">{error.name}</Badge>
			</CardFooter>
		</Card>
	)
}

interface StockPositionCardProps extends CardProps {
	position?: DepotPosition
}
export function StockPositionCard({
	className,
	position,
}: StockPositionCardProps) {
	return (
		<Card className={cn(className)}>
			<CardHeader className="flex-row flex-wrap justify-left gap-x-4 gap-y-1">
				<CardDescription className="">Deine Positionen</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				<div className="flex flex-row flex-wrap gap-3 w-full *:flex-grow h-fit">
					<div className="px-4 py-2 flex flex-col flex-nowrap bg-background border border-border/20 rounded shadow-sm">
						<span className="text-muted-foreground text-sm">Wert</span>

						<span className="text-sm flex flex-row items-baseline gap-1 text-muted-foreground">
							<span className="text-2xl number font-normal tabular-nums text-foreground">
								{position?.worth ? to_display_string(position.worth) : 0}
							</span>
						</span>
					</div>
					<div className="px-4 py-2 flex flex-col flex-nowrap bg-background border border-border/20 rounded shadow-sm">
						<span className="text-sm text-muted-foreground">Anzahl</span>

						<span className="text-sm flex flex-row items-baseline gap-1 text-muted-foreground">
							<span className="text-2xl number font-normal tabular-nums text-foreground">
								{position?.amount.toFixed(2) ?? 0}
							</span>
						</span>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
