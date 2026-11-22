"use client"
import { ArrowDownAZ, Euro, Layers3, SortAsc, SortDesc } from "lucide-react"
import type React from "react"
import { useMemo, useState } from "react"
import type { AssetType, PositionSummary } from "@/database/custom_types"
import { SearchBarPopOut } from "../search_bar"
import { Button } from "../ui/button"
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "../ui/empty"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group"
import PositionList from "./position_list"

interface returnT {
	interval: 1 | 5 | 30
	order: SortMode
	descending: boolean
}
function ToolBar(props: {
	value: returnT
	onValueChange?: (value: returnT) => void
}) {
	// const intervals = {
	// 	1: "1d",
	// 	5: "1w",
	// 	30: "1m",
	// }
	const orders = [
		{
			type: "profit",
			display: "Performance",
			icon: <Euro />,
		},
		{
			type: "alphabetical",
			display: "Name",
			icon: <ArrowDownAZ />,
		},
	]

	return (
		<>
			<SortSelector
				orders={orders}
				onValueChange={(value, descending) => {
					props.onValueChange?.({
						order: value as SortMode,
						descending,
						interval: props.value.interval,
					})
				}}
				value={props.value.order}
				descending={props.value.descending}
			/>
			{
				// <Separator orientation="vertical" className="h-[1lh] self-center" />
				// <IntervalSelector
				// 	intervals={intervals}
				// 	value={props.value.interval}
				// 	onValueChange={value => {
				// 		interval = value
				// 		if (props.onValueChange) {
				// 			props.onValueChange({
				// 				order: order as SortMode,
				// 				descending,
				// 				interval,
				// 			})
				// 		}
				// 	}
				// }
				// />
			}
		</>
	)
}
type SortMode = "profit" | "alphabetical"

function sortProcessedPositions(
	positions: PositionSummary[],
	mode: SortMode,
	descending: boolean
) {
	const sort_funcs: Record<
		SortMode,
		(a: PositionSummary, b: PositionSummary) => number
	> = {
		profit: (a, b) => {
			const profitDiff = (a.total_profit ?? 0) - (b.total_profit ?? 0)
			return descending ? -profitDiff : profitDiff
		},
		alphabetical: (a, b) =>
			(descending ? -1 : 1) * (a.symbol ?? "").localeCompare(b.symbol ?? ""),
	}

	// copy: sorting in place would mutate the positions prop
	return [...positions].sort(sort_funcs[mode] ?? sort_funcs.profit)
}

type AssetTypeWithOther = AssetType | "other"

function sortByType(positions: PositionSummary[]) {
	const sortedStocks: Partial<Record<AssetTypeWithOther, PositionSummary[]>> =
		{}
	const counts: Map<AssetTypeWithOther, number> = new Map()

	for (const position of positions) {
		const asset_type = position.asset_type ?? "other"
		if (!sortedStocks[asset_type]) {
			sortedStocks[asset_type] = []
		}
		;(sortedStocks[asset_type] as PositionSummary[]).push(position)
		counts.set(asset_type, (counts.get(asset_type) ?? 0) + 1)
	}

	return { sortedStocks, counts }
}

export default function PositionTabView({
	positions_raw,
}: {
	positions_raw: PositionSummary[]
}) {
	const [modes, setModes] = useState<returnT>({
		descending: true,
		interval: 1,
		order: "profit",
	})

	const positions = useMemo(
		() => sortProcessedPositions(positions_raw, modes.order, modes.descending),
		[positions_raw, modes.order, modes.descending]
	)
	const displays: Map<AssetType | "other", string> = new Map([
		["stock", "Aktien"],
		["fund", "ETFs"],
		["crypto", "Krypto"],
		["commodity", "Kommoditäten"],
		["other", "Andere"],
	])

	const { sortedStocks, counts } = useMemo(
		() => sortByType(positions),
		[positions]
	)

	const types = Object.keys(sortedStocks)

	return (
		<Tabs defaultValue="all" className="rounded">
			<div className="flex flex-row gap-4 w-full">
				<div className="border rounded-full p-2 bg-muted/50">
					<TabsList className="p-0 bg-transparent">
						<TabsTrigger className="h-full" value="all">
							All {Object.values(sortedStocks).flat().length}
						</TabsTrigger>
						{types.map(asset_type => {
							const count = counts.get(asset_type as AssetTypeWithOther) ?? 0
							const name =
								displays.get(asset_type as AssetTypeWithOther) ?? asset_type
							return (
								<TabsTrigger
									className="h-full"
									key={asset_type}
									value={asset_type}
								>
									{name} {count}
								</TabsTrigger>
							)
						})}
					</TabsList>
				</div>
				<div className="grow" />

				<div className="border rounded-full p-2 bg-muted/50">
					<ToolBar value={modes} onValueChange={setModes} />
				</div>
			</div>
			<TabsContent value="all">
				<PositionList positions={Object.values(sortedStocks).flat()} />
			</TabsContent>
			{Object.entries(sortedStocks).map(([stockType, positions]) => {
				return (
					<TabsContent key={stockType} value={stockType}>
						<PositionList positions={positions} />
					</TabsContent>
				)
			})}
		</Tabs>
	)
}

