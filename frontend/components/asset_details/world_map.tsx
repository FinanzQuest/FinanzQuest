import "server-only"
import { geoEqualEarth, geoPath } from "d3-geo"
import type { Feature, Geometry } from "geojson"
import { feature } from "topojson-client"
import type { GeometryCollection, Topology } from "topojson-specification"
import world from "world-atlas/countries-110m.json"
import { isoNumeric } from "@/lib/iso_numeric"
import { cn } from "@/lib/utils"
import { countryName, fmtPercent } from "./format"

// Rendered on the server: the page gets plain SVG paths, no map code or
// shapes are sent to the browser. 1:110m shapes (Natural Earth via
// world-atlas): very small countries (e.g. Singapore, Hong Kong) are not
// drawn — the country list next to the map has them.

const HIGHLIGHT =
	"opacity:1;stroke:var(--foreground);background-color:color-mix(in oklab,var(--muted) 60%,transparent)"
const WIDTH = 960
const HEIGHT = 440

const topology = world as unknown as Topology<{
	countries: GeometryCollection<{ name: string }>
}>
const shapes = (
	feature(topology, topology.objects.countries).features as Feature<
		Geometry,
		{ name: string }
	>[]
)
	// Antarctica holds no listed companies and takes a lot of room
	.filter(f => f.id !== "010")

const projection = geoEqualEarth().fitExtent(
	[
		[4, 4],
		[WIDTH - 4, HEIGHT - 4],
	],
	{ type: "FeatureCollection", features: shapes }
)
const path = geoPath(projection).digits(1)
// computed once per server process, shared by every map
const PATHS = shapes
	.map(f => ({ id: String(f.id ?? ""), d: path(f) ?? "" }))
	.filter(p => p.id && p.d)

export function WorldMap({
	weights,
	className,
}: {
	/** ISO alpha-2 -> fraction of the fund */
	weights: { country: string; weight: number }[]
	className?: string
}) {
	const byNumeric = new Map<string, { code: string; weight: number }>()
	for (const { country, weight } of weights) {
		const numeric = isoNumeric.get(country)
		if (numeric) byNumeric.set(numeric, { code: country, weight })
	}
	const max = Math.max(
		...weights.filter(w => w.country !== "ZZ").map(w => w.weight),
		0
	)
	// square root: one dominant country (USA at 70 %) must not wash out the rest
	const opacity = (w: number) =>
		max > 0 ? 0.25 + 0.75 * Math.sqrt(w / max) : 0

	// hover linking with the country list (ShareBars `linkCountries`): one
	// rule pair per held country, pure CSS via :has() on .fq-country-scope
	const linkCss = weights
		.map(w => w.country)
		.filter(c => /^[A-Z]{2}$/.test(c))
		.map(
			c =>
				`.fq-country-scope:has(li[data-country="${c}"]:hover) path[data-country="${c}"],.fq-country-scope:has(path[data-country="${c}"]:hover) li[data-country="${c}"]{${HIGHLIGHT}}`
		)
		.join("")

	return (
		<figure className={cn("flex flex-col gap-3", className)}>
			<style>{linkCss}</style>
			<svg
				viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
				role="img"
				aria-label="Weltkarte der Länderanteile"
				className="w-full h-auto"
			>
				{/* base layer: every country in the muted colour */}
				<g className="fq-map-in fill-muted stroke-background [stroke-width:0.5]">
					{PATHS.map(({ id, d }) => (
						<path key={id} d={d} />
					))}
				</g>
				{/* held countries on top, shaded by their share */}
				<g className="fq-map-in fill-primary stroke-background [stroke-width:0.5]">
					{PATHS.map(({ id, d }) => {
						const held = byNumeric.get(id)
						if (!held) return null
						return (
							<path
								key={id}
								d={d}
								fillOpacity={opacity(held.weight)}
								data-country={held.code}
								className="transition-opacity duration-150 ease-out hover:opacity-70"
							>
								<title>
									{`${countryName(held.code)}: ${fmtPercent(held.weight)}`}
								</title>
							</path>
						)
					})}
				</g>
			</svg>
			<figcaption className="flex flex-row flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
				<span>{fmtPercent(0)}</span>
				<span
					aria-hidden
					className="h-2 w-32 rounded-full bg-linear-to-r from-primary/25 to-primary"
				/>
				<span>{fmtPercent(max)}</span>
				<span className="ml-auto">Kleine Länder stehen nur in der Liste.</span>
			</figcaption>
		</figure>
	)
}
