"use client"
import type React from "react"
import { Cell, Pie, PieChart as RechartsPieChart, Tooltip } from "recharts"
import { type ChartConfig, ChartContainer } from "@/components/ui/chart"
import type { PositionSummary } from "@/database/custom_types"
import { currencyFormat } from "@/lib/cash_display_string"
import { cn } from "@/lib/utils"
import { Separator } from "../ui/separator"

interface props<T extends Record<string, number | string | null>>
	extends React.ComponentPropsWithoutRef<"div"> {
	data: Array<T>
	dataKey: Extract<keyof T, string>
}

function colorFor(position: PositionSummary | undefined): string {
	if (!position) return "var(--muted-foreground)"
	const profitRatio =
		(position.total_profit ?? 0) / (position.market_value ?? 1)
	return profitRatio > 0 ? "var(--win)" : "var(--loss)"
}

export default function PieChart<
	T extends Record<string, number | string | null>,
>({ data, dataKey, className }: props<T>) {
	const chartConfig = {
		value: {
			label: "Marktwert",
		},
	} satisfies ChartConfig

	const total = data.reduce(
		(sum, entry) => sum + Number(entry[dataKey] ?? 0),
		0
	)
	const sortedData = [...data].sort(
		(a, b) => Number(b[dataKey] ?? 0) - Number(a[dataKey] ?? 0)
	)

	return (
		<div className={cn("flex flex-col gap-3", className)}>
			<ChartContainer
				config={chartConfig}
				className="w-full max-w-[420px] mx-auto aspect-square"
			>
				<RechartsPieChart>
					<Pie
						data={sortedData}
						dataKey={dataKey}
						nameKey="symbol"
						cx="50%"
						cy="50%"
						innerRadius="55%"
						cornerRadius={8}
						isAnimationActive={false}
					>
						{sortedData.map(entry => (
							<Cell
								key={(entry as unknown as PositionSummary).asset_id}
								fill={colorFor(entry as unknown as PositionSummary)}
								stroke="var(--background)"
								strokeWidth={2}
							/>
						))}
					</Pie>
					<Tooltip content={<CustomTooltip />} />
				</RechartsPieChart>
			</ChartContainer>
			<div className="flex flex-row flex-wrap justify-center gap-x-4 gap-y-1.5">
				{sortedData.map((entry, index) => {
					const position = entry as unknown as PositionSummary
					const share =
						total > 0 ? (Number(entry[dataKey] ?? 0) / total) * 100 : 0
					return (
						<div
							key={position.asset_id ?? index}
							className="flex items-center gap-1.5 text-xs"
						>
							<span
								className="size-2 rounded-[2px]"
								style={{ backgroundColor: colorFor(position) }}
							/>
							<span className="text-muted-foreground">{position.symbol}</span>
							<span className="number tabular-nums">{share.toFixed(1)} %</span>
						</div>
					)
				})}
			</div>
		</div>
	)
}

type CustomTooltipProps = {
	active?: boolean
	payload?: Array<{
		value?: number | string
		payload?: PositionSummary
	}>
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
	if (!active || !payload?.length) {
		return null
	}

	const position = payload[0].payload

	return (
		<div className="bg-background p-2 text-sm rounded shadow border">
			<h1 className="flex flex-row items-center gap-2">
				<span
					className="size-2.5 rounded-full"
					style={{ backgroundColor: colorFor(position) }}
				/>
				<span className="font-semibold">{position?.symbol ?? "Unbekannt"}</span>
			</h1>
			<Separator orientation="horizontal" className="my-2 col-span-2" />
			<p className="label inline-flex flex-row gap-2">
				<span className="number">
					{currencyFormat.format(Number(payload[0].value ?? 0))}
				</span>
			</p>
		</div>
	)
}
