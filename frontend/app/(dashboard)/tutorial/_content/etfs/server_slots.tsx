import { WorldMap } from "@/components/asset_details/world_map"
import { fetchAssetDetails } from "@/database/fetch_asset_details"
import { createPublicClient } from "@/utils/supabase/public"
import type { ServerSlot } from "../server_slots"

// Well-known MSCI World ETFs by ticker prefix; falls back to a name search.
const SYMBOLS = ["EUNL", "IWDA", "SWDA", "XDWD", "VWCE"]

async function findFund(): Promise<{ id: number; name: string } | null> {
	const api = createPublicClient().schema("api")
	const bySymbol = await api
		.from("assets")
		.select("id, name")
		.not("fund_id", "is", null)
		.or(SYMBOLS.map(s => `symbol.ilike.${s}%`).join(","))
		.limit(1)
	if (bySymbol.data?.[0]) return bySymbol.data[0]
	const byName = await api
		.from("assets")
		.select("id, name")
		.not("fund_id", "is", null)
		.ilike("name", "%MSCI World%")
		.limit(1)
	return byName.data?.[0] ?? null
}

const worldMapSlot: ServerSlot = async () => {
	try {
		const asset = await findFund()
		if (!asset) throw new Error("no fund")
		const details = await fetchAssetDetails(asset.id)
		if (details.kind !== "fund" || details.countries.length === 0) {
			throw new Error("no countries")
		}
		return (
			<div className="fq-country-scope flex flex-col gap-2 rounded-2xl border bg-card p-3">
				<WorldMap weights={details.countries} />
				<p className="text-xs text-muted-foreground">
					Länderanteile von {asset.name}, Daten aus der FinanzQuest-Datenbank.
				</p>
			</div>
		)
	} catch {
		return (
			<p className="rounded-2xl border bg-card p-4 text-sm text-muted-foreground">
				Die Weltkarte ist gerade nicht verfügbar. Merke Dir: Die USA machen im
				MSCI World etwa 70 % aus (Stand: Anfang 2025).
			</p>
		)
	}
}

/** Merge into serverSlots (lessonId -> slotName -> renderer). */
export const etfsServerSlots: Record<string, Record<string, ServerSlot>> = {
	"etfs.laender-sektoren": { map: worldMapSlot },
}
