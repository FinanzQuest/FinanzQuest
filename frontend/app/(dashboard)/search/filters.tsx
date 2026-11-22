"use client"

import {
	ArrowDownWideNarrow,
	ArrowUpNarrowWide,
	ChevronDown,
	Search,
	X,
} from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { countryName, sectorName } from "@/components/asset_details/format"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { Facet } from "@/database/find_assets"
import {
	ASSET_TYPES,
	isDescending,
	type SearchFilter,
	SORTS,
	type Sort,
	toQueryString,
} from "@/lib/search_params"
import { cn } from "@/lib/utils"

type ListKey = "sectors" | "countries" | "issuers" | "indexes"

const LISTS: {
	key: ListKey
	facet: string
	label: string
	display: (v: string) => string
}[] = [
	{
		key: "sectors",
		facet: "sector",
		label: "Sektor",
		display: v => sectorName(v) ?? v,
	},
	{
		key: "countries",
		facet: "country",
		label: "Land",
		display: v => countryName(v) ?? v,
	},
	{ key: "issuers", facet: "issuer", label: "ETF-Anbieter", display: v => v },
	{ key: "indexes", facet: "index", label: "Index", display: v => v },
]

const DISTRIBUTION = {
	accumulating: "Thesaurierend",
	distributing: "Ausschüttend",
} as const

