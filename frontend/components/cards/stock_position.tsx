"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
} from "@/components/ui/card"
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { currencyFormat } from "@/lib/cash_display_string"
import {
	positionStats,
	type Trade,
	tradeKind,
	tradeTotal,
} from "@/lib/data/trades"
import {
	dayFormat,
	formatDateString,
	numberFormat,
	signedCurrencyFormat,
	signedPercentFormat,
} from "@/lib/util"
import { cn } from "@/lib/utils"

const COMPACT_COUNT = 4

interface Props {
	/** the active depot's ledger rows of this asset, oldest first */
	trades: Trade[]
	/** current price per share */
	price: number | null
	/** value of the whole depot (cash + positions) */
	depotValue: number
	className?: string
}

const plClass = (v: number) =>
	v > 0 ? "text-win" : v < 0 ? "text-loss" : "text-foreground"

function Stat({
	label,
	value,
	sub,
	valueClass,
}: {
	label: string
	value: string
	sub?: string
	valueClass?: string
}) {
	return (
		<div className="px-4 py-2 flex flex-col bg-muted rounded-xl min-w-0">
			<span className="text-muted-foreground text-sm">{label}</span>
			<span className={cn("text-xl number tabular-nums", valueClass)}>
				{value}
			</span>
			{sub && (
				<span className={cn("text-xs number tabular-nums", valueClass)}>
					{sub}
				</span>
			)}
		</div>
	)
}

export function StockPositionCard({
	trades,
	price,
	depotValue,
	className,
}: Props) {
	const stats = useMemo(() => positionStats(trades), [trades])
	if (trades.length === 0) return null

	const value = price != null ? stats.shares * price : null
	const unrealized = value != null ? value - stats.invested : null
	const unrealizedPct =
		unrealized != null && stats.invested > 0
			? unrealized / stats.invested
			: null
	const share = value != null && depotValue > 0 ? value / depotValue : null
	const newestFirst = trades.toReversed()

	return (
		<Card className={cn(className)}>
			<CardHeader>
				<CardDescription>
					{stats.shares > 0 ? "Deine Position" : "Deine Position (geschlossen)"}
				</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
					<Stat label="Anzahl" value={numberFormat.format(stats.shares)} />
					<Stat
						label="Einstandskurs"
						value={
							stats.avgPrice != null
								? currencyFormat.format(stats.avgPrice)
								: "-"
						}
					/>
					<Stat
						label="Investiert"
						value={currencyFormat.format(stats.invested)}
					/>
					<Stat
						label="Aktueller Wert"
						value={value != null ? currencyFormat.format(value) : "-"}
					/>
					<Stat
						label="Unrealisiert"
						value={
							unrealized != null ? signedCurrencyFormat.format(unrealized) : "-"
						}
						sub={
							unrealizedPct != null
								? signedPercentFormat.format(unrealizedPct)
								: undefined
						}
						valueClass={unrealized != null ? plClass(unrealized) : undefined}
					/>
					<Stat
						label="Realisiert"
						value={signedCurrencyFormat.format(stats.realized)}
						valueClass={plClass(stats.realized)}
					/>
					<Stat
						label="Anteil am Depot"
						value={
							share != null && stats.shares > 0
								? signedPercentFormat.format(share).replace("+", "")
								: "-"
						}
					/>
					<Stat
						label="Erster Kauf"
						value={
							stats.firstBuy ? dayFormat.format(new Date(stats.firstBuy)) : "-"
						}
						sub={`${stats.count} Transaktion${stats.count === 1 ? "" : "en"}`}
					/>
				</div>
				<div className="flex flex-col">
					<div className="flex flex-row items-center justify-between">
						<span className="text-sm text-muted-foreground">Transaktionen</span>
						{newestFirst.length > COMPACT_COUNT && (
							<AllTransactions trades={newestFirst} />
						)}
					</div>
					<TradeList trades={newestFirst.slice(0, COMPACT_COUNT)} />
				</div>
			</CardContent>
		</Card>
	)
}

function TradeList({ trades }: { trades: Trade[] }) {
	return (
		<ul className="flex flex-col divide-y">
			{trades.map(t => {
				const buy = tradeKind(t) === "buy"
				return (
					<li
						key={t.id}
						className="flex flex-row items-center gap-3 py-2 min-w-0"
					>
						<span
							aria-hidden
							className={cn(
								"size-6 shrink-0 rounded-full grid place-items-center text-xs font-bold text-background",
								buy ? "bg-win" : "bg-loss"
							)}
						>
							{buy ? "K" : "V"}
						</span>
						<div className="flex flex-col min-w-0 grow">
							<span className="text-sm truncate">
								{buy ? "Kauf" : "Verkauf"} ·{" "}
								{numberFormat.format(Math.abs(t.amount))} x{" "}
								{currencyFormat.format(t.price ?? 0)}
							</span>
							<span className="text-xs text-muted-foreground">
								{formatDateString(t.tstamp)}
							</span>
						</div>
						<span className="number tabular-nums text-sm shrink-0">
							{currencyFormat.format(tradeTotal(t))}
						</span>
					</li>
				)
			})}
		</ul>
	)
}

function AllTransactions({ trades }: { trades: Trade[] }) {
	const isMobile = useIsMobile()
	return (
		<Sheet>
			<SheetTrigger render={<Button variant="ghost" size="sm" />}>
				Alle anzeigen
			</SheetTrigger>
			<SheetContent
				side={isMobile ? "bottom" : "right"}
				className="max-h-[85dvh] md:max-h-none"
			>
				<SheetHeader>
					<SheetTitle>Transaktionen</SheetTitle>
					<SheetDescription>
						{trades.length} Transaktionen in diesem Depot
					</SheetDescription>
				</SheetHeader>
				<div className="overflow-y-auto px-4 pb-4">
					<TradeList trades={trades} />
				</div>
			</SheetContent>
		</Sheet>
	)
}
