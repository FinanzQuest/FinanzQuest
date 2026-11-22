"use client"

import type { ReactNode } from "react"
import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart"
import { compactMoneyString, currencyFormat } from "@/lib/cash_display_string"
import { numberFormat } from "@/lib/util"
import { cn } from "@/lib/utils"

/* Shared chart setup of the tutorial slides: the Shadcn chart container
 * (series colors come from the config as --color-<key>), quiet axes and a
 * tooltip that formats money the same way as the rest of the app. */

export { type ChartConfig, ChartLegend, ChartLegendContent, ChartTooltip }

export function SlideChart({
	config,
	className,
	children,
}: {
	config: ChartConfig
	className?: string
	children: React.ComponentProps<typeof ChartContainer>["children"]
}) {
	return (
		<ChartContainer
			config={config}
			className={cn("aspect-auto h-56 w-full", className)}
		>
			{children}
		</ChartContainer>
	)
}

export const axisProps = {
	tickLine: false,
	axisLine: false,
	tickMargin: 8,
	className: "tabular-nums",
} as const

export const gridProps = {
	vertical: false,
	strokeDasharray: "3 3",
} as const

/** Short axis labels that fit on phones: "800 €", "25k €", "1,2 Mio. €". */
export const moneyTick = (v: number) => {
	if (Math.abs(v) >= 1_000_000) return compactMoneyString(v, "EUR") ?? ""
	if (Math.abs(v) >= 1_000) return `${numberFormat.format(v / 1000)}k €`
	return currencyFormat.format(v)
}

/** Tooltip rows: series color, label from the chart config, value. */
export function SlideTooltipContent({
	config,
	xKey,
	labelPrefix,
	format = v => currencyFormat.format(v),
	...props
}: React.ComponentProps<typeof ChartTooltipContent> & {
	config: ChartConfig
	/** data key of the x axis, shown as the tooltip label */
	xKey: string
	labelPrefix?: string
	format?: (value: number) => ReactNode
}) {
	return (
		<ChartTooltipContent
			{...props}
			labelFormatter={(_, payload) => {
				const x = payload?.[0]?.payload?.[xKey] ?? ""
				return labelPrefix ? `${labelPrefix} ${x}` : String(x)
			}}
			formatter={(value, name) => (
				<div className="flex w-full items-center gap-2">
					<span
						aria-hidden
						className="size-2.5 shrink-0 rounded-[2px] bg-(--color-bg)"
						style={
							{
								"--color-bg": `var(--color-${String(name)})`,
							} as React.CSSProperties
						}
					/>
					<span className="text-muted-foreground">
						{config[String(name)]?.label ?? name}
					</span>
					<span className="ml-auto font-medium number tabular-nums text-foreground">
						{typeof value === "number" ? format(value) : String(value)}
					</span>
				</div>
			)}
		/>
	)
}
