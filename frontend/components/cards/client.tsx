"use client"

import type { ComponentPropsWithoutRef } from "react"
import StockChartContainer from "@/components/charts/container"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
} from "@/components/ui/card"
import type { PlainPrice } from "@/database/custom_types"
import { cn } from "@/lib/utils"

type CardProps = ComponentPropsWithoutRef<"div">

interface ChartCardProps extends CardProps {
	prices: PlainPrice[]
	pricesWeekly: PlainPrice[]
}

export function ChartCard({ prices, pricesWeekly, className }: ChartCardProps) {
	"use client"

	return (
		<div className={cn(className)}>
			<StockChartContainer prices={prices} pricesWeekly={pricesWeekly} />
		</div>
	)
}
