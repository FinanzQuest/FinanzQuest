"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { getStockPagePath } from "@/lib/get_stock_path"
import { cn } from "@/lib/utils"
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group"

interface props {
	value: number
	onValueChange: (value: number) => void
	className?: string
}

export default function IntervallPicker({
	onValueChange,
	value,
	className,
}: props) {
	interface IntervallType {
		name: string
		display: string
		days: number
	}
	const intervallTemplates: Array<IntervallType> = [
		{ name: "7d", display: "7 days", days: 7 },
		{ name: "14d", display: "14 days", days: 14 },
		{ name: "30d", display: "30 days", days: 30 },
		{ name: "quarter", display: "quarter", days: 92 },
		{ name: "year", display: "year", days: 365 },
		{ name: "5years", display: "5 years", days: 365 * 5 },
	]

	const [selected, setSelected] = useState({
		name: `${value}d`,
		display: `${value}days`,
		days: value,
	})

	return (
		<Select
			value={selected.name}
			onValueChange={value => {
				const s = intervallTemplates.find(intervall => intervall.name === value)
				const result = s === undefined ? intervallTemplates[0] : s
				onValueChange(result.days)
				setSelected(result)
			}}
		>
			<SelectTrigger>
				<div className={cn("flex flex-row gap-1", className)}>
					<div>Last</div>
					<SelectValue />
				</div>
			</SelectTrigger>
			<SelectContent>
				{/* <SelectItem key={-1} value={selected.name}>
              {selected.display}
            </SelectItem> */}
				{intervallTemplates.map(item => (
					<SelectItem key={item.name} value={item.name}>
						{item.display}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
}

export interface IntervalOption {
	name: string
	display: string
	days: number
	/** only offered while intraday prices are shown (e.g. "1T") */
	intradayOnly?: boolean
}

/** Ranges of the stock chart. */
export const stockIntervals: IntervalOption[] = [
	{ name: "1d", display: "1T", days: 1, intradayOnly: true },
	{ name: "5d", display: "5T", days: 5, intradayOnly: true },
	{ name: "7d", display: "7T", days: 7 },
	{ name: "14d", display: "14T", days: 14 },
	{ name: "30d", display: "30T", days: 30 },
	{ name: "quarter", display: "3M", days: 92 },
	{ name: "year", display: "1J", days: 365 },
	{ name: "5years", display: "5J", days: 365 * 5 },
]

interface ControlledProps extends props {
	options?: IntervalOption[]
	/** intraday prices exist: the intraday-only ranges (1T, 5T) are offered */
	intradayAvailable?: boolean
}

export function IntervallPickerControlled({
	onValueChange,
	value,
	className,
	options = stockIntervals,
	intradayAvailable = false,
}: ControlledProps) {
	const visible = options.filter(
		item => intradayAvailable || !item.intradayOnly
	)

	return (
		<div
			className={cn(
				"w-fit max-w-full flex flex-row items-center gap-1",
				className
			)}
		>
			<ToggleGroup
				className="w-fit max-w-full flex flex-row flex-nowrap overflow-x-auto gap-1"
				value={[visible.find(item => item.days === value)?.name as string]}
				onValueChange={value => {
					const s = visible.find(intervall => intervall.name === value[0])
					// clicking the active item deselects it — keep the current range
					if (s) onValueChange(s.days)
				}}
			>
				{visible.map(item => (
					<ToggleGroupItem key={item.name} value={item.name}>
						{item.display}
					</ToggleGroupItem>
				))}
			</ToggleGroup>
		</div>
	)
}

interface containerProps {
	defaultValue: number
	id: number
}
export function IntervallContainer({ defaultValue, id }: containerProps) {
	const router = useRouter()
	return (
		<IntervallPicker
			value={defaultValue}
			onValueChange={value => router.push(getStockPagePath(id, value))}
		/>
	)
}
