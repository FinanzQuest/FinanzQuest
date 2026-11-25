"use client"
import "./container.css"
import {
	CandlestickChart as CandleStickIcon,
	LineChart as LinechartIcon,
} from "lucide-react"
import { type ComponentPropsWithoutRef, useMemo, useState } from "react"

import type { PlainPrice } from "@/database/custom_types"
import toRelativeValues, { calculateOffset } from "@/lib/data/data_utils"
import {
	isBenchmark,
	type OverlayKey,
	overlayRange,
	withOverlays,
} from "@/lib/data/overlays"
import { type Trade, tradesOnRows } from "@/lib/data/trades"
import { useChartOverlays } from "@/lib/use_chart_overlays"
import {
	getCurrentDate,
	getDateCertainDaysAgo,
	type TimeAxis,
	toISODateOnly,
} from "@/lib/util"
import { IntervallPickerControlled } from "../cards/pick_intervall"
import { Button } from "../ui/button"
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
	/** the active depot's buys/sells of this asset, drawn as markers */
	trades?: Trade[]
}
export default function StockChartContainer({
	assetId,
	prices,
	pricesWeekly,
	pricesIntraday1d = [],
	pricesIntraday5d = [],
	previousClose,
	trades = [],
}: props) {
	const [showTrades, setShowTrades] = useState(true)
	const hasIntraday = pricesIntraday1d.length > 0
	const [selectedIntervall, setSelectedIntervall] = useState<number>(7)
	const [overlays, setOverlays] = useState<OverlayKey[]>([])
	// 1T/5T: 15-minute bars; every longer range: daily (weekly from 1J)
	const intraday = hasIntraday && selectedIntervall <= 5
	const timeAxis: TimeAxis = !intraday
		? "date"
		: selectedIntervall === 1
			? "time"
			: "weekdayTime"
	const timeFrame = useMemo(() => {
		const start = getDateCertainDaysAgo(selectedIntervall)
		const end = getCurrentDate()
		return { start, end }
	}, [selectedIntervall])

	const data = useMemo(() => {
		if (intraday) {
			return selectedIntervall === 1 ? pricesIntraday1d : pricesIntraday5d
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
	const lineMarkers = useMemo(
		() =>
			showTrades
				? tradesOnRows(
						rows.map(r => ({ x: r.tstamp, y: r.close })),
						trades,
						intraday
					)
				: [],
		[showTrades, rows, trades, intraday]
	)
	const candleMarkers = useMemo(
		() =>
			showTrades
				? tradesOnRows(
						data.map(r => ({ x: r.tstamp, y: r.close })),
						trades,
						intraday
					)
				: [],
		[showTrades, data, trades, intraday]
	)
	return (
		<ChartContainer
			toolbar={[
				<IntervallPickerControlled
					key={0}
					value={selectedIntervall}
					onValueChange={setSelectedIntervall}
					intradayAvailable={hasIntraday}
				/>,
				<OverlayPicker
					key={1}
					value={overlays}
					onValueChange={setOverlays}
					benchmarksAvailable={!intraday}
					loading={overlaysLoading}
				/>,
				trades.length > 0 && (
					<Button
						key={2}
						type="button"
						size="sm"
						variant={showTrades ? "secondary" : "ghost"}
						aria-pressed={showTrades}
						onClick={() => setShowTrades(v => !v)}
					>
						Käufe/Verkäufe
					</Button>
				),
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
							markers={candleMarkers}
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
							markers={lineMarkers}
						/>
					),
				},
			]}
		/>
	)
}
