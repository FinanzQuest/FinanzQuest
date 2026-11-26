"use client"
import type React from "react"
import type { TooltipContentProps, TooltipValueType } from "recharts"
import {
	Area,
	ComposedChart,
	Line,
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
import {
	isBenchmark,
	OVERLAY_COLOR,
	OVERLAY_LABEL,
	type OverlayKey,
	type OverlayValues,
} from "@/lib/data/overlays"
import { groupByX, type TradesByX } from "@/lib/data/trades"
import { type TimeAxis, timeAxisLabel, timeAxisTick } from "@/lib/util"
import { cn } from "@/lib/utils"
import { Separator } from "../ui/separator"
import { type TradeMarker, TradeTooltipRows, tradeDots } from "./trade_markers"

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
	/** lines drawn over the price (row fields of the same name) */
	overlays?: OverlayKey[]
	/** y-range covering price and overlays (default: the price) */
	domain?: [number, number]
	/** buy/sell markers on the line (null: hidden) */
	markers?: TradeMarker[]
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
	overlays = [],
	domain,
	markers = [],
}: props<T>) {
	const chartConfig = {
		open: {
			label: "Open",
		},
		close: {
			label: "Open",
		},
	} satisfies ChartConfig

	const tradesByX = groupByX(markers)

	return (
		<ChartContainer
			config={chartConfig}
			className={cn("min-h[200px]", className)}
		>
			<ComposedChart accessibilityLayer data={data}>
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
					dataKey={domain ? undefined : yKey}
					domain={
						domain ?? [
							(min: number) => Math.min(min, startValue),
							(max: number) => Math.max(max, startValue),
						]
					}
				/>
				<ChartTooltip
					isAnimationActive={false}
					filterNull
					content={
						<CustomTooltip
							timeAxis={timeAxis}
							overlays={overlays}
							trades={tradesByX}
						/>
					}
				/>
				<ReferenceLine
					y={startValue}
					strokeWidth={0.5}
					stroke="var(--foreground)"
					strokeOpacity={0.5}
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
					isAnimationActive={false}
				/>
				{overlays.map(key => (
					<Line
						key={key}
						dataKey={key}
						type="linear"
						dot={false}
						activeDot={false}
						connectNulls
						isAnimationActive={false}
						stroke={OVERLAY_COLOR[key]}
						strokeWidth={1.5}
						strokeDasharray={isBenchmark(key) ? undefined : "5 3"}
					/>
				))}
				{tradeDots(markers)}
			</ComposedChart>
		</ChartContainer>
	)
}

// injected by recharts when passed as <Tooltip content={<CustomTooltip />} />
type CustomTooltipProps = Partial<
	TooltipContentProps<TooltipValueType, string>
> & {
	timeAxis?: TimeAxis
	overlays?: OverlayKey[]
	trades?: TradesByX
}

const signedPercent = new Intl.NumberFormat("de-DE", {
	style: "percent",
	minimumFractionDigits: 1,
	maximumFractionDigits: 1,
	signDisplay: "exceptZero",
})

/** Overlay values of a chart row: moving averages in €, benchmarks in %. */
export function OverlayTooltipRows({
	row,
	overlays,
}: {
	row: OverlayValues | undefined
	overlays: OverlayKey[]
}) {
	if (!row || overlays.length === 0) return null
	return (
		<div className="grid grid-cols-[auto_auto] gap-x-3 gap-y-0.5 mt-2 text-xs">
			{overlays.map(key => {
				const v = isBenchmark(key) ? row.change?.[key] : row[key]
				if (v == null) return null
				return (
					<div key={key} className="contents">
						<span className="flex flex-row items-center gap-1.5">
							<span
								aria-hidden
								className="size-2 rounded-full"
								style={{ background: OVERLAY_COLOR[key] }}
							/>
							{OVERLAY_LABEL[key]}
						</span>
						<span className="number text-right">
							{isBenchmark(key)
								? signedPercent.format(v)
								: currencyFormat.format(v)}
						</span>
					</div>
				)
			})}
		</div>
	)
}

const CustomTooltip = ({
	active,
	payload,
	label,
	timeAxis,
	overlays = [],
	trades,
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
			<OverlayTooltipRows
				row={payload[0].payload as OverlayValues | undefined}
				overlays={overlays}
			/>
			<TradeTooltipRows trades={trades} x={String(label)} />
		</div>
	)
}
