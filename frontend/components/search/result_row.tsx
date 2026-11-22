import Link from "next/link"
import {
	countryName,
	fmtPercentPrecise,
	fmtSignedPercent,
	sectorName,
} from "@/components/asset_details/format"
import URLIcon from "@/components/icon"
import { Badge } from "@/components/ui/badge"
import type { SearchHit } from "@/database/find_assets"
import { compactMoneyString, currencyFormat } from "@/lib/cash_display_string"
import { getStockPagePath } from "@/lib/get_stock_path"
import { getIconURL } from "@/lib/icon_url"
import { asset_type_display } from "@/lib/util"
import { cn } from "@/lib/utils"
import { Sparkline } from "./sparkline"

function Change({ value, label }: { value: number | null; label: string }) {
	const text = fmtSignedPercent(value)
	return (
		<div className="flex flex-col items-end">
			<span
				className={cn(
					"tabular-nums font-medium",
					value == null
						? "text-muted-foreground"
						: value >= 0
							? "text-win"
							: "text-loss"
				)}
			>
				{text ?? "–"}
			</span>
			<span className="text-xs text-muted-foreground">{label}</span>
		</div>
	)
}

/** The figure that matters most for the asset type. */
function keyFigure(hit: SearchHit): { label: string; value: string } | null {
	if (hit.asset_type === "fund") {
		const ter = fmtPercentPrecise(hit.ter)
		return ter ? { label: "TER", value: ter } : null
	}
	const cap = compactMoneyString(hit.market_cap, hit.currency)
	return cap ? { label: "Börsenwert", value: cap } : null
}

/** One search result: identity, context, sparkline (3 months), returns. */
export function ResultRow({ hit }: { hit: SearchHit }) {
	const icon = getIconURL(hit.symbol, hit.asset_type, 64)
	const context = [
		hit.asset_type === "fund" ? hit.issuer : sectorName(hit.sector),
		hit.asset_type === "fund" ? hit.index_name : countryName(hit.country),
	].filter(Boolean)
	const figure = keyFigure(hit)
	return (
		<Link
			href={getStockPagePath(hit.id)}
			className="grid grid-cols-[auto_1fr_auto_auto] md:grid-cols-[auto_1fr_6rem_6rem_5rem_5rem_6rem] items-center gap-x-4 gap-y-1 px-4 py-3 hover:bg-muted/50 focus-visible:bg-muted/50 outline-none transition-colors"
		>
			<URLIcon
				iconURL={icon}
				size={64}
				fallback={hit.symbol}
				className="size-10 rounded-lg bg-muted object-contain"
			/>
			<div className="flex flex-col min-w-0">
				<div className="flex flex-row items-center gap-2 min-w-0">
					<span className="font-semibold truncate">{hit.name}</span>
					<Badge variant="outline" className="shrink-0 hidden sm:inline-flex">
						{asset_type_display(hit.asset_type) ?? hit.asset_type}
					</Badge>
				</div>
				<span className="text-sm text-muted-foreground truncate">
					{hit.symbol}
					{context.length > 0 && ` · ${context.join(" · ")}`}
				</span>
			</div>
			<Sparkline
				values={hit.sparkline}
				label={`Kursverlauf 3 Monate: ${fmtSignedPercent(hit.return_3m) ?? "unbekannt"}`}
				className="w-12 md:w-24 justify-self-end"
			/>
			<span className="text-right tabular-nums font-semibold">
				{hit.last_close != null ? currencyFormat.format(hit.last_close) : "–"}
			</span>
			<div className="hidden md:block">
				<Change value={hit.return_3m} label="3 Monate" />
			</div>
			<div className="hidden md:block">
				<Change value={hit.return_1y} label="1 Jahr" />
			</div>
			<div className="hidden md:flex flex-col items-end">
				<span className="tabular-nums font-medium">{figure?.value ?? "–"}</span>
				<span className="text-xs text-muted-foreground">
					{figure?.label ?? ""}
				</span>
			</div>
		</Link>
	)
}
