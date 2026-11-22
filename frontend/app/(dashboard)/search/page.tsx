import { cacheLife, cacheTag } from "next/cache"
import Link from "next/link"
import { Suspense } from "react"
import { ResultRow } from "@/components/search/result_row"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { fetchFacets, findAssets } from "@/database/find_assets"
import {
	PAGE_SIZE,
	parseSearchParams,
	type SearchFilter,
	toQueryString,
} from "@/lib/search_params"
import { createPublicClient } from "@/utils/supabase/public"
import { SearchFilters } from "./filters"
import { ResultsSkeleton } from "./loading"

export const metadata = { title: "Wertpapiersuche · FinanzQuest" }

/** Filter options change when the updater adds data: cached for hours. */
async function getFacets() {
	"use cache"
	cacheLife("hours")
	cacheTag("asset-facets")
	return fetchFacets(createPublicClient())
}

/** Public results, shared by everyone searching the same thing. */
async function getResults(query: string) {
	"use cache"
	cacheLife("minutes")
	cacheTag("asset-search")
	const filter = parseSearchParams(
		Object.fromEntries(new URLSearchParams(query))
	)
	return findAssets(
		createPublicClient(),
		filter,
		PAGE_SIZE,
		(filter.page - 1) * PAGE_SIZE
	)
}

export default async function Page(props: {
	searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
	const filter = parseSearchParams(await props.searchParams)
	const { facets } = await getFacets()
	const query = toQueryString(filter)
	return (
		<ScrollArea className="h-screen">
			<main className="w-full h-fit max-w-300 mx-auto md:px-12 px-4 py-6 flex flex-col gap-6">
				<h1 className="text-2xl font-bold tracking-tight">Wertpapiersuche</h1>
				<SearchFilters filter={filter} facets={facets} />
				<Suspense key={query} fallback={<ResultsSkeleton />}>
					<Results filter={filter} query={query} />
				</Suspense>
			</main>
		</ScrollArea>
	)
}

async function Results({
	filter,
	query,
}: {
	filter: SearchFilter
	query: string
}) {
	const { hits, total, error } = await getResults(query)
	if (error) {
		return (
			<p className="text-sm text-muted-foreground">
				Die Suche ist gerade nicht verfügbar ({error}).
			</p>
		)
	}
	if (hits.length === 0) {
		return (
			<p className="text-sm text-muted-foreground py-10 text-center">
				Keine Wertpapiere gefunden. Versuche einen anderen Suchbegriff oder
				entferne Filter.
			</p>
		)
	}
	const from = (filter.page - 1) * PAGE_SIZE + 1
	const to = from + hits.length - 1
	const pageHref = (page: number) => {
		const qs = toQueryString({ ...filter, page })
		return qs ? `/search?${qs}` : "/search"
	}
	return (
		<section className="flex flex-col gap-3" aria-label="Suchergebnisse">
			<p className="text-sm text-muted-foreground tabular-nums">
				{from}–{to} von {total} Wertpapieren
			</p>
			<ul className="flex flex-col rounded-2xl border divide-y divide-border/60 overflow-hidden">
				{hits.map(hit => (
					<li key={hit.id}>
						<ResultRow hit={hit} />
					</li>
				))}
			</ul>
			{total > PAGE_SIZE && (
				<nav
					className="flex flex-row justify-between items-center"
					aria-label="Seiten"
				>
					<Button
						variant="outline"
						size="sm"
						disabled={filter.page <= 1}
						render={
							filter.page > 1 ? (
								<Link href={pageHref(filter.page - 1)} />
							) : undefined
						}
					>
						Zurück
					</Button>
					<span className="text-sm text-muted-foreground tabular-nums">
						Seite {filter.page} von {Math.ceil(total / PAGE_SIZE)}
					</span>
					<Button
						variant="outline"
						size="sm"
						disabled={to >= total}
						render={
							to < total ? <Link href={pageHref(filter.page + 1)} /> : undefined
						}
					>
						Weiter
					</Button>
				</nav>
			)}
		</section>
	)
}
