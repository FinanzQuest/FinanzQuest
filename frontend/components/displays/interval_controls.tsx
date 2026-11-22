"use client"

import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group"

export default function IntervalControls(props: {
	className?: string
	intervals: Record<string, number>
	onChange?: (key: string, value: number) => void
}) {
	const keys = Object.keys(props.intervals)
	const items = keys.map(key => (
		<ToggleGroupItem
			className="min-w-7 min-h-7 p-0 h-fit text-xs"
			key={key}
			value={key}
		>
			{key}
		</ToggleGroupItem>
	))
	return (
		<ToggleGroup
			defaultValue={keys.slice(0, 1)}
			onValueChange={([key]) => {
				if (key === undefined) return
				props.onChange?.(key, props.intervals[key])
			}}
			className={props.className}
		>
			{items}
		</ToggleGroup>
	)
}
