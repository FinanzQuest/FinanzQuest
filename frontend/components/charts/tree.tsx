"use client"
import type React from "react"
import { Treemap } from "recharts"
import type { TreemapNode } from "recharts/types/chart/Treemap"
import { type ChartConfig, ChartContainer } from "@/components/ui/chart"
import type { PositionSummary } from "@/database/custom_types"
import { currencyFormat } from "@/lib/cash_display_string"
import { cn } from "@/lib/utils"

interface props<T extends Record<string, number | string | null>>
	extends React.ComponentPropsWithoutRef<"div"> {
	data: Array<T>
	dataKey: Extract<keyof T, string>
}

// recharts injects the node's layout when passed as <Treemap content={...} />
interface ContentProps extends Partial<TreemapNode> {
	data: Record<string, number | string | null>[]
}

function calculateOpacity(profit: number) {
	const x = Math.abs(profit)
	return Math.min(0.7, 10 * x) // clamp so it remains readable
}

function CustomContent(props: ContentProps) {
	const {
		depth = 0,
		x = 0,
		y = 0,
		width = 0,
		height = 0,
		index = 0,
		data,
		name = "",
		value = 0,
	} = props
	const position = data.at(index) as PositionSummary
	let prof = 0
	let color = ""

	if (position !== undefined && position !== null) {
		prof = (position.total_profit as number) / (position.market_value as number)
		color = prof > 0 ? "var(--win)" : "var(--loss)"
	}

	const opacity = depth > 0 ? calculateOpacity(prof) : 0
	const mix_factor = 0.4
	return (
		<g>
			<rect x={x} y={y} width={width} height={height} fill="#00000000" />
			<rect
				x={x}
				y={y}
				rx={10}
				width={width - 10}
				height={height - 10}
				style={{
					fill: color,
					stroke: color,
					fillOpacity: opacity,
					borderRadius: 10,
					strokeWidth: 1,
					strokeOpacity: depth > 0 ? 1 : 0,
				}}
			/>
			{depth === 1 ? (
				<text
					x={x + width / 2}
					y={y + height / 2 + 7}
					fill={`color-mix(in oklch, ${color} ${mix_factor * 100}%, var(--foreground) ${100 - mix_factor * 100}%)`}
					className="text-ellipsis"
					textAnchor="middle"
					fontSize={14}
				>
					{name}
				</text>
			) : null}
			{depth === 1 ? (
				<text
					x={x + 6}
					y={y + 20}
					fill={`color-mix(in oklch, ${color} ${mix_factor * 100}%, var(--foreground) ${100 - mix_factor * 100}%)`}
					fontSize={16}
					fillOpacity={0.9}
				>
					{currencyFormat.format(value as number)}
				</text>
			) : null}
		</g>
	)
}

export default function TreeChart<
	T extends Record<string, number | string | null>,
>({ data, dataKey, className }: props<T>) {
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
			className={cn("min-h[200px] pl-3 pt-0.5", className)}
		>
			<Treemap
				isAnimationActive={false}
				data={data}
				dataKey={dataKey}
				content={<CustomContent data={data} />}
			/>
		</ChartContainer>
	)
}
