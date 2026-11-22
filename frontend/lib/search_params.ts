import type { AssetType } from "@/database/custom_types"

// The search page's filters and sort order, kept in the URL so a search can
// be shared, bookmarked and navigated back to.

export const SORTS = {
	relevance: "Relevanz",
	name: "Name",
	return_3m: "Rendite 3 Monate",
	return_1y: "Rendite 1 Jahr",
	cagr_5y: "Ø Rendite p. a. (5 J.)",
	market_cap: "Börsenwert",
	fund_size: "Fondsgröße",
	ter: "Kosten (TER)",
	dividend_yield: "Dividendenrendite",
} as const
export type Sort = keyof typeof SORTS

export const ASSET_TYPES: { value: AssetType; label: string }[] = [
	{ value: "stock", label: "Aktien" },
	{ value: "fund", label: "ETFs" },
	{ value: "crypto", label: "Krypto" },
]

export interface SearchFilter {
	q: string
	types: AssetType[]
	sectors: string[]
	countries: string[]
	issuers: string[]
	indexes: string[]
	distribution: "accumulating" | "distributing" | null
	sort: Sort
	/** null: the sort's natural direction */
	descending: boolean | null
	page: number
}

export const PAGE_SIZE = 25

type RawParams = Record<string, string | string[] | undefined>

const list = (v: string | string[] | undefined) =>
	(Array.isArray(v) ? v.join(",") : (v ?? ""))
		.split(",")
		.map(s => s.trim())
		.filter(Boolean)
const one = (v: string | string[] | undefined) =>
	(Array.isArray(v) ? v[0] : v)?.trim() ?? ""

export function parseSearchParams(params: RawParams): SearchFilter {
	const sort = one(params.sort)
	const dir = one(params.dir)
	const dist = one(params.dist)
	const page = Number.parseInt(one(params.page), 10)
	const types = list(params.type).filter((t): t is AssetType =>
		["stock", "fund", "crypto", "commodity"].includes(t)
	)
	return {
		q: one(params.q).slice(0, 100),
		types,
		sectors: list(params.sector),
		countries: list(params.country),
		issuers: list(params.issuer),
		indexes: list(params.index),
		distribution:
			dist === "accumulating" || dist === "distributing" ? dist : null,
		sort: sort in SORTS ? (sort as Sort) : "relevance",
		descending: dir === "asc" ? false : dir === "desc" ? true : null,
		page: Number.isInteger(page) && page > 1 ? page : 1,
	}
}

/** Query string of a filter; defaults are left out. */
export function toQueryString(f: SearchFilter): string {
	const p = new URLSearchParams()
	if (f.q) p.set("q", f.q)
	if (f.types.length) p.set("type", f.types.join(","))
	if (f.sectors.length) p.set("sector", f.sectors.join(","))
	if (f.countries.length) p.set("country", f.countries.join(","))
	if (f.issuers.length) p.set("issuer", f.issuers.join(","))
	if (f.indexes.length) p.set("index", f.indexes.join(","))
	if (f.distribution) p.set("dist", f.distribution)
	if (f.sort !== "relevance") p.set("sort", f.sort)
	if (f.descending !== null) p.set("dir", f.descending ? "desc" : "asc")
	if (f.page > 1) p.set("page", String(f.page))
	return p.toString()
}

/** Natural direction of a sort (name and TER ascending, the rest descending). */
export const isDescending = (f: SearchFilter) =>
	f.descending ?? !(f.sort === "name" || f.sort === "ter")
