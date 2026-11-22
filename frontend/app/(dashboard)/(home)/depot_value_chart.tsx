"use client"
import {
	LineChart as LinechartIcon,
	PieChart as PieChartIcon,
	TableCellsMerge,
} from "lucide-react"
import type React from "react"
import { useEffect, useMemo, useState } from "react"
import {
	IntervallPickerControlled,
	type IntervalOption,
} from "@/components/cards/pick_intervall"
import AreaChart from "@/components/charts/area"
import ChartContainer from "@/components/charts/primitive/container"
import { type DepotValuePoint, processDepotValues } from "@/database/depots"
import { calculateOffset } from "@/lib/data/data_utils"
import {
	getDateCertainDaysAgo,
	startOfTradingDaysAgo,
	type TimeAxis,
	toISODateOnly,
} from "@/lib/util"
import { supabase } from "@/utils/supabase/client"

const depotIntervals: IntervalOption[] = [
	{ name: "1d", display: "1T", days: 1, intradayOnly: true },
	{ name: "5d", display: "5T", days: 5, intradayOnly: true },
	{ name: "1m", display: "1M", days: 30 },
	{ name: "1y", display: "1J", days: 365 },
]

interface DepotValueChartProps {
	depotId: number
	/** depots.values of the last year (one row per day, incl. live today) */
	valuesYear: DepotValuePoint[]
	/** depots.get_intraday_values since the current trading day's start */
	valuesIntraday: DepotValuePoint[]
	/** an asset of the depot has intraday prices */
	hasIntraday: boolean
	treeChart: React.ReactNode
	pieChart: React.ReactNode
}

export default function DepotValueChart({
	depotId,
	valuesYear,
	valuesIntraday,
	hasIntraday,
	treeChart,
	pieChart,
}: DepotValueChartProps) {
	const [days, setDays] = useState(30)
	// without intraday prices 1T/5T are not offered: fall back to 1M
	const range = !hasIntraday && days <= 5 ? 30 : days

	// 5T: 15-minute values loaded on demand (1T comes with the page)
	const lazyIntraday = useIntradayValues(
		depotId,
		hasIntraday && range === 5 ? range : null,
		// newest bar time (the last point is always now()): refetch per new bar
		valuesIntraday.at(-2)?.tstamp
	)
	// 1T/5T: 15-minute values; 1M/1J: daily
	const intraday =
		hasIntraday && (range === 1 || (range === 5 && lazyIntraday !== null))

	const area = useMemo(() => {
		if (intraday) {
			const processed = processDepotValues(
				range === 1 ? valuesIntraday : (lazyIntraday ?? [])
			)
			if (!processed) return null
			// measured against the first point (the previous close)
			const { offset, startValue } = calculateOffset(processed.data, "total")
			return { ...processed, offset, start: startValue }
		}
		const since = toISODateOnly(getDateCertainDaysAgo(30))
		return processDepotValues(
			range <= 30
				? valuesYear.filter(value => value.tstamp >= since)
				: valuesYear
		)
	}, [intraday, range, valuesYear, valuesIntraday, lazyIntraday])

	const timeAxis: TimeAxis = !intraday
		? "date"
		: range === 1
			? "time"
			: "weekdayTime"

	return (
		<ChartContainer
			className="overflow-hidden"
			defaultTab="line"
			toolbar={[
				<IntervallPickerControlled
					key="range"
					options={depotIntervals}
					value={range}
					onValueChange={setDays}
					intradayAvailable={hasIntraday}
				/>,
			]}
			tabs={[
				{
					name: "line",
					icon: (
						<LinechartIcon className="size-7 md:size-5 stroke-muted-foreground" />
					),
					content: (
						<AreaChart
							className="aspect-[4/3] md:aspect-[20/9] lg:aspect-[6/2] xl:aspect-[8/2]"
							startValue={area?.start ?? 50000}
							offset={area?.offset ?? 0}
							data={area?.data ?? []}
							dataKey="total"
							xKey="timestamp"
							yKey="total"
							timeAxis={timeAxis}
						/>
					),
				},
				{
					name: "tree",
					icon: (
						<TableCellsMerge className="size-7 md:size-5 stroke-muted-foreground" />
					),
					content: treeChart,
				},
				{
					name: "pie",
					icon: (
						<PieChartIcon className="size-7 md:size-5 stroke-muted-foreground" />
					),
					content: pieChart,
				},
			]}
		/>
	)
}

/**
 * depots.get_intraday_values for the last `days` (5 = five trading days),
 * fetched in the browser while `days` is set. Refetched when `latestPoint`
 * (the newest bar time of the server-rendered curve) changes.
 */
function useIntradayValues(
	depotId: number,
	days: number | null,
	latestPoint: string | undefined
): DepotValuePoint[] | null {
	const [result, setResult] = useState<{
		days: number
		values: DepotValuePoint[]
	} | null>(null)

	// biome-ignore lint/correctness/useExhaustiveDependencies: latestPoint triggers a refetch after a new bar
	useEffect(() => {
		if (days === null) return
		let cancelled = false
		const since =
			days <= 5 ? startOfTradingDaysAgo(days) : getDateCertainDaysAgo(days)
		supabase
			.schema("depots")
			.rpc("get_intraday_values", {
				p_depot_id: depotId,
				p_since: since.toISOString(),
			})
			.then(({ data, error }) => {
				if (cancelled) return
				if (error) {
					console.error("get_intraday_values failed:", error)
					return
				}
				setResult({ days, values: data ?? [] })
			})
		return () => {
			cancelled = true
		}
	}, [depotId, days, latestPoint])

	return result && result.days === days ? result.values : null
}
