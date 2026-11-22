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
import type { Asset, Depot, DepotPosition } from "@/database/custom_types"
import { currencyFormat, to_display_string } from "@/lib/cash_display_string"
import { getIconURL } from "@/lib/icon_url"
import { numberFormat, quoteTimeString } from "@/lib/util"
import { cn } from "@/lib/utils"
import URLIcon from "../icon"
import ChangeStat from "../stat/change_stat"
import BuyStockDialog from "../transaction_dialogs/buy_stock_dialog"
import SellStockDialog from "../transaction_dialogs/sell_stock_dialog"

type CardProps = ComponentPropsWithoutRef<"div">

interface StockHeaderProps extends CardProps {
	stock: Asset
	/** current price (latest_prices, falling back to the last daily close) */
	price: number | null
	/** close of the day before the current trading day */
	previousClose: number | null
	/** open of the current trading day */
	dayOpen: number | null
	/** time the price is valid as of (ISO timestamp or date) */
	quoteTime: string | null
	depot?: Depot | null
	position?: DepotPosition
	commission: number
}

export function StockHeader({
	className,
	stock: asset,
	price: close,
	previousClose,
	dayOpen,
	quoteTime,
	depot,
	position,
	commission,
}: StockHeaderProps) {
	const changeDay =
		close != null && previousClose != null ? close - previousClose : null
	const changeSinceOpen =
		close != null && dayOpen != null ? close - dayOpen : null
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
				<ChangeStat label="Heute" value={changeDay ?? 0} prev={previousClose} />
				<ChangeStat
					label="Seit Eröffnung"
					value={changeSinceOpen ?? 0}
					prev={dayOpen}
				/>
			</div>
			<span className="text-xs text-muted-foreground">
				{quoteTime ? `Stand: ${quoteTimeString(new Date(quoteTime))}` : ""}
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
			<CardHeader>
				<CardDescription className="">Deine Positionen</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				<div className="flex flex-row flex-wrap gap-3 w-full *:flex-grow h-fit">
					<div className="px-4 py-2 flex flex-col flex-nowrap bg-muted  rounded-xl ">
						<span className="text-muted-foreground text-sm">Wert</span>
						<span className="text-sm flex flex-row items-baseline gap-1 text-muted-foreground">
							<span className="text-2xl number tabular-nums text-foreground">
								{position ? currencyFormat.format(position.worth) : "-"}
							</span>
						</span>
					</div>
					<div className="px-4 py-2 flex flex-col flex-nowrap bg-muted  rounded-xl">
						<span className="text-sm text-muted-foreground">Anzahl</span>
						<span className="text-sm flex flex-row items-baseline gap-1 text-muted-foreground">
							<span className="text-2xl number tabular-nums text-foreground">
								{position ? numberFormat.format(position.amount) : "-"}
							</span>
						</span>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
