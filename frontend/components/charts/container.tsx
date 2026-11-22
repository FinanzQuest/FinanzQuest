"use client"
import "./container.css"
import {
	CandlestickChart as CandleStickIcon,
	LineChart as LinechartIcon,
} from "lucide-react"
import {
	type ComponentPropsWithoutRef,
	useEffect,
	useMemo,
	useState,
} from "react"

import type { PlainPrice } from "@/database/custom_types"
import toRelativeValues, { calculateOffset } from "@/lib/data/data_utils"
import {
	isBenchmark,
	type OverlayKey,
	overlayRange,
	withOverlays,
} from "@/lib/data/overlays"
import { useChartOverlays } from "@/lib/use_chart_overlays"
import { useIntradayPreference } from "@/lib/use_intraday_preference"
import {
	getCurrentDate,
	getDateCertainDaysAgo,
	type TimeAxis,
	toISODateOnly,
} from "@/lib/util"
import { supabase } from "@/utils/supabase/client"
import {
	IntervallPickerControlled,
	maxIntradayDays,
} from "../cards/pick_intervall"
import AreaChart from "./area"
import CandleStickChart from "./candle_stick"
import { OverlayLegend, OverlayPicker } from "./overlay_picker"
import ChartContainer from "./primitive/container"

export interface props extends ComponentPropsWithoutRef<"div"> {
	/** api.assets id, to load longer intraday ranges on demand */
	assetId: number
	prices: Array<PlainPrice>
	pricesWeekly: Array<PlainPrice>
	/** 15-minute bars of the latest trading day ("1T") */
	pricesIntraday1d?: Array<PlainPrice>
	/** 15-minute bars of the last 5 trading days ("5T") */
	pricesIntraday5d?: Array<PlainPrice>
	/** previous day's close, the reference line of the "1T" chart */
	previousClose?: number | null
}
export default function StockChartContainer({
	assetId,
	prices,
	pricesWeekly,
	pricesIntraday1d = [],
	pricesIntraday5d = [],
	previousClose,
}: props) {
	const hasIntraday = pricesIntraday1d.length > 0
	const {
		enabled: intradayEnabled,
		loaded: intradayLoaded,
		setEnabled: setIntradayEnabled,
	} = useIntradayPreference()
	const [selectedIntervall, setSelectedIntervall] = useState<number>(7)
	const [overlays, setOverlays] = useState<OverlayKey[]>([])
	// 7T-30T with intraday prices: loaded on demand
	const monthBars = useMonthBars(
		assetId,
		hasIntraday &&
			intradayLoaded &&
			intradayEnabled &&
			selectedIntervall > 5 &&
			selectedIntervall <= maxIntradayDays,
		pricesIntraday1d.at(-1)?.tstamp
	)
	// 1T/5T are intraday only; up to 30 days intraday when switched on (daily
	// candles until the bars have loaded); longer ranges daily/weekly candles
	const intraday =
		hasIntraday &&
		(selectedIntervall <= 5 ||
			(intradayEnabled &&
				selectedIntervall <= maxIntradayDays &&
				monthBars !== null))
	const timeAxis: TimeAxis = !intraday
		? "date"
		: selectedIntervall === 1
			? "time"
			: selectedIntervall <= 7
				? "weekdayTime"
				: "dateTime"
	const timeFrame = useMemo(() => {
		const start = getDateCertainDaysAgo(selectedIntervall)
		const end = getCurrentDate()
		return { start, end }
	}, [selectedIntervall])

	const data = useMemo(() => {
		if (intraday) {
			if (selectedIntervall === 1) return pricesIntraday1d
			if (selectedIntervall === 5) return pricesIntraday5d
			const start = timeFrame.start.toISOString()
			return (monthBars ?? []).filter(price => price.tstamp >= start)
		}
		const data = []
		const src = selectedIntervall < 360 ? prices : pricesWeekly
		const start = timeFrame.start ? toISODateOnly(timeFrame.start) : undefined

		for (const price of src) {
			if (start && price.tstamp >= start) {
				data.push(price)
			}
		}
		return data
	}, [
		prices,
		pricesWeekly,
		pricesIntraday1d,
		pricesIntraday5d,
		monthBars,
		intraday,
		timeFrame,
		selectedIntervall,
	])

	const area = useMemo(
		() =>
			calculateOffset(
				data,
				"close",
				intraday && selectedIntervall === 1 ? previousClose : null
			),
		[data, intraday, selectedIntervall, previousClose]
	)
	// benchmarks compare daily closes: not in the intraday views
	const activeOverlays = useMemo(
		() => (intraday ? overlays.filter(key => !isBenchmark(key)) : overlays),
		[intraday, overlays]
	)
	const { series: overlaySeries, loading: overlaysLoading } = useChartOverlays(
		assetId,
		activeOverlays,
		!intraday && selectedIntervall >= 360 ? "weekly" : "daily"
	)
	const rows = useMemo(
		() => withOverlays(data, activeOverlays, overlaySeries),
		[data, activeOverlays, overlaySeries]
	)
	// y-range and gain/loss split over the price and the overlay lines
	const { offset, domain } = useMemo(() => {
		const range = activeOverlays.length
			? overlayRange(rows, activeOverlays)
			: null
		if (!range) return { offset: area.offset, domain: undefined }
		const min = Math.min(range[0], area.startValue)
		const max = Math.max(range[1], area.startValue)
		return {
			offset: max > min ? (max - area.startValue) / (max - min) : 0,
			domain: [min, max] as [number, number],
		}
	}, [rows, activeOverlays, area])

	const tickInterval = useMemo(() => {
		// intraday: let recharts pick ticks that fit
		if (intraday) {
			return undefined
		}
		if (selectedIntervall <= 15) {
			return 0
		}
		if (selectedIntervall <= 32) {
			return 1
		}
		if (selectedIntervall <= 100) {
			return 5
		}

		if (selectedIntervall <= 400) {
			return 3
		}

		return 17
	}, [selectedIntervall, intraday])

	const candleData = toRelativeValues(data).map((row, i) => ({
		...row,
		...Object.fromEntries(
			activeOverlays.map(key => [key, rows[i]?.[key] ?? null])
		),
	}))
	return (
		<ChartContainer
			toolbar={[
				<IntervallPickerControlled
					key={0}
					value={selectedIntervall}
					onValueChange={setSelectedIntervall}
					intraday={{
						available: hasIntraday,
						enabled: intradayEnabled,
						onChange: setIntradayEnabled,
					}}
				/>,
				<OverlayPicker
					key={1}
					value={overlays}
					onValueChange={setOverlays}
					benchmarksAvailable={!intraday}
					loading={overlaysLoading}
				/>,
			]}
			footer={<OverlayLegend value={activeOverlays} />}
			defaultTab="line"
			className="w-full"
			tabs={[
				{
					name: "candlestick",
					icon: (
						<CandleStickIcon className="size-7 md:size-5 stroke-muted-foreground" />
					),
					content: (
						<CandleStickChart
							className="aspect-4/3 md:aspect-20/9 lg:aspect-6/2 xl:aspect-8/2 border rounded-3xl px-2 pt-2"
							data={candleData}
							xKey="date"
							barKey="open_close"
							errorKey="high_low"
							winKey="closeLargerOpen"
							lineKey="absClose"
							tickInterval={tickInterval}
							timeAxis={timeAxis}
							overlays={activeOverlays}
						/>
					),
				},
				{
					name: "line",
					icon: (
						<LinechartIcon className="size-7 md:size-5 stroke-muted-foreground" />
					),
					content: (
						<AreaChart
							className="aspect-4/3 md:aspect-20/9 lg:aspect-6/2 xl:aspect-8/2 border rounded-3xl px-2 pt-2"
							// overlay rows carry a nested `change` object for the tooltip
							data={rows as unknown as PlainPrice[]}
							dataKey="close"
							xKey="tstamp"
							yKey="close"
							offset={offset}
							tickInterval={tickInterval}
							startValue={area.startValue}
							timeAxis={timeAxis}
							overlays={activeOverlays}
							domain={domain}
						/>
					),
				},
			]}
		/>
	)
}

/**
 * The last 30 days of 15-minute bars, fetched in the browser once `active`
 * (7T-30T with intraday prices on). Refetched when `latestBar` (the newest
 * bar of the server-rendered data) changes, i.e. after a new bar arrived.
 */
function useMonthBars(
	assetId: number,
	active: boolean,
	latestBar: string | undefined
): PlainPrice[] | null {
	const [bars, setBars] = useState<PlainPrice[] | null>(null)

	// biome-ignore lint/correctness/useExhaustiveDependencies: latestBar triggers a refetch after a new bar
	useEffect(() => {
		if (!active) return
		let cancelled = false
		supabase
			.schema("api")
			.from("asset_prices_intraday")
			.select("tstamp, open, high, low, close, volume")
			.eq("asset_id", assetId)
			.gte("tstamp", getDateCertainDaysAgo(maxIntradayDays).toISOString())
			.not("close", "is", null)
			.order("tstamp", { ascending: true })
			.then(({ data, error }) => {
				if (cancelled) return
				if (error) {
					console.error("Failed to load intraday prices", error)
					return
				}
				setBars(data as PlainPrice[])
			})
		return () => {
			cancelled = true
		}
	}, [active, assetId, latestBar])

	return bars
}