export function PositionsEmpty() {
	return (
		<Empty>
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<Layers3 />
				</EmptyMedia>
				<EmptyTitle>Leeres Depot</EmptyTitle>
				<EmptyDescription>
					Investiere in dein erstes Wertpapier
				</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<SearchBarPopOut
					triggerRender={props => (
						<Button {...props}>Finde ein Wertpapier</Button>
					)}
					doRedirect
				/>
			</EmptyContent>
		</Empty>
	)
}

function SortSelector(props: {
	orders: {
		type: string
		display: string
		icon: React.ReactNode
	}[]
	onValueChange?: (value: string, descending: boolean) => void
	value?: string
	descending?: boolean
}) {
	// controlled: always report the current props plus the one changed value
	const descending = props.descending ?? false
	const items: React.ReactNode[] = []
	for (const order of props.orders) {
		items.push(
			<SelectItem value={order.type} key={order.type}>
				<div className="flex flex-row gap-3 items-center">
					<span className="size-[1.1lh] *:size-full stroke-muted-foreground">
						{order.icon}
					</span>
					<span>{order.display}</span>
				</div>
			</SelectItem>
		)
	}
	return (
		<div className="flex flex-row gap-2">
			<Select
				onValueChange={value => {
					if (value === null) return
					props.onValueChange?.(value, descending)
				}}
				value={props.value}
			>
				<SelectTrigger className="w-fit bg-background h-full">
					<SelectValue placeholder="Sortiermodus" />
				</SelectTrigger>
				<SelectContent sideOffset={10}>{items}</SelectContent>
			</Select>
			<ToggleGroup
				value={[props.descending ? "descending" : "ascending"]}
				defaultValue={["descending"]}
				onValueChange={value => {
					// clicking the active item deselects it: keep the direction
					if (!value[0]) return
					props.onValueChange?.(props.value ?? "", value[0] === "descending")
				}}
			>
				<ToggleGroupItem value="descending">
					<SortDesc />
				</ToggleGroupItem>
				<ToggleGroupItem value="ascending">
					<SortAsc />
				</ToggleGroupItem>
			</ToggleGroup>
		</div>
	)
}

// function IntervalSelector<T extends Record<number, string>>(props: {
// 	intervals: T
// 	default?: keyof T
// 	value?: keyof T
// 	onValueChange?: (days: keyof T, display: string) => void
// }) {
// 	const items: React.ReactNode[] = []

// 	for (const [days, display] of Object.entries(props.intervals)) {
// 		items.push(
// 			<ToggleGroupItem
// 				className="h-full px-3"
// 				key={days}
// 				value={days.toString()}
// 			>
// 				{display}
// 			</ToggleGroupItem>
// 		)
// 	}
// 	return (
// 		<ToggleGroup
// 			value={props.value?.toString()}
// 			type="single"
// 			defaultValue="1d"
// 			className=""
// 			onValueChange={k => {
// 				const key = Number.parseInt(k, 10)
// 				const value = props.intervals[key]
// 				if (props.onValueChange) {
// 					props.onValueChange(key, value)
// 				}
// 			}}
// 		>
// 			{items}
// 		</ToggleGroup>
// 	)
// }
