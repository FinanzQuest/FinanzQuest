"use client"

import type { ComponentPropsWithoutRef } from "react"
import StockChartContainer from "@/components/charts/container"
import type { PlainPrice } from "@/database/custom_types"
import type { Trade } from "@/lib/data/trades"
import { cn } from "@/lib/utils"

type CardProps = ComponentPropsWithoutRef<"div">

interface ChartCardProps extends CardProps {
	assetId: number
	prices: PlainPrice[]
	pricesWeekly: PlainPrice[]
	pricesIntraday1d?: PlainPrice[]
	pricesIntraday5d?: PlainPrice[]
	previousClose?: number | null
	trades?: Trade[]
}

export function ChartCard({
	assetId,
	prices,
	pricesWeekly,
	pricesIntraday1d,
	pricesIntraday5d,
	previousClose,
	trades,
	className,
}: ChartCardProps) {
	"use client"

	return (
		<div className={cn(className)}>
			<StockChartContainer
				assetId={assetId}
				prices={prices}
				pricesWeekly={pricesWeekly}
				pricesIntraday1d={pricesIntraday1d}
				pricesIntraday5d={pricesIntraday5d}
				previousClose={previousClose}
				trades={trades}
			/>
		</div>
	)
}
