"use client"
import type React from "react"
import type { TooltipContentProps, TooltipValueType } from "recharts"
import {
	Area,
	AreaChart as RechartsAreaChart,
	ReferenceLine,
	XAxis,
	YAxis,
} from "recharts"
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
} from "@/components/ui/chart"
import type { NullableRow } from "@/database/custom_types"
import { currencyFormat } from "@/lib/cash_display_string"
import { type TimeAxis, timeAxisLabel, timeAxisTick } from "@/lib/util"
import { cn } from "@/lib/utils"
import { Separator } from "../ui/separator"

interface props<T extends Record<string, number | string>>
	extends React.ComponentPropsWithoutRef<"div"> {
	data: Array<T | NullableRow<T>>
	offset: number
	dataKey: Extract<keyof T, string>
	xKey: Extract<keyof T, string>
	yKey: Extract<keyof T, string>
	startValue: number
	range?: number
	tickInterval?: number
	timeAxis?: TimeAxis
}

export default function AreaChart<T extends Record<string, number | string>>({
	data,
	dataKey,
	offset,
	className,
	xKey,
	yKey,
	startValue,
	tickInterval,
	timeAxis = "date",
}: props<T>) {
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
			config={chartConfig}
			className={cn("min-h[200px]", className)}
		>
			<RechartsAreaChart accessibilityLayer data={data}>
				<defs>
					<linearGradient id={"fill"} x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor={"var(--win)"} stopOpacity={0.35} />
						<stop
							offset={`${offset * 100}%`}
							stopColor={"var(--win)"}
							stopOpacity={0.1}
						/>
						<stop
							offset={`${offset * 100}%`}
							stopColor={"var(--loss)"}
							stopOpacity={0.1}
						/>
						<stop offset="100%" stopColor={"var(--loss)"} stopOpacity={0.35} />
					</linearGradient>
					<linearGradient id={"stroke"} x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor={"var(--win)"} stopOpacity={1} />
						<stop
							offset={`${offset * 100}%`}
							stopColor={"var(--win)"}
							stopOpacity={1}
						/>
						<stop
							offset={`${offset * 100}%`}
							stopColor={"var(--loss)"}
							stopOpacity={1}
						/>
						<stop offset="100%" stopColor={"var(--loss)"} stopOpacity={1} />
					</linearGradient>
				</defs>
				<XAxis
					className="number"
					dataKey={xKey}
					interval={tickInterval || "preserveEnd"}
					tickFormatter={timestamp => timeAxisTick(timestamp, timeAxis)}
				/>
				<YAxis
					hide
					dataKey={yKey}
					domain={[
						(min: number) => Math.min(min, startValue),
						(max: number) => Math.max(max, startValue),
					]}
				/>
				<ChartTooltip
					isAnimationActive={false}
					filterNull
					content={<CustomTooltip timeAxis={timeAxis} />}
				/>
				<ReferenceLine
					y={startValue}
					strokeWidth={0.5}
					stroke="hsl(var(--foreground)/50)"
					strokeDasharray="6 3"
				/>
				<Area
					baseValue={startValue}
					connectNulls={true}
					dataKey={dataKey}
					fillOpacity={1}
					type="linear"
					stroke="url(#stroke)"
					strokeWidth={2}
					fill="url(#fill)"
				/>
			</RechartsAreaChart>
		</ChartContainer>
	)
}

// injected by recharts when passed as <Tooltip content={<CustomTooltip />} />
type CustomTooltipProps = Partial<
	TooltipContentProps<TooltipValueType, string>
> & {
	timeAxis?: TimeAxis
}

const CustomTooltip = ({
	active,
	payload,
	label,
	timeAxis,
}: CustomTooltipProps) => {
	if (!active || !payload?.length) {
		return null
	}

	const value = Number.parseFloat(payload[0].value?.toString() ?? "")
	const valueType = payload[0].payload?.type ?? ""

	const displayString = Number.isNaN(value) ? "-" : currencyFormat.format(value)
	return (
		<div className="bg-background p-2 text-sm rounded shadow border">
			<h1 className="">
				<span className="font-semibold">
					{timeAxisLabel(String(label), timeAxis)}
				</span>
			</h1>
			<Separator orientation="horizontal" className="my-2 col-span-2" />
			<p className="label inline-flex flex-row gap-2">
				<span className="number">{displayString}</span>
				<span className="">{valueType}</span>
			</p>
		</div>
	)
}
