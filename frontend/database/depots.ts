import type { Database } from "@/database/types"
import type { NonNullableRow } from "./custom_types"

type DepotValue = NonNullableRow<Database["depots"]["Views"]["values"]["Row"]>

export function processDepotValues(edges: DepotValue[]) {
	const nodes: Array<{
		total: number
		assets: number
		cash: number
		timestamp: string
	}> = []

	const first = edges.at(0)
	if (!first) {
		return null
	}

	const total = first.assets + first.cash
	let startValue = total

	let maxValue = total
	let minValue = total

	for (const edge of edges) {
		const total = edge.cash + edge.assets
		nodes.push({
			total: total,
			assets: edge.assets,
			cash: edge.cash,
			timestamp: edge.tstamp,
		})
		minValue = Math.min(minValue, total)
		maxValue = Math.max(maxValue, total)
	}

	startValue = Math.min(startValue, minValue)

	const offset =
		Math.abs(maxValue - (startValue ?? 0)) / Math.abs(maxValue - minValue)

	return {
		data: nodes,
		min: minValue,
		max: maxValue,
		start: startValue,
		offset,
	}
}
