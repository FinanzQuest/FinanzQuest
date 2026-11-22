import { cacheLife, cacheTag } from "next/cache"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
	type AssetDetails as Details,
	fetchAssetDetails,
	type Performance,
} from "@/database/fetch_asset_details"
import { compactMoneyString, currencyFormat } from "@/lib/cash_display_string"
import { getStockPagePath } from "@/lib/get_stock_path"
import { type Fact, FactGrid, toneOf } from "./facts"
import {
	countryName,
	DISTRIBUTION,
	fmtDate,
	fmtDecimal,
	fmtDecimal2,
	fmtInteger,
	fmtPercent,
	fmtPercentPrecise,
	fmtSignedPercent,
	holdingName,
	PROVIDER_SOURCE,
	REPLICATION,
	sectorName,
} from "./format"
import { type Share, ShareBars } from "./share_bars"
import { WorldMap } from "./world_map"

/**
 * Public and slow-changing (the updater refreshes it daily): cached per asset
 * for all users. Tagged like the prices, so a revalidation of the asset
 * refreshes both.
 */
async function getDetails(id: number) {
	"use cache"
	cacheLife("hours")
	cacheTag(`asset-${id}`)
	try {
		return { details: await fetchAssetDetails(id), error: null }
	} catch (e) {
		return { details: null, error: e instanceof Error ? e.message : String(e) }
	}
}

const SHOWN = 10

/** Facts, figures and charts below the price chart of the asset page. */
export async function AssetDetails({ id }: { id: number }) {
	const { details, error } = await getDetails(id)
	if (error || !details) {
		return (
			<p className="text-sm text-muted-foreground">
				Weitere Informationen konnten nicht geladen werden.
			</p>
		)
	}
	return details.kind === "fund" ? (
		<FundDetails details={details} />
	) : (
		<StockDetails details={details} />
	)
}

function performanceFacts(p: Performance | null): Fact[] {
	if (!p) return []
	return [
		{
			label: "Ø Rendite p. a. (5 J.)",
			value: fmtSignedPercent(p.cagr_5y),
			tone: toneOf(p.cagr_5y),
			hint: "Durchschnittlicher Wertzuwachs pro Jahr über die letzten 5 Jahre (mit Zinseszins), berechnet aus den Kursen.",
		},
		{
			label: "Ø Rendite p. a. (3 J.)",
			value: fmtSignedPercent(p.cagr_3y),
			tone: toneOf(p.cagr_3y),
			hint: "Durchschnittlicher Wertzuwachs pro Jahr über die letzten 3 Jahre.",
		},
		{
			label: "Rendite 1 Jahr",
			value: fmtSignedPercent(p.return_1y),
			tone: toneOf(p.return_1y),
			hint: "Kursveränderung in den letzten 12 Monaten.",
		},
		{
			label: "Volatilität (1 J.)",
			value: fmtPercent(p.volatility_1y),
			hint: "Wie stark der Kurs schwankt, aufs Jahr gerechnet. Höher heißt riskanter.",
		},
		{
			label: "Max. Verlust (5 J.)",
			value: fmtPercent(p.max_drawdown_5y),
			tone: toneOf(p.max_drawdown_5y),
			hint: "Größter Rückgang von einem Höchststand bis zum Tiefpunkt in den letzten 5 Jahren.",
		},
		{
			label: "52-Wochen-Spanne",
			value:
				p.low_52w != null && p.high_52w != null
					? `${currencyFormat.format(p.low_52w)} – ${currencyFormat.format(p.high_52w)}`
					: null,
			hint: "Niedrigster und höchster Kurs im letzten Jahr.",
		},
	]
}

function Section({
	title,
	children,
	footer,
}: {
	title: string
	children: React.ReactNode
	footer?: React.ReactNode
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-6">
				{children}
				{footer && <p className="text-xs text-muted-foreground">{footer}</p>}
			</CardContent>
		</Card>
	)
}

