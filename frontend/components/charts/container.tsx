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
	toISODateOnly,
} from "@/lib/util"
import { IntervallPickerControlled } from "../cards/pick_intervall"
import AreaChart from "./area"
import CandleStickChart from "./candle_stick"
import ChartContainer from "./primitive/container"

export interface props extends ComponentPropsWithoutRef<"div"> {
	prices: Array<PlainPrice>
	pricesWeekly: Array<PlainPrice>
}
export default function StockChartContainer({ prices, pricesWeekly }: props) {
	const [selectedIntervall, setSelectedIntervall] = useState<number>(7)
	const timeFrame = useMemo(() => {
		const start = getDateCertainDaysAgo(selectedIntervall)
		const end = getCurrentDate()
		return { start, end }
	}, [selectedIntervall])

	const data = useMemo(() => {
		const data = []
		const src = selectedIntervall < 360 ? prices : pricesWeekly
		const start = timeFrame.start ? toISODateOnly(timeFrame.start) : undefined

		for (const price of src) {
			if (start && price.tstamp >= start) {
				data.push(price)
			}
		}
		return data
	}, [prices, pricesWeekly, timeFrame, selectedIntervall])

	const area = useMemo(() => calculateOffset(data, "close"), [data])
	const tickInterval = useMemo(() => {
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
	}, [selectedIntervall])

	const candleData = toRelativeValues(data)
	return (
		<ChartContainer
			toolbar={[
				<IntervallPickerControlled
					key={0}
					value={selectedIntervall}
					onValueChange={setSelectedIntervall}
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
						/>
					),
				},
			]}
		/>
	)
}
