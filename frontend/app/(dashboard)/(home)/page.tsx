"use server"
import { redirect } from "next/navigation"
import { AutoRefresh } from "@/components/auto_refresh"
import { ErrorCard } from "@/components/cards/cards"
import PieChart from "@/components/charts/pie"
import TreeChart from "@/components/charts/tree"
import PositionTabView, { PositionsEmpty } from "@/components/displays/tab_view"
import { PageShell } from "@/components/page_shell"
import ChangeStat from "@/components/stat/change_stat"
import type { PositionSummary, SearchParams } from "@/database/custom_types"
import type { DepotValuePoint } from "@/database/depots"
import { getServerClient, getUser } from "@/lib/auth"
import { currencyFormat } from "@/lib/cash_display_string"
import { getDepotIdWithInspect } from "@/lib/get_depot_id"
import {
	getDateCertainDaysAgo,
	quoteTimeString,
	startOfTradingDaysAgo,
	toISODateOnly,
} from "@/lib/util"
import DepotValueChart from "./depot_value_chart"

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<SearchParams>
}) {
	const params = await searchParams
	const {
		depotId,
		error: depotIdError,
		noDepot,
	} = await getDepotIdWithInspect(params)

	if (noDepot) {
		redirect("/new_depot")
	}

	if (depotIdError || !depotId) {
		return <ErrorCard error={depotIdError || new Error("Depot ID not found")} />
	}

	const fres = await dataFetcher(depotId)
	if (fres.error) {
		return <ErrorCard error={fres.error} />
	}

	if (fres.depot === null) {
		return <ErrorCard error={new Error("Depot nicht gefunden")} />
	}

	const treeData = fres.positions

	const d = fres.depotAggValues?.at(0)
	return (
		<PageShell>
			<AutoRefresh />
			<div className="flex flex-col gap-4">
				<div className="flex flex-col gap-2">
					<span className="text-sm text-muted-foreground">
						Depotwert · {fres.depot.name}
					</span>
					<span className="text-[clamp(2.5rem,6vw,4rem)] leading-none font-extrabold number tabular-nums tracking-tight">
						{currencyFormat.format(d?.total ?? 0)}
					</span>
					{fres.quoteTime && (
						<span className="text-xs text-muted-foreground">
							Stand: {quoteTimeString(new Date(fres.quoteTime))}
						</span>
					)}
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
			<DepotValueChart
				depotId={depotId}
				hasIntraday={fres.hasIntraday}
				valuesYear={(fres.depotValues ?? []) as DepotValuePoint[]}
				valuesIntraday={fres.intradayValues ?? []}
				treeChart={
					<TreeChart
						className="max-h-[500px] w-full"
						data={treeData as PositionSummary[]}
						dataKey="market_value"
					/>
				}
				pieChart={
					<PieChart
						className="max-h-[500px] w-full"
						data={treeData as PositionSummary[]}
						dataKey="market_value"
					/>
				}
			/>
			{!fres.positions || fres.positions?.length === 0 ? (
				fres.ownedByUser && <PositionsEmpty />
			) : (
				<PositionTabView positions_raw={fres.positions as PositionSummary[]} />
			)}
		</PageShell>
	)
}

const dataFetcher = async (depotId: number) => {
	const client = await getServerClient()
	const { user } = await getUser()
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

	const tstamp = toISODateOnly(getDateCertainDaysAgo(365))
	const depots = client.schema("depots")

	// depots.values / aggregated_values include a live row for today, so a
	// trade or a new price shows up immediately (for any depot, incl. inspect).
	const [positionResponse, valueResponse, valueAggResponse, intradayResponse] =
		await Promise.all([
			// positions, then the quote time of the newest price among them
			depots
				.rpc("get_position_profits", { p_depot_id: depot.id })
				.then(async res => {
					const assetIds = (res.data ?? [])
						.filter(p => p.current_amount > 0)
						.map(p => p.asset_id)
					if (res.error || assetIds.length === 0) {
						return { ...res, quoteTime: null, hasIntraday: false }
					}
					const [{ data: latest }, { data: bar }] = await Promise.all([
						client
							.schema("api")
							.from("latest_prices")
							.select("tstamp")
							.in("asset_id", assetIds)
							.order("tstamp", { ascending: false })
							.limit(1)
							.maybeSingle(),
						// any intraday bar of a held asset -> offer intraday ranges
						client
							.schema("api")
							.from("asset_prices_intraday")
							.select("asset_id")
							.in("asset_id", assetIds)
							.limit(1)
							.maybeSingle(),
					])
					return {
						...res,
						quoteTime: latest?.tstamp ?? null,
						hasIntraday: bar !== null,
					}
				}),
			depots
				.from("values")
				.select()
				.eq("depot_id", depot.id)
				.gte("tstamp", tstamp)
				.order("tstamp"),
			depots.from("aggregated_values").select().eq("depot_id", depot.id),
			// "1T": the current trading day (Friday on weekends); first point =
			// the previous close
			depots.rpc("get_intraday_values", {
				p_depot_id: depot.id,
				p_since: startOfTradingDaysAgo(1).toISOString(),
			}),
		])

	// intraday values only feed the "Heute" range; without them the chart
	// falls back to the daily ranges
	if (intradayResponse.error) {
		console.error("get_intraday_values failed:", intradayResponse.error)
	}

	return {
		depot,
		error:
			positionResponse.error ?? valueResponse.error ?? valueAggResponse.error,
		positions: positionResponse.data,
		depotValues: valueResponse.data,
		depotAggValues: valueAggResponse.data,
		intradayValues: intradayResponse.data,
		quoteTime: positionResponse.quoteTime,
		hasIntraday: positionResponse.hasIntraday,
		ownedByUser,
		noDepot: false,
	}
}