/** Search input, filters and sort order of the search page (in the URL). */
export function SearchFilters({
	filter,
	facets,
}: {
	filter: SearchFilter
	facets: Record<string, Facet[]>
}) {
	const router = useRouter()
	const pathname = usePathname()
	const [pending, startTransition] = useTransition()
	const [query, setQuery] = useState(filter.q)

	const apply = (next: Partial<SearchFilter>) => {
		// any change starts again on the first page
		const qs = toQueryString({ ...filter, page: 1, ...next })
		startTransition(() => {
			router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
		})
	}

	// typing: update the results 300 ms after the last keystroke
	// biome-ignore lint/correctness/useExhaustiveDependencies: only the text triggers
	useEffect(() => {
		if (query.trim() === filter.q) return
		const timer = setTimeout(() => apply({ q: query.trim() }), 300)
		return () => clearTimeout(timer)
	}, [query])

	const toggleInList = (key: ListKey, value: string, on: boolean) =>
		apply({
			[key]: on
				? [...filter[key], value]
				: filter[key].filter(v => v !== value),
		})

	const chips = [
		...LISTS.flatMap(l =>
			filter[l.key].map(v => ({
				id: `${l.key}:${v}`,
				label: l.display(v),
				remove: () => toggleInList(l.key, v, false),
			}))
		),
		...(filter.distribution
			? [
					{
						id: "dist",
						label: DISTRIBUTION[filter.distribution],
						remove: () => apply({ distribution: null }),
					},
				]
			: []),
	]
	const descending = isDescending(filter)

	return (
		<div
			className={cn(
				"flex flex-col gap-4 transition-opacity",
				pending && "opacity-70"
			)}
			aria-busy={pending}
		>
			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
				<Input
					type="search"
					value={query}
					onChange={e => setQuery(e.target.value)}
					onKeyDown={e => {
						if (e.key === "Enter") apply({ q: query.trim() })
					}}
					placeholder="Symbol, Name oder Beschreibung"
					aria-label="Suchbegriff"
					className="pl-9 h-11 rounded-full"
				/>
			</div>

			<div className="flex flex-row flex-wrap items-center gap-2">
				<ToggleGroup
					multiple
					value={filter.types}
					onValueChange={(types: string[]) =>
						apply({ types: types as SearchFilter["types"] })
					}
					variant="outline"
					aria-label="Anlageklasse"
				>
					{ASSET_TYPES.map(t => (
						<ToggleGroupItem key={t.value} value={t.value}>
							{t.label}
						</ToggleGroupItem>
					))}
				</ToggleGroup>

				{LISTS.map(l => {
					const options = facets[l.facet] ?? []
					if (options.length === 0) return null
					const selected = filter[l.key]
					return (
						<DropdownMenu key={l.key}>
							<DropdownMenuTrigger
								render={
									<Button
										variant={selected.length ? "secondary" : "outline"}
										size="sm"
										className="rounded-full gap-1"
									>
										{l.label}
										{selected.length > 0 && (
											<span className="tabular-nums">({selected.length})</span>
										)}
										<ChevronDown className="size-3.5" />
									</Button>
								}
							/>
							<DropdownMenuContent className="w-64 max-h-80">
								{options.map(o => (
									<DropdownMenuCheckboxItem
										key={o.value}
										checked={selected.includes(o.value)}
										onCheckedChange={on => toggleInList(l.key, o.value, on)}
									>
										<span className="truncate">{l.display(o.value)}</span>
										<span className="ml-auto text-xs text-muted-foreground tabular-nums">
											{o.assets}
										</span>
									</DropdownMenuCheckboxItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					)
				})}

				{(facets.distribution?.length ?? 0) > 0 && (
					<DropdownMenu>
						<DropdownMenuTrigger
							render={
								<Button
									variant={filter.distribution ? "secondary" : "outline"}
									size="sm"
									className="rounded-full gap-1"
								>
									Ertragsverwendung
									<ChevronDown className="size-3.5" />
								</Button>
							}
						/>
						<DropdownMenuContent className="w-56">
							<DropdownMenuRadioGroup
								value={filter.distribution ?? "all"}
								onValueChange={v =>
									apply({
										distribution:
											v === "all" ? null : (v as SearchFilter["distribution"]),
									})
								}
							>
								<DropdownMenuRadioItem value="all">Alle</DropdownMenuRadioItem>
								{Object.entries(DISTRIBUTION).map(([value, label]) => (
									<DropdownMenuRadioItem key={value} value={value}>
										{label}
									</DropdownMenuRadioItem>
								))}
							</DropdownMenuRadioGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				)}

				<div className="ml-auto flex flex-row items-center gap-1">
					<DropdownMenu>
						<DropdownMenuTrigger
							render={
								<Button
									variant="outline"
									size="sm"
									className="rounded-full gap-1"
								>
									<span className="text-muted-foreground">Sortieren:</span>
									{SORTS[filter.sort]}
									<ChevronDown className="size-3.5" />
								</Button>
							}
						/>
						<DropdownMenuContent align="end" className="w-60">
							<DropdownMenuRadioGroup
								value={filter.sort}
								onValueChange={v =>
									apply({ sort: v as Sort, descending: null })
								}
							>
								{Object.entries(SORTS).map(([value, label]) => (
									<DropdownMenuRadioItem key={value} value={value}>
										{label}
									</DropdownMenuRadioItem>
								))}
							</DropdownMenuRadioGroup>
						</DropdownMenuContent>
					</DropdownMenu>
					<Button
						variant="ghost"
						size="icon-sm"
						className="rounded-full"
						onClick={() => apply({ descending: !descending })}
						aria-label={
							descending ? "Absteigend sortiert" : "Aufsteigend sortiert"
						}
						title={descending ? "Absteigend" : "Aufsteigend"}
					>
						{descending ? (
							<ArrowDownWideNarrow className="size-4" />
						) : (
							<ArrowUpNarrowWide className="size-4" />
						)}
					</Button>
				</div>
			</div>

			{chips.length > 0 && (
				<div className="flex flex-row flex-wrap items-center gap-2">
					{chips.map(c => (
						<Button
							key={c.id}
							variant="secondary"
							size="xs"
							className="rounded-full gap-1"
							onClick={c.remove}
							aria-label={`Filter ${c.label} entfernen`}
						>
							{c.label}
							<X className="size-3" />
						</Button>
					))}
					<Button
						variant="link"
						size="xs"
						onClick={() =>
							apply({
								sectors: [],
								countries: [],
								issuers: [],
								indexes: [],
								distribution: null,
								types: [],
							})
						}
					>
						Alle Filter entfernen
					</Button>
				</div>
			)}
		</div>
	)
}
