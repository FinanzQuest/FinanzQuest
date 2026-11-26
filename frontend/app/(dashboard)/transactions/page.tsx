import { MoveRight } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ErrorCard } from "@/components/cards/cards"
import { PositionRow } from "@/components/displays/position_list"
import URLIcon from "@/components/icon"
import { PageShell } from "@/components/page_shell"
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card"
import type {
	PositionSummary,
	SearchParams,
	Transaction,
} from "@/database/custom_types"
import { getServerClient, getUser } from "@/lib/auth"
import { currencyFormatFixedLength } from "@/lib/cash_display_string"
import { getDepotIdWithInspect } from "@/lib/get_depot_id"
import { getStockPagePath } from "@/lib/get_stock_path"
import { getIconURL } from "@/lib/icon_url"
import {
	parseDate,
	relativeDateString,
	toAbsoluteTimeString,
	toISODateOnly,
} from "@/lib/util"
import { cn } from "@/lib/utils"

const timeFormat = new Intl.DateTimeFormat("de-DE", {
	hour: "2-digit",
	minute: "2-digit",
	timeZone: "Europe/Berlin",
})

const amountFormat = new Intl.NumberFormat("de-DE", {
	maximumFractionDigits: 4,
})

type TransactionWithAssetPosition = Transaction & PositionSummary

export default async function Page(props: {
	searchParams: Promise<SearchParams>
}) {
	const searchParams = await props.searchParams
	const { depotId, error: depotIdError } =
		await getDepotIdWithInspect(searchParams)
	if (depotIdError) {
		return <ErrorCard error={depotIdError} />
	}
	const { depot, transactions, error } = await dataFetcher(depotId)

	if (error || !depot || !transactions) {
		return <ErrorCard error={error || new Error("Error fetching Data")} />
	}

	const groupedTransactions = groupTransactionsPerDay(transactions)

	return (
		<PageShell>
			<h1 className="text-2xl font-bold tracking-tight">Transaktionen</h1>
			{groupedTransactions.length === 0 && (
				<p className="text-sm text-muted-foreground">
					Noch keine Transaktionen. Kaufe dein erstes Wertpapier über die Suche.
				</p>
			)}
			{groupedTransactions.map(group => (
				<TransactionGroup key={group.day} {...group} />
			))}
		</PageShell>
	)
}

type GroupedTransactions<T extends object> = {
	day: string
	transactions: (Transaction & T)[]
}

function groupTransactionsPerDay<T extends object>(
	transactions: (Transaction & T)[]
) {
	// Assumes transactions are sorted by timestamp in descending order
	const groupedTransactions: GroupedTransactions<T>[] = []
	let currentDay = ""
	let currentDayTransactions: (Transaction & T)[] = []

	for (const transaction of transactions) {
		const date = new Date(transaction.tstamp)
		const key = toISODateOnly(date)

		if (currentDay !== key) {
			if (currentDayTransactions.length > 0) {
				groupedTransactions.push({
					day: currentDay,
					transactions: currentDayTransactions,
				})
			}
			currentDay = key
			currentDayTransactions = []
		}

		currentDayTransactions.push(transaction)
	}

	if (currentDayTransactions.length > 0) {
		groupedTransactions.push({
			day: currentDay,
			transactions: currentDayTransactions,
		})
	}

	return groupedTransactions
}

function TransactionGroup({
	day,
	transactions,
}: GroupedTransactions<PositionSummary>) {
	const date = parseDate(day)
	return (
		<div className="overflow-hidden flex flex-col gap-3">
			<div className="flex flex-row gap-2">
				<span className="font-semibold">
					{date ? toAbsoluteTimeString(date) : ""}
				</span>
				<span className="text-sm text-muted-foreground align-bottom">
					{date ? relativeDateString(date, "never") : "Ohne Datum"}
				</span>
			</div>
			<div className="flex flex-col border rounded-2xl overflow-hidden divide-y divide-border/50">
				{transactions.map(transaction => (
					<TransactionItem key={transaction.id} transaction={transaction} />
				))}
			</div>
		</div>
	)
}

