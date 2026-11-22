import type { Database } from "@/database/types"
import { createPublicClient } from "@/utils/supabase/public"

type Api = Database["api"]
export type Fund = Api["Tables"]["funds"]["Row"]
export type FundHolding = Api["Tables"]["fund_holdings"]["Row"]
export type FundCountry = Api["Tables"]["fund_countries"]["Row"]
export type StockDetails = Api["Tables"]["asset_details"]["Row"]
export type Performance =
	Api["Functions"]["asset_performance"]["Returns"][number]
export type DetailsProvider = Database["public"]["Enums"]["detailsprovider"]

export type AssetDetails =
	| {
			kind: "fund"
			provider: DetailsProvider | null
			fund: Fund
			holdings: FundHolding[]
			countries: FundCountry[]
			performance: Performance | null
	  }
	| {
			kind: "stock"
			provider: DetailsProvider | null
			details: StockDetails | null
			performance: Performance | null
	  }

/**
 * Facts, holdings and country weights of a fund, or the company figures of a
 * stock, plus the performance figures from the price history. All public
 * (anon client): callable from a "use cache" scope. Throws on errors.
 */
export async function fetchAssetDetails(id: number): Promise<AssetDetails> {
	const api = createPublicClient().schema("api")
	const [asset, performance] = await Promise.all([
		api
			.from("assets")
			.select("fund_id, details_provider")
			.eq("id", id)
			.single(),
		api.rpc("asset_performance", { p_asset_id: id }),
	])
	if (asset.error) throw new Error(asset.error.message)
	if (performance.error) throw new Error(performance.error.message)
	const perf = performance.data?.[0] ?? null
	const { fund_id: fundId, details_provider: provider } = asset.data

	if (fundId != null) {
		const [fund, holdings, countries] = await Promise.all([
			api.from("funds").select("*").eq("id", fundId).single(),
			api
				.from("fund_holdings")
				.select("*")
				.eq("fund_id", fundId)
				.order("position"),
			api
				.from("fund_countries")
				.select("*")
				.eq("fund_id", fundId)
				.order("weight", { ascending: false }),
		])
		const error = fund.error ?? holdings.error ?? countries.error
		if (error) throw new Error(error.message)
		if (!fund.data) throw new Error(`fund ${fundId} not found`)
		return {
			kind: "fund",
			provider,
			fund: fund.data,
			holdings: holdings.data ?? [],
			countries: countries.data ?? [],
			performance: perf,
		}
	}

	const details = await api
		.from("asset_details")
		.select("*")
		.eq("asset_id", id)
		.maybeSingle()
	if (details.error) throw new Error(details.error.message)
	return { kind: "stock", provider, details: details.data, performance: perf }
}
