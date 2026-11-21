"use server"
import {
	LineChart as LinechartIcon,
	PieChart as PieChartIcon,
	TableCellsMerge,
} from "lucide-react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ErrorCard } from "@/components/cards/cards"
import AreaChart from "@/components/charts/area"
import PieChart from "@/components/charts/pie"
import ChartContainer from "@/components/charts/primitive/container"
import TreeChart from "@/components/charts/tree"
import PositionTabView, { PositionsEmpty } from "@/components/displays/tab_view"
import ChangeStat from "@/components/stat/change_stat"
import { ScrollArea } from "@/components/ui/scroll-area"
import type {
	DepotValue,
	NonNullableRow,
	PositionSummary,
	SearchParams,
} from "@/database/custom_types"
import { processDepotValues } from "@/database/depots"
import { currencyFormat } from "@/lib/cash_display_string"
import { getDepotIdWithInspect } from "@/lib/get_depot_id"
import { getDateCertainDaysAgo, toISODateOnly } from "@/lib/util"
import { createClient } from "@/utils/supabase/server"

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<SearchParams>
}) {
	const cookieStore = await cookies()
	console.log("activeDepotId", cookieStore.get("activeDepotId")?.value)
	const params = await searchParams
	const res = await getDepotIdWithInspect(params)
	console.log("get_depot_response:", res)
	const { depotId, error: depotIdError, noDepot } = res

	if (noDepot) {
		console.log("no depot found redirecting")
		redirect("/new_depot")
	} else {
		console.log(depotId)
	}

	if (depotIdError || !depotId) {
		return <ErrorCard error={depotIdError || new Error("Depot ID not found")} />
	}

	const fres = await dataFetcher(depotId)
	if (fres.error) {
		return <ErrorCard error={fres.error} />
	}

	// if (fres.noDepot) {
	// 	redirect("/new_depot")
	// }

	if (fres.depot === null) {
		return <ErrorCard error={new Error("Depot nicht gefunden")} />
	}

	const treeData = fres.positions

	const d = fres.depotAggValues?.at(0)
	const areaData = processDepotValues(
		(fres.depotValues as NonNullableRow<DepotValue>[]) ?? []
	)
	return (
		<ScrollArea className="h-screen">
			<main className="w-full h-fit max-w-300 mx-auto max-h-screen md:px-12 px-4 py-6 flex flex-col gap-8">
				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						<span className="text-sm text-muted-foreground">Depotwert</span>
						<span className="text-[clamp(2.5rem,6vw,4rem)] leading-none font-extrabold number tabular-nums tracking-tight">
							{currencyFormat.format(d?.total ?? 0)}
						</span>
					</div>
					<div className="flex flex-row gap-x-10 gap-y-4 flex-wrap">
						<ChangeStat
							label="Heute"
							value={d?.diff_1d ?? 0}
							prev={d?.prev_1d_total}
						/>
						<ChangeStat
							label="Monat"
							value={d?.diff_1m ?? 0}
							prev={d?.prev_1m_total}
						/>
						<ChangeStat
							label="Jahr"
							value={d?.diff_1y ?? 0}
							prev={d?.prev_1y_total}
						/>
						<ChangeStat label="Cash" value={d?.cash ?? 0} neutral />
					</div>
				</div>
				<ChartContainer
					className="overflow-hidden"
					defaultTab="line"
					tabs={[
						{
							name: "line",
							icon: (
								<LinechartIcon className="size-7 md:size-5 stroke-muted-foreground" />
							),
							content: (
								<AreaChart
									className="aspect-[4/3] md:aspect-[20/9] lg:aspect-[6/2] xl:aspect-[8/2]"
									startValue={areaData?.start ?? 50000}
									offset={areaData?.offset ?? 0}
									data={areaData?.data ?? []}
									dataKey="total"
									xKey="timestamp"
									yKey="total"
								/>
							),
						},
						{
							name: "tree",
							icon: (
								<TableCellsMerge className="size-7 md:size-5 stroke-muted-foreground" />
							),
							content: (
								<TreeChart
									className="max-h-[500px] w-full"
									data={treeData as PositionSummary[]}
									dataKey="market_value"
								/>
							),
						},
						{
							name: "pie",
							icon: (
								<PieChartIcon className="size-7 md:size-5 stroke-muted-foreground" />
							),
							content: (
								<PieChart
									className="max-h-[500px] w-full"
									data={treeData as PositionSummary[]}
									dataKey="market_value"
								/>
							),
						},
					]}
				/>{" "}
				{!fres.positions || fres.positions?.length === 0 ? (
					fres.ownedByUser && <PositionsEmpty />
				) : (
					<PositionTabView
						positions_raw={fres.positions as PositionSummary[]}
					/>
				)}
			</main>
		</ScrollArea>
	)
}

const dataFetcher = async (depotId: number) => {
	const client = await createClient()
	const user = (await client.auth.getUser()).data.user
	if (!user) {
		redirect("/auth/login")
	}

	const response = await client
		.schema("depots")
		.from("depots")
		.select()
		.eq("id", depotId)
		.limit(1)
		.maybeSingle()

	const { data: depot, error: depotError } = response

	if (depotError) {
		return { error: depotError }
	}
	if (!depot) {
		return { depot: null, noDepot: true }
	}

	const ownedByUser = depot.users.some((id: string) => id === user.id)

	const tstamp = toISODateOnly(getDateCertainDaysAgo(30))
	const depots = client.schema("depots")

	const [positionResponse, valueResponse, valueAggResponse] = await Promise.all(
		[
			depots.rpc("get_position_profits", { p_depot_id: depot.id }),
			depots
				.from("values")
				.select()
				.eq("depot_id", depot.id)
				.gte("tstamp", tstamp),
			depots.from("aggregated_values").select().eq("depot_id", depot.id),
		]
	)

	return {
		depot,
		error:
			positionResponse.error ?? valueResponse.error ?? valueAggResponse.error,
		positions: positionResponse.data,
		depotValues: valueResponse.data,
		depotAggValues: valueAggResponse.data,
		ownedByUser,
		noDepot: false,
	}
}
