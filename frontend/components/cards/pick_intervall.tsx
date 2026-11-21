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

export function IntervallPickerControlled({
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
		{ name: "7d", display: "7d", days: 7 },
		{ name: "14d", display: "14d", days: 14 },
		{ name: "30d", display: "30d", days: 30 },
		{ name: "quarter", display: "3mo", days: 92 },
		{ name: "year", display: "1y", days: 365 },
		{ name: "5years", display: "5y", days: 365 * 5 },
	]

	return (
		<ToggleGroup
			className={cn("w-fit flex flex-row gap-1", className)}
			value={[
				intervallTemplates.find(item => item.days === value)?.name as string,
			]}
			onValueChange={value => {
				console.log("a")
				const s = intervallTemplates.find(
					intervall => intervall.name === value[0]
				)

				const result = s === undefined ? intervallTemplates[0] : s
				onValueChange(result.days)
			}}
		>
			{intervallTemplates.map(item => (
				<ToggleGroupItem key={item.name} value={item.name}>
					{item.display}
				</ToggleGroupItem>
			))}
		</ToggleGroup>
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