function FundDetails({
	details: { fund, holdings, countries, performance, provider },
}: {
	details: Extract<Details, { kind: "fund" }>
}) {
	const facts: Fact[] = [
		{
			label: "Kosten (TER)",
			value: fmtPercentPrecise(fund.ter),
			hint: "Laufende Kosten pro Jahr in Prozent des angelegten Geldes. Sie werden automatisch vom Fondsvermögen abgezogen.",
		},
		{
			label: "Fondsgröße",
			value: compactMoneyString(fund.fund_size, fund.currency),
			hint: "Wie viel Geld insgesamt im Fonds steckt. Große Fonds sind meist günstig und werden selten geschlossen.",
		},
		{ label: "Anbieter", value: fund.issuer },
		{
			label: "Positionen",
			value: fmtInteger(fund.holdings_count),
			hint: "Anzahl der Wertpapiere im Fonds. Je mehr, desto breiter ist das Geld gestreut.",
		},
		{
			label: "Index",
			value: fund.index_name,
			hint: "Die Liste von Unternehmen, die der ETF nachbildet.",
		},
		{
			label: "Ertragsverwendung",
			value: fund.distribution ? DISTRIBUTION[fund.distribution] : null,
			hint:
				fund.distribution === "distributing"
					? "Dividenden werden regelmäßig ausgezahlt."
					: "Dividenden werden automatisch wieder angelegt.",
		},
		{
			label: "Replikation",
			value: fund.replication ? REPLICATION[fund.replication] : null,
			hint: "Physisch: der ETF kauft die Aktien wirklich (optimiert: eine repräsentative Auswahl). Synthetisch: er bildet den Index über Tauschgeschäfte nach.",
		},
		{ label: "Aufgelegt", value: fmtDate(fund.inception) },
		{
			label: "Fondsdomizil",
			value: countryName(fund.domicile),
			hint: "Land, in dem der Fonds rechtlich sitzt. Wichtig für die Steuern.",
		},
		{ label: "ISIN", value: fund.isin },
	]

	// view columns are typed nullable; name and weight are NOT NULL in the table
	const topHoldings: Share[] = holdings.slice(0, SHOWN).flatMap(h =>
		h.name == null || h.weight == null
			? []
			: [
					{
						key: String(h.position),
						label: holdingName(h.name),
						detail: sectorName(h.sector),
						weight: h.weight,
						// the stock's own page, when it is in the database
						href: h.asset_id != null ? getStockPagePath(h.asset_id) : null,
					},
				]
	)
	const named = countries.filter(c => c.country !== "ZZ")
	const shownCountries = named.slice(0, SHOWN)
	const rest = countries
		.filter(c => !shownCountries.includes(c))
		.reduce((sum, c) => sum + c.weight, 0)
	const countryShares: Share[] = [
		...shownCountries.map(c => ({
			key: c.country,
			label: countryName(c.country) ?? c.country,
			weight: c.weight,
		})),
		...(rest > 0.0005
			? [{ key: "rest", label: "Sonstige", weight: rest, muted: true }]
			: []),
	]

	const source = [
		provider ? `Quelle: ${PROVIDER_SOURCE[provider] ?? provider}` : null,
		fund.details_as_of ? `Stand ${fmtDate(fund.details_as_of)}` : null,
		"Renditen aus den Kursen dieses Börsenplatzes",
	]
		.filter(Boolean)
		.join(" · ")

	return (
		<div className="flex flex-col gap-6">
			<Section title="Über den ETF" footer={source}>
				<FactGrid facts={facts} />
				<FactGrid facts={performanceFacts(performance)} />
			</Section>
			{(topHoldings.length > 0 || countryShares.length > 0) && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{topHoldings.length > 0 && (
						<Section title="Größte Positionen">
							<ShareBars label="Größte Positionen" shares={topHoldings} />
						</Section>
					)}
					{countryShares.length > 0 && (
						<Section title="Länder">
							<ShareBars label="Länderanteile" shares={countryShares} />
						</Section>
					)}
				</div>
			)}
			{named.length > 1 && (
				<Section title="Weltkarte">
					<WorldMap weights={countries} />
				</Section>
			)}
		</div>
	)
}

