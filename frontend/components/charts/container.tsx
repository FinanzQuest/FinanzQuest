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
	getCurrentDate,
	getDateCertainDaysAgo,
	type TimeAxis,
	toISODateOnly,
} from "@/lib/util"
import { IntervallPickerControlled } from "../cards/pick_intervall"
import AreaChart from "./area"
import CandleStickChart from "./candle_stick"
import ChartContainer from "./primitive/container"

export interface props extends ComponentPropsWithoutRef<"div"> {
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
	prices,
	pricesWeekly,
	pricesIntraday1d = [],
	pricesIntraday5d = [],
	previousClose,
}: props) {
	const hasIntraday = pricesIntraday1d.length > 0
	const [selectedIntervall, setSelectedIntervall] = useState<number>(7)
	// ranges up to 5 days are intraday bars, longer ones daily/weekly candles
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

	const candleData = toRelativeValues(data)
	return (
		<ChartContainer
			toolbar={[
				<IntervallPickerControlled
					key={0}
					value={selectedIntervall}
					onValueChange={setSelectedIntervall}
					intraday={hasIntraday}
				/>,
			]}
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
							data={data}
							dataKey="close"
							xKey="tstamp"
							yKey="close"
							offset={area.offset}
							tickInterval={tickInterval}
							startValue={area.startValue}
							timeAxis={timeAxis}
						/>
					),
				},
			]}
		/>
	)
}
