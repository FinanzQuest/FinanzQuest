import { ArrowRight, Check } from "lucide-react"
import { useEffect, useState } from "react"
import { fmtSignedPercent } from "@/components/asset_details/format"
import URLIcon from "@/components/icon"
import { Sparkline } from "@/components/search/sparkline"
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { Asset, AssetType } from "@/database/custom_types"
import { findAssets, type SearchHit } from "@/database/find_assets"
import { getIconURL } from "@/lib/icon_url"
import { ASSET_TYPES } from "@/lib/search_params"
import { asset_type_display } from "@/lib/util"
import { cn } from "@/lib/utils"
import { createClient } from "@/utils/supabase/client"

type StockPickerProps = {
	value?: number
	onSelect: (assetId: number, asset: Asset) => void
	searchQuery: string
	onSearchChange: (query: string) => void
	/** shows "Alle Ergebnisse" (the search page) with the current query/types */
	onShowAll?: (query: string, types: AssetType[]) => void
}

const assetTypeStyles = {
	stock: "bg-stock/30 border-stock/60 text-stock",
	crypto: "bg-crypto/30 border-crypto/60 text-crypto",
	fund: "bg-fund/30 border-fund/60 text-fund",
	bond: "bg-bond/30 border-bond/60 text-bond",
	commodity: "bg-commodity/30 border-commodity/60 text-commodity",
}

const toAsset = (hit: SearchHit): Asset => ({
	id: hit.id,
	symbol: hit.symbol,
	name: hit.name,
	description: hit.description,
	asset_type: hit.asset_type,
	last_updated: null,
})

export default function StockPicker({
	value,
	onSelect,
	searchQuery,
	onSearchChange,
	onShowAll,
}: StockPickerProps) {
	const [hits, setHits] = useState<SearchHit[]>([])
	const [types, setTypes] = useState<AssetType[]>([])

	useEffect(() => {
		if (!searchQuery) return
		// debounce keystrokes; drop responses for an outdated query (a slow
		// earlier response must not overwrite the current results)
		let stale = false
		const timer = setTimeout(async () => {
			const { hits, error } = await findAssets(
				createClient(),
				{ q: searchQuery, types },
				8
			)
			if (stale) return
			if (error) {
				console.error("Search failed", error)
				return
			}
			setHits(hits)
		}, 200)
		return () => {
			stale = true
			clearTimeout(timer)
		}
	}, [searchQuery, types])

	// an empty query shows nothing (derived, no state update needed)
	const visible = searchQuery ? hits : []

	return (
		<Command shouldFilter={false} className="border-none">
			<CommandInput
				value={searchQuery}
				placeholder="Suche nach Symbol, Name, Beschreibung"
				onValueChange={onSearchChange}
			/>
			<div className="px-2 pt-2">
				<ToggleGroup
					multiple
					size="sm"
					variant="outline"
					value={types}
					onValueChange={(v: string[]) => setTypes(v as AssetType[])}
					aria-label="Anlageklasse"
				>
					{ASSET_TYPES.map(t => (
						<ToggleGroupItem key={t.value} value={t.value}>
							{t.label}
						</ToggleGroupItem>
					))}
				</ToggleGroup>
			</div>
			<CommandList>
				<CommandEmpty>
					{searchQuery
						? "Keine Wertpapiere gefunden."
						: "Starte deine Suche..."}
				</CommandEmpty>
				<CommandGroup>
					{visible.map(hit => {
						const iconUrl = getIconURL(hit.symbol, hit.asset_type, 32)
						return (
							<CommandItem
								className="!rounded-lg w-full flex gap-3 flex-row !py-2 !px-3"
								key={hit.id}
								value={hit.id.toString()}
								onSelect={() => onSelect(hit.id, toAsset(hit))}
							>
								<URLIcon
									iconURL={iconUrl}
									size={32}
									fallback={hit.symbol}
									className="rounded size-[1.7lh] shrink-0"
								/>
								<div className="flex flex-col min-w-0 grow">
									<span className="font-medium truncate">{hit.name}</span>
									<span className="text-sm text-muted-foreground">
										{hit.symbol}
									</span>
								</div>
								<Sparkline
									values={hit.sparkline}
									className="hidden sm:block w-16 h-6 shrink-0"
								/>
								<span
									className={cn(
										"hidden sm:block w-14 text-right text-xs tabular-nums shrink-0",
										hit.return_3m == null
											? "text-muted-foreground"
											: hit.return_3m >= 0
												? "text-win"
												: "text-loss"
									)}
									title="Rendite 3 Monate"
								>
									{fmtSignedPercent(hit.return_3m) ?? ""}
								</span>
								<Check
									className={cn(
										"h-4 w-4 shrink-0",
										value === hit.id ? "opacity-100" : "opacity-0"
									)}
								/>
								<div
									className={cn(
										"text-sm py-1 px-2 rounded-full border shrink-0",
										assetTypeStyles[hit.asset_type]
									)}
								>
									{asset_type_display(hit.asset_type) ?? hit.asset_type}
								</div>
							</CommandItem>
						)
					})}
				</CommandGroup>
				{onShowAll && (
					<>
						<CommandSeparator />
						<CommandGroup>
							<CommandItem
								value="__all__"
								className="!rounded-lg !py-2 !px-3 gap-2"
								onSelect={() => onShowAll(searchQuery, types)}
							>
								<ArrowRight className="size-4" />
								{searchQuery
									? `Alle Ergebnisse für „${searchQuery}“ mit Filtern & Sortierung`
									: "Erweiterte Suche mit Filtern & Sortierung"}
							</CommandItem>
						</CommandGroup>
					</>
				)}
			</CommandList>
		</Command>
	)
}
