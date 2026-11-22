import type { Client } from "@/database/custom_types"
import type { Database } from "@/database/types"
import type { SearchFilter } from "@/lib/search_params"

export type SearchHit =
	Database["api"]["Functions"]["find_assets"]["Returns"][number]
export type Facet =
	Database["api"]["Functions"]["asset_facets"]["Returns"][number]

/**
 * One page of api.find_assets. Works with the browser, server or anonymous
 * client (public data). Result-style: { hits, total, error }.
 */
export async function findAssets(
	client: Client,
	f: Partial<SearchFilter>,
	limit: number,
	offset = 0
): Promise<{ hits: SearchHit[]; total: number; error: string | null }> {
	const { data, error } = await client.schema("api").rpc("find_assets", {
		p_query: f.q || undefined,
		p_types: f.types?.length ? f.types : undefined,
		p_sectors: f.sectors?.length ? f.sectors : undefined,
		p_countries: f.countries?.length ? f.countries : undefined,
		p_issuers: f.issuers?.length ? f.issuers : undefined,
		p_indexes: f.indexes?.length ? f.indexes : undefined,
		p_distribution: f.distribution ?? undefined,
		p_sort: f.sort ?? "relevance",
		p_descending: f.descending ?? undefined,
		p_limit: limit,
		p_offset: offset,
	})
	if (error) return { hits: [], total: 0, error: error.message }
	const hits = data ?? []
	return { hits, total: Number(hits[0]?.total_count ?? 0), error: null }
}

/** Filter options with counts, grouped by facet. */
export async function fetchFacets(
	client: Client
): Promise<{ facets: Record<string, Facet[]>; error: string | null }> {
	const { data, error } = await client.schema("api").rpc("asset_facets")
	if (error) return { facets: {}, error: error.message }
	const facets: Record<string, Facet[]> = {}
	for (const row of data ?? []) {
		facets[row.facet] ??= []
		facets[row.facet].push(row)
	}
	return { facets, error: null }
}
