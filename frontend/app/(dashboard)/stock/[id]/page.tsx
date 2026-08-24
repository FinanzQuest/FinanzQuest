import { redirect } from "next/navigation"
import { cache } from "react"
import {
	ErrorCard,
	StockHeader,
	StockPositionCard,
} from "@/components/cards/cards"
import { ChartCard } from "@/components/cards/client"
import { fetchStockData } from "@/database/fetch_stock_data"
import { formatter as formatPrices } from "@/lib/data/formatter"
import { getDepotId } from "@/lib/get_depot_id"
import { getDateCertainDaysAgo } from "@/lib/util"
import { createClient } from "@/utils/supabase/server"
export const revalidate = 3600

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
		{ info, prices, pricesWeekly, error: fetchError },
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

	return (
		<main className="w-full max-w-[1200px] mx-auto max-h-screen overflow-y-scroll px-4 md:px-8 py-6 flex flex-col gap-8">
			<StockHeader
				currentPrice={pricesFiltered.at(-1) ?? pricesFiltered?.at(0)}
				referencePrice={pricesFiltered?.at(-2) ?? pricesFiltered?.at(0)}
				stock={info[0]}
				depot={depot}
				position={positions.at(0)}
				commission={commission}
			/>
			<ChartCard
				className="w-full"
				prices={pricesWithEmptyDays}
				pricesWeekly={pricesWeeklyWithEmptyDays}
			/>
			{depot && <StockPositionCard position={positions.at(0)} />}
		</main>
	)
}

// const dataFetcherUncached = async (user: User, stockId: number) => {}

const fetchStockDataCached = cache(async (id: number) => {
	return await fetchStockData(
		id,
		undefined,
		getDateCertainDaysAgo(365),
		getDateCertainDaysAgo(5 * 365)
	)
})

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
		{ data: positions, error: positionError },
		{ data: commission, error: commissionError },
	] = await Promise.all([
		client
			.schema("depots")
			.from("positions")
			.select("*")
			.eq("depot_id", depot.id)
			.eq("asset_id", stockId),
		client.schema("depots").rpc("get_commission"),
	])

	if (positionError)
		return { depot, error: positionError, positions: null, commission: null }
	if (commissionError)
		return { depot, error: commissionError, positions, commission: null }

	return { depot, error: null, positions, commission }
}