function StockDetails({
	details: { details: d, performance },
}: {
	details: Extract<Details, { kind: "stock" }>
}) {
	const profile: Fact[] = d
		? [
				{ label: "Sektor", value: sectorName(d.sector) },
				{ label: "Branche", value: d.industry },
				{ label: "Land", value: countryName(d.country) },
				{
					label: "Mitarbeitende",
					value: fmtInteger(d.employees),
				},
				{
					label: "Website",
					value: d.website ? (
						<a
							href={d.website}
							target="_blank"
							rel="noopener noreferrer"
							className="underline underline-offset-2 text-base font-medium"
						>
							{d.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
						</a>
					) : null,
				},
			]
		: []
	const figures: Fact[] = d
		? [
				{
					label: "Börsenwert",
					value: compactMoneyString(d.market_cap, d.currency),
					hint: "Wert des ganzen Unternehmens an der Börse: Kurs × Anzahl der Aktien.",
				},
				{
					label: "KGV",
					value: fmtDecimal(d.pe_ratio),
					hint: "Kurs-Gewinn-Verhältnis: Aktienkurs geteilt durch den Gewinn je Aktie. Sagt, wie viele Jahresgewinne der Preis kostet.",
				},
				{
					label: "KBV",
					value: fmtDecimal(d.price_to_book),
					hint: "Kurs-Buchwert-Verhältnis: Preis im Vergleich zum Eigenkapital in der Bilanz.",
				},
				{
					label: "Dividendenrendite",
					value: fmtPercent(d.dividend_yield),
					hint: "Jährliche Dividende im Verhältnis zum Aktienkurs.",
				},
				{
					label: "Ausschüttungsquote",
					value: fmtPercent(d.payout_ratio),
					hint: "Anteil des Gewinns, der als Dividende ausgezahlt wird.",
				},
				{
					label: "Umsatz (12 Monate)",
					value: compactMoneyString(d.revenue, d.revenue_currency),
					hint: "Einnahmen aus dem Verkauf von Produkten und Dienstleistungen.",
				},
				{
					label: "Gewinnmarge",
					value: fmtPercent(d.profit_margin),
					tone: toneOf(d.profit_margin),
					hint: "Wie viel vom Umsatz als Gewinn übrig bleibt.",
				},
				{
					label: "Umsatzwachstum",
					value: fmtSignedPercent(d.revenue_growth),
					tone: toneOf(d.revenue_growth),
					hint: "Veränderung des Umsatzes gegenüber dem gleichen Quartal im Vorjahr.",
				},
				{
					label: "Beta",
					value: fmtDecimal2(d.beta),
					hint: "Wie stark die Aktie im Vergleich zum Gesamtmarkt schwankt. 1 heißt: so stark wie der Markt.",
				},
			]
		: []
	const perf = performanceFacts(performance)
	if (profile.length === 0 && perf.length === 0) return null

	const source = [
		d ? "Unternehmensdaten: Yahoo Finance" : null,
		d?.updated_at ? `Stand ${fmtDate(d.updated_at)}` : null,
		"Renditen aus den Kursen dieses Börsenplatzes",
	]
		.filter(Boolean)
		.join(" · ")

	return (
		<Section title="Über das Unternehmen" footer={source}>
			<FactGrid facts={profile} />
			<FactGrid facts={figures} />
			<FactGrid facts={perf} />
		</Section>
	)
}

export function AssetDetailsSkeleton() {
	return (
		<div className="flex flex-col gap-6">
			<Skeleton className="h-72 w-full" />
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<Skeleton className="h-96 w-full" />
				<Skeleton className="h-96 w-full" />
			</div>
		</div>
	)
}
