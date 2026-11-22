"use client"
import {
	LineChart as LinechartIcon,
	PieChart as PieChartIcon,
	TableCellsMerge,
} from "lucide-react"
import type React from "react"
import { useMemo, useState } from "react"
import AreaChart from "@/components/charts/area"
import ChartContainer from "@/components/charts/primitive/container"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { type DepotValuePoint, processDepotValues } from "@/database/depots"
import { calculateOffset } from "@/lib/data/data_utils"
import { getDateCertainDaysAgo, type TimeAxis, toISODateOnly } from "@/lib/util"

type Range = "1d" | "1m" | "1y"

const ranges: Array<{ name: Range; display: string }> = [
	{ name: "1d", display: "Heute" },
	{ name: "1m", display: "1M" },
	{ name: "1y", display: "1J" },
]

interface DepotValueChartProps {
	/** depots.values of the last year (one row per day, incl. live today) */
	valuesYear: DepotValuePoint[]
	/** depots.get_intraday_values: previous close, 15-min points, now */
	valuesIntraday: DepotValuePoint[]
	treeChart: React.ReactNode
	pieChart: React.ReactNode
}

export default function DepotValueChart({
	valuesYear,
	valuesIntraday,
	treeChart,
	pieChart,
}: DepotValueChartProps) {
	const [range, setRange] = useState<Range>("1m")
	const available = ranges.filter(
		r => r.name !== "1d" || valuesIntraday.length > 0
	)

	const area = useMemo(() => {
		if (range === "1d") {
			const processed = processDepotValues(valuesIntraday)
			if (!processed) return null
			// measured against the previous close (the first point)
			const { offset, startValue } = calculateOffset(processed.data, "total")
			return { ...processed, offset, start: startValue }
		}
		const since = toISODateOnly(getDateCertainDaysAgo(30))
		return processDepotValues(
			range === "1m"
				? valuesYear.filter(value => value.tstamp >= since)
				: valuesYear
		)
	}, [range, valuesYear, valuesIntraday])

	const timeAxis: TimeAxis = range === "1d" ? "time" : "date"

	return (
		<ChartContainer
			className="overflow-hidden"
			defaultTab="line"
			toolbar={[
				<ToggleGroup
					key="range"
					className="w-fit flex flex-row gap-1"
					value={[range]}
					onValueChange={value => {
						const selected = available.find(r => r.name === value[0])
						if (selected) setRange(selected.name)
					}}
				>
					{available.map(r => (
						<ToggleGroupItem key={r.name} value={r.name}>
							{r.display}
						</ToggleGroupItem>
					))}
				</ToggleGroup>,
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
