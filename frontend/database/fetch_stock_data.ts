import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/database/types"
import { toISODateOnly } from "@/lib/util"
import { createClient } from "@/utils/supabase/server"
import type { Asset, LatestPrice, StockPrice } from "./custom_types"

export interface TfetchStockData {
	info: Asset[]
	prices: StockPrice[] | null
	pricesWeekly: StockPrice[] | null
	pricesIntraday: StockPrice[]
	latestPrice: LatestPrice | null

	error?: Error
}
export async function fetchStockData(
	id: number,
	restclient?: SupabaseClient<Database>,
	start?: Date,
	startWeekly?: Date,
	startIntraday?: Date
): Promise<TfetchStockData> {
	// Handle responses and errors individually
	const client = restclient ?? (await createClient())
	const [
		{ data: prices, error: priceError },
		{ data: pricesWeekly, error: priceWeeklyError },
		{ data: info, error: infoError },
		{ data: pricesIntraday, error: priceIntradayError },
		{ data: latestPrice, error: latestPriceError },
	] = await Promise.all([
		client
			.schema("api")
			.from("asset_prices")
			.select("*")
			.eq("asset_id", id)
			.gte("tstamp", start ? toISODateOnly(start) : undefined)
			.order("tstamp", { ascending: true }),
		client
			.schema("api")
			.from("asset_prices_weekly")
			.select("*")
			.eq("asset_id", id)
			.gte("tstamp", startWeekly ? toISODateOnly(startWeekly) : undefined)
			.order("tstamp", { ascending: true }),
		client.schema("api").from("assets").select("*").eq("id", id),
		client
			.schema("api")
			.from("asset_prices_intraday")
			.select("*")
			.eq("asset_id", id)
			.gte("tstamp", startIntraday ? startIntraday.toISOString() : undefined)
			.order("tstamp", { ascending: true }),
		client
			.schema("api")
			.from("latest_prices")
			.select("*")
			.eq("asset_id", id)
			.maybeSingle(),
	])

	// Intraday data is an addition: without it the page still works on daily
	// prices, so these errors are logged, not surfaced.
	if (priceIntradayError) {
		console.error(
			`Failed to fetch intraday prices for id ${id}`,
			priceIntradayError
		)
	}
	if (latestPriceError) {
		console.error(`Failed to fetch latest price for id ${id}`, latestPriceError)
	}
	const intraday = {
		pricesIntraday: pricesIntraday ?? [],
		latestPrice: latestPrice ?? null,
	}

	if (infoError) {
		return {
			info: [],
			prices: [],
			pricesWeekly: [],
			...intraday,
			error: new Error(`Failed to fetch asset info for id ${id}`, {
				cause: infoError,
			}),
		}
	}

	if (priceWeeklyError) {
		return {
			info,
			prices,
			pricesWeekly: [],
			...intraday,
			error: new Error(`Failed to fetch asset prices weekly for id ${id}`, {
				cause: priceWeeklyError,
			}),
		}
	}

	if (priceError) {
		return {
			info,
			prices: [],
			pricesWeekly: [],
			...intraday,
			error: new Error(`Failed to fetch asset prices for id ${id}`, {
				cause: priceError,
			}),
		}
	}

	if (!prices || prices.length === 0) {
		return {
			info,
			prices: [],
			pricesWeekly: [],
			...intraday,
		}
	}

	return {
		info,
		prices,
		pricesWeekly: pricesWeekly as StockPrice[],
		...intraday,
	}
}
