import type { AssetType } from "@/database/custom_types"

export function getIconURL(
	symbol: string,
	asset_type: AssetType,
	iconSize: number
): string | null {
	const pre = "https://assets.parqet.com/logos"
	const query = `?format=webp&size=${iconSize}`
	switch (asset_type) {
		case "stock":
		case "bond":
			return `${pre}/symbol/${symbol}${query}`

		case "crypto": {
			if (!symbol.match(/\w+-USD/)) {
				return `${pre}/crypto/${symbol}${query}`
			}
			const new_symbol = symbol.replace(/-USD$/, "")
			return `${pre}/crypto/${new_symbol}${query}`
		}
		default:
			return null
	}
}

export function getIconURLStock(symbol: string, iconSize: number): string {
	const pre = "https://assets.parqet.com/logos"
	const query = `?format=webp&size=${iconSize}`
	return `${pre}/symbol/${symbol}${query}`
}