function Description({
	transaction,
}: {
	transaction: TransactionWithAssetPosition
}) {
	const buy = transaction.amount > 0
	const worth =
		Math.abs(transaction.amount * (transaction.price ?? 0)) +
		transaction.commission * (buy ? 1 : -1)
	const iconURL =
		transaction.symbol && transaction.asset_type
			? getIconURL(transaction.symbol, transaction.asset_type, 32)
			: null

	return (
		<div
			className={cn(
				buy ? "flex-row" : "flex-row-reverse",
				"flex flex-wrap items-center gap-x-3 gap-y-1"
			)}
		>
			<HoverCard>
				<HoverCardTrigger>
					<span className="number tabular-nums bg-background border border-border/70 px-2 rounded-lg cursor-pointer">
						{currencyFormatFixedLength.format(Math.abs(worth))}
					</span>
				</HoverCardTrigger>
				<HoverCardContent className="w-fit rounded-lg overflow-hidden">
					<div className="flex flex-row gap-2">
						<span className="number tabular-nums">
							{currencyFormatFixedLength.format(
								Math.abs(transaction.amount * (transaction.price ?? 0))
							)}
						</span>
						<span>{buy ? "+" : "-"}</span>
						<span className="number tabular-nums">
							{currencyFormatFixedLength.format(
								Math.abs(transaction.commission)
							)}
						</span>
						<span className="text-muted-foreground">(Gebühren)</span>
					</div>
				</HoverCardContent>
			</HoverCard>
			<MoveRight className="stroke-muted-foreground" />
			<HoverCard>
				<HoverCardTrigger
					render={
						<Link
							href={getStockPagePath(transaction.asset_id)}
							className="cursor-pointer flex flex-row gap-2 bg-background border border-border/70 rounded-lg px-2"
						>
							<URLIcon
								className="h-[0.8lh] aspect-square w-auto self-center rounded"
								size={32}
								iconURL={iconURL}
							/>
							{transaction.symbol}
							<span className="number tabular-nums text-muted-foreground">
								×{amountFormat.format(Math.abs(transaction.amount))}
							</span>
						</Link>
					}
				/>
				<HoverCardContent className="p-0 overflow-hidden w-[min(40rem,90vw)]">
					<PositionRow
						className="border-none rounded-none"
						position={transaction}
					/>
				</HoverCardContent>
			</HoverCard>
		</div>
	)
}

function TransactionItem({
	transaction,
}: {
	transaction: TransactionWithAssetPosition
}) {
	const buy = transaction.amount > 0
	const is_savings_plan = transaction.type === "savings_plan"

	const bg = (() => {
		if (is_savings_plan) return "bg-overlay-1"

		return buy ? "bg-loss" : "bg-win"
	})()

	const date = new Date(transaction.tstamp)

	return (
		<div className="px-4 py-3 flex flex-row items-center gap-3 hover:bg-muted/40">
			<span
				className={cn(bg, "inline-block w-1 shrink-0 self-stretch rounded-xl")}
			/>
			<div className="flex flex-col gap-1.5 min-w-0 grow">
				<span className="text-xs text-muted-foreground">
					{is_savings_plan ? "Sparplan" : buy ? "Kauf" : "Verkauf"}
					{" · "}
					{timeFormat.format(date)}
				</span>
				<span className="font-semibold text-md min-w-0 overflow-x-auto">
					<Description transaction={transaction} />
				</span>
			</div>
		</div>
	)
}

const dataFetcher = async (depotId?: number) => {
	const client = await getServerClient()
	const { user } = await getUser()
	if (!user) {
		redirect("/login")
	}

	const { data: depots, error: depotsError } = await client
		.schema("depots")
		.from("depots")
		.select("*")
		.contains("users", [user.id])

	if (depotsError) {
		return { error: depotsError }
	}

	const depot = depots?.find(depot => depot.id === depotId) ?? depots?.at(0)

	if (!depot) {
		return { error: new Error("No depot found") }
	}

	const { data: transactions, error: transactionsError } = await client
		.schema("depots")
		.rpc("get_transactions_with_position", { p_depot_id: depot.id })

	if (transactionsError) {
		return { error: transactionsError }
	}

	return {
		depot,
		transactions: transactions as TransactionWithAssetPosition[],
	}
}
