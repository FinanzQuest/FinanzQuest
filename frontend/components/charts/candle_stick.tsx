"use client"
import type React from "react"
import type { TooltipContentProps, TooltipValueType } from "recharts"
import {
	Bar,
	Cell,
	ComposedChart,
	ErrorBar,
	Line,
	XAxis,
	YAxis,
} from "recharts"
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
} from "@/components/ui/chart"
import { formatFloatingPointString } from "@/lib/data/formatter"
import {
	numberFormat,
	type TimeAxis,
	timeAxisLabel,
	timeAxisTick,
} from "@/lib/util"
import { cn } from "@/lib/utils"
import {
	type TtoRelativeValues,
	toAbsoluteValues,
} from "../../lib/data/data_utils"
import { WinLossIndicator } from "../stat/indicator"
import { Separator } from "../ui/separator"

type BarDataT = Record<
	string,
	[number, number] | string | boolean | number | null
>

interface props<T extends BarDataT>
	extends React.ComponentPropsWithoutRef<"div"> {
	data: Array<T>
	barKey: Extract<keyof T, string>
	errorKey: Extract<keyof T, string>
	winKey: Extract<keyof T, string>
	xKey: Extract<keyof T, string>
	lineKey: Extract<keyof T, string>
	tickInterval?: number
	timeAxis?: TimeAxis
}
export default function CandleStickChart<T extends BarDataT>({
	data,
	className,
	xKey,
	barKey,
	errorKey,
	winKey,
	lineKey,
	tickInterval,
	timeAxis = "date",
}: props<T>) {
	const chartData = data //data
	const chartConfig = {
		open: {
			label: "Open",
		},
		close: {
			label: "Open",
		},
	} satisfies ChartConfig

	return (
		<ChartContainer
			className={cn("min-h[200px]", className)}
			config={chartConfig}
		>
			<ComposedChart accessibilityLayer data={chartData}>
				<XAxis
					className="number"
					dataKey={xKey}
					interval={tickInterval || "preserveEnd"}
					tickFormatter={timestamp => timeAxisTick(timestamp, timeAxis)}
				/>
				<YAxis hide domain={["min", "max"]} />
				<Bar maxBarSize={20} dataKey={barKey} fill="var(--win)">
					{chartData.map(entry => {
						const win = entry[winKey]
						return (
							<Cell
								className="z-10"
								key={entry[xKey] as string}
								radius={4}
								fillOpacity={0.6}
								stroke={win ? "var(--win)" : "var(--loss)"}
								fill={win ? "var(--win)" : "var(--loss)"}
							/>
						)
					})}
					<ErrorBar
						className="-z-10"
						dataKey={errorKey}
						width={0}
						strokeWidth={1}
						stroke="var(--foreground)"
						strokeOpacity={0.5}
					></ErrorBar>
				</Bar>
				<Line
					dot={false}
					dataKey={lineKey}
					strokeWidth={1}
					type="linear"
					stroke="var(--muted-foreground)"
					connectNulls
					strokeOpacity={0.5}
				/>
				<ChartTooltip
					isAnimationActive={false}
					filterNull
					content={<CustomTooltip timeAxis={timeAxis} />}
				/>
			</ComposedChart>
		</ChartContainer>
	)
}

// injected by recharts when passed as <Tooltip content={<CustomTooltip />} />
type CustomToolTipProps = Partial<
	TooltipContentProps<TooltipValueType, string>
> & {
	timeAxis?: TimeAxis
}

const CustomTooltip = ({
	active,
	payload,
	label,
	timeAxis,
}: CustomToolTipProps) => {
	if (!active || !payload?.length) {
		return null
	}

	const dataPayload = payload[0].payload as TtoRelativeValues | null

	if (!dataPayload) {
		return null
	}
	const row = toAbsoluteValues(dataPayload)
	const displayValues = [
		{ name: "Open", string: numberFormat.format(row.open) },
		{ name: "Close", string: numberFormat.format(row.close) },
		{ name: "High", string: numberFormat.format(row.high) },
		{ name: "Low", string: numberFormat.format(row.low) },
	]
	const profit = row.close - row.open
	return (
		<div className="bg-background p-2 rounded shadow border">
			<h1 className="font-semibold text-sm">
				{timeAxisLabel(String(label), timeAxis)}
			</h1>
			<Separator orientation="horizontal" className="my-2" />
			<div className="grid grid-cols-2 gap-2">
				{displayValues.map(value => (
					<>
						<span key={value.name} className="font-semibold">
							{value.name}
						</span>
						<span key={`${value.name}-${value}`} className="text-right number">
							{value.string}
						</span>
					</>
				))}
			</div>
			<Separator orientation="horizontal" className="my-2" />
			<span className="inline-flex flex-row gap-2">
				<span className="font-semibold">Profit:</span>
				<WinLossIndicator sign={Math.sign(row.close - row.open)} />
				<span className="label numeric">
					{row.closeLargerOpen ? "+" : "-"}
					{formatFloatingPointString(Math.abs(profit), 2)}
				</span>
			</span>
		</div>
	)
}
