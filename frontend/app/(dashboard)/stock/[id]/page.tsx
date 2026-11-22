import { redirect } from "next/navigation"
import { cache } from "react"
import { AutoRefresh } from "@/components/auto_refresh"
import {
	ErrorCard,
	StockHeader,
	StockPositionCard,
} from "@/components/cards/cards"
import { ChartCard } from "@/components/cards/client"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import type { DepotPosition, LatestPrice } from "@/database/custom_types"
import { fetchStockData } from "@/database/fetch_stock_data"
import {
	formatter as formatPrices,
	intradayFormatter,
} from "@/lib/data/formatter"
import { getDepotId } from "@/lib/get_depot_id"
import { getDateCertainDaysAgo, msPerDay, toISODateOnly } from "@/lib/util"
import { createClient } from "@/utils/supabase/server"
export const revalidate = 60

export default async function Page(props: { params: Promise<{ id: string }> }) {
	const id = Number.parseInt((await props.params).id, 10)

	if (id < 0 || !Number.isInteger(id)) {
		return <ErrorCard error={new Error("Invalid ID")} />
	}

	const { depotId, error: depotIdError } = await getDepotId()

	if (depotIdError || !depotId) {
		return <ErrorCard error={depotIdError || new Error("Depot ID not found")} />
	}

	// parallel statt sequentiell
	const [
		{ depot, error, positions, commission },
		{
			info,
			prices,
			pricesWeekly,
			pricesIntraday,
			latestPrice,
			error: fetchError,
		},
	] = await Promise.all([dataFetcher(id, depotId), fetchStockDataCached(id)])

	if (error || fetchError) {
		return (
			<main className="flex flex-row w-full h-full grow shrink justify-center items-center">
				<ErrorCard
					className="w-fit"
					error={error ?? fetchError ?? new Error("Unknown error")}
				/>
			</main>
		)
	}

	const { dataWithEmptyDays: pricesWithEmptyDays, data: pricesFiltered } =
		formatPrices(prices ?? [])
	const { dataWithEmptyDays: pricesWeeklyWithEmptyDays } = formatPrices(
		pricesWeekly ?? [],
		7
	)
	const pricesIntraday1d = intradayFormatter(pricesIntraday, 1)
	const pricesIntraday5d = intradayFormatter(pricesIntraday, 5)
	const quote = getQuote(pricesFiltered, latestPrice)

	return (
		<ScrollArea className="h-screen ">
			<main className="w-full h-fit max-w-300 mx-auto max-h-screen md:px-12 px-4 py-6 flex flex-col gap-8">
				<AutoRefresh />
				<StockHeader
					price={quote.price}
					previousClose={quote.previousClose}
					dayOpen={quote.dayOpen}
					quoteTime={quote.quoteTime}
					stock={info[0]}
					depot={depot}
					position={positions.at(0)}
					commission={commission}
				/>
				<ChartCard
					className="w-full"
					prices={pricesWithEmptyDays}
					pricesWeekly={pricesWeeklyWithEmptyDays}
					pricesIntraday1d={pricesIntraday1d}
					pricesIntraday5d={pricesIntraday5d}
					previousClose={quote.previousClose}
				/>
				{depot && <StockPositionCard position={positions.at(0)} />}
			</main>
		</ScrollArea>
	)
}

// const dataFetcherUncached = async (user: User, stockId: number) => {}

const fetchStockDataCached = cache(async (id: number) => {
	return await fetchStockData(
		id,
		undefined,
		getDateCertainDaysAgo(365),
		getDateCertainDaysAgo(5 * 365),
		// enough calendar days to cover the last 5 trading days ("5T")
		getDateCertainDaysAgo(9)
	)
})

/**
 * Current price, its time, and the reference prices of the current trading
 * day. The current day is the newer of the last daily row (may be today's
 * partial candle) and the quote's day; the previous close is the last daily
 * row before it.
 */
function getQuote(
	daily: Array<{ tstamp: string; open: number; close: number }>,
	latest: LatestPrice | null
) {
	const lastDaily = daily.at(-1)
	// a daily close is valid as of the end of its day (api.daily_price_as_of)
	const dailyAsOf = lastDaily
		? new Date(
				Math.min(Date.parse(lastDaily.tstamp) + msPerDay, Date.now())
			).toISOString()
		: null
	const quoteTime = latest?.tstamp ?? dailyAsOf
	// -1 ms: a daily close valid as of midnight belongs to the day before
	const quoteDay = quoteTime
		? toISODateOnly(new Date(Date.parse(quoteTime) - 1))
		: null
	const currentDay = [lastDaily?.tstamp, quoteDay]
		.filter((d): d is string => !!d)
		.reduce<string | null>((a, b) => (a && a > b ? a : b), null)

	const previous = currentDay
		? daily.findLast(row => row.tstamp < currentDay)
		: undefined
	const today = currentDay
		? daily.find(row => row.tstamp === currentDay)
		: undefined

	return {
		price: latest?.close ?? lastDaily?.close ?? null,
		quoteTime,
		previousClose: previous?.close ?? null,
		dayOpen: today?.open ?? null,
	}
}

const dataFetcher = async (stockId: number, depotId: number) => {
	const client = await createClient()
	const user = (await client.auth.getUser()).data.user
	if (!user) redirect("/auth/login")

	const { data: depot, error: depotError } = await client
		.schema("depots")
		.from("depots")
		.select()
		.eq("id", depotId)
		.contains("users", [user.id])
		.limit(1)
		.maybeSingle()

	if (depotError)
		return { depot: null, error: depotError, positions: null, commission: null }
	if (!depot) redirect("/new_depot")

	// parallel statt sequentiell
	const [
		{ data: positionRows, error: positionError },
		{ data: commission, error: commissionError },
	] = await Promise.all([
		client
			.schema("depots")
			.rpc("get_position_profits", { p_depot_id: depot.id })
			.eq("asset_id", stockId),
		client.schema("depots").rpc("get_commission"),
	])

	if (positionError)
		return { depot, error: positionError, positions: null, commission: null }

	const positions: DepotPosition[] = (positionRows ?? []).map(p => ({
		asset_id: p.asset_id,
		amount: p.current_amount,
		worth: p.market_value ?? 0,
		price: p.current_price,
	}))

	if (commissionError)
		return { depot, error: commissionError, positions, commission: null }

	return { depot, error: null, positions, commission }
}
