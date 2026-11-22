"use client"

import { useEffect, useState } from "react"
import {
	BENCHMARKS,
	type BenchmarkKey,
	isBenchmark,
	type OverlayKey,
	type Series,
} from "@/lib/data/overlays"
import { getDateCertainDaysAgo, toISODateOnly } from "@/lib/util"
import { supabase } from "@/utils/supabase/client"

/** Daily data reaches back this far: covers every view up to "1J". */
const DAILY_DAYS = 400
/** Weekly data for the "5J" view. */
const WEEKLY_DAYS = 5 * 365 + 14

export type Resolution = "daily" | "weekly"

type Loaded = Partial<Record<string, Series>>

/**
 * Loads the series of the active overlays in the browser, once each
 * (moving averages of this asset, benchmark closes), only when switched on.
 * Returns the series by overlay key for the given resolution, and whether
 * some are still loading.
 */
export function useChartOverlays(
	assetId: number,
	active: OverlayKey[],
	resolution: Resolution
): { series: Partial<Record<OverlayKey, Series>>; loading: boolean } {
	const [loaded, setLoaded] = useState<Loaded>({})
	const [benchmarkIds, setBenchmarkIds] = useState<Record<
		BenchmarkKey,
		number
	> | null>(null)

	const wantMa = active.some(k => k === "ma100" || k === "ma200")
	const wantBenchmarks = active.filter(isBenchmark)
	const keyOf = (name: string) => `${name}:${resolution}`

	// benchmark asset ids, once
	useEffect(() => {
		if (wantBenchmarks.length === 0 || benchmarkIds) return
		let cancelled = false
		supabase
			.schema("api")
			.from("assets")
			.select("id, symbol")
			.in(
				"symbol",
				BENCHMARKS.map(b => b.symbol)
			)
			.then(({ data, error }) => {
				if (cancelled || error || !data) return
				const ids = Object.fromEntries(
					BENCHMARKS.flatMap(b => {
						const row = data.find(d => d.symbol === b.symbol)
						return row ? [[b.key, row.id]] : []
					})
				) as Record<BenchmarkKey, number>
				setBenchmarkIds(ids)
			})
		return () => {
			cancelled = true
		}
	}, [wantBenchmarks.length, benchmarkIds])

	const since = toISODateOnly(
		getDateCertainDaysAgo(resolution === "daily" ? DAILY_DAYS : WEEKLY_DAYS)
	)
	const missing = [
		...(wantMa && !loaded[keyOf("ma")] ? ["ma"] : []),
		...wantBenchmarks.filter(
			k => benchmarkIds?.[k] != null && !loaded[keyOf(k)]
		),
	]
	const missingKey = missing.join(",")

	// biome-ignore lint/correctness/useExhaustiveDependencies: missingKey lists what to load
	useEffect(() => {
		if (missing.length === 0) return
		let cancelled = false
		const api = supabase.schema("api")
		const tasks = missing.map(async name => {
			if (name === "ma") {
				const { data, error } = await api.rpc("asset_moving_averages", {
					p_asset_id: assetId,
					p_since: since,
				})
				if (error) throw error
				return {
					[keyOf("ma100")]: (data ?? []).flatMap(r =>
						r.ma100 == null ? [] : [{ t: r.tstamp, v: r.ma100 }]
					),
					[keyOf("ma200")]: (data ?? []).flatMap(r =>
						r.ma200 == null ? [] : [{ t: r.tstamp, v: r.ma200 }]
					),
					[keyOf("ma")]: [],
				}
			}
			const id = benchmarkIds?.[name as BenchmarkKey]
			const query =
				resolution === "daily"
					? api
							.from("asset_prices")
							.select("tstamp, close")
							.eq("asset_id", id ?? -1)
							.gte("tstamp", since)
					: api
							.from("asset_prices_weekly")
							.select("tstamp, close")
							.eq("asset_id", id ?? -1)
							.gte("tstamp", since)
			const { data, error } = await query
				.not("close", "is", null)
				.order("tstamp", { ascending: true })
			if (error) throw error
			return {
				[keyOf(name)]: (data ?? []).map(r => ({
					t: String(r.tstamp).slice(0, 10),
					v: Number(r.close),
				})),
			}
		})
		Promise.allSettled(tasks).then(results => {
			if (cancelled) return
			const merged: Loaded = {}
			for (const r of results) {
				if (r.status === "fulfilled") Object.assign(merged, r.value)
				else console.error("Failed to load chart overlay", r.reason)
			}
			setLoaded(prev => ({ ...prev, ...merged }))
		})
		return () => {
			cancelled = true
		}
	}, [missingKey, assetId, resolution, since])

	const series: Partial<Record<OverlayKey, Series>> = {}
	for (const key of active) {
		const s = loaded[keyOf(key)]
		if (s) series[key] = s
	}
	return { series, loading: missing.length > 0 }
}
