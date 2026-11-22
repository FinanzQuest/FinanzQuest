// Display helpers for the asset details (German labels, number formats).

const percent = new Intl.NumberFormat("de-DE", {
	style: "percent",
	minimumFractionDigits: 1,
	maximumFractionDigits: 1,
})
const percentPrecise = new Intl.NumberFormat("de-DE", {
	style: "percent",
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
})
const signedPercent = new Intl.NumberFormat("de-DE", {
	style: "percent",
	minimumFractionDigits: 1,
	maximumFractionDigits: 1,
	signDisplay: "exceptZero",
})
const decimal = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 })
const decimal2 = new Intl.NumberFormat("de-DE", {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
})
const integer = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 })
const date = new Intl.DateTimeFormat("de-DE", {
	day: "numeric",
	month: "long",
	year: "numeric",
	timeZone: "UTC",
})
const regionNames = new Intl.DisplayNames("de", { type: "region" })

type Num = number | null | undefined
const ok = (v: Num): v is number => v != null && Number.isFinite(v)

/** 0.071 -> "7,1 %" */
export const fmtPercent = (v: Num) => (ok(v) ? percent.format(v) : null)
/** TER: 0.0007 -> "0,07 %" */
export const fmtPercentPrecise = (v: Num) =>
	ok(v) ? percentPrecise.format(v) : null
/** 0.071 -> "+7,1 %" */
export const fmtSignedPercent = (v: Num) =>
	ok(v) ? signedPercent.format(v) : null
export const fmtDecimal = (v: Num) => (ok(v) ? decimal.format(v) : null)
export const fmtDecimal2 = (v: Num) => (ok(v) ? decimal2.format(v) : null)
export const fmtInteger = (v: Num) => (ok(v) ? integer.format(v) : null)

/** "2009-09-25" -> "25. September 2009" */
export function fmtDate(iso: string | null | undefined) {
	if (!iso) return null
	const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`)
	return Number.isNaN(d.getTime()) ? null : date.format(d)
}

/** "US" -> "Vereinigte Staaten"; "ZZ" -> "Sonstige" */
export function countryName(code: string | null | undefined) {
	if (!code) return null
	if (code === "ZZ") return "Sonstige"
	try {
		return regionNames.of(code) ?? code
	} catch {
		return code
	}
}

/** Sector names of iShares (GICS), Vanguard (ICB) and Yahoo in German. */
const SECTORS: Record<string, string> = {
	"information technology": "IT",
	technology: "Technologie",
	financials: "Finanzen",
	"financial services": "Finanzen",
	"health care": "Gesundheit",
	healthcare: "Gesundheit",
	"consumer discretionary": "Zyklischer Konsum",
	"consumer cyclical": "Zyklischer Konsum",
	"consumer staples": "Basiskonsum",
	"consumer defensive": "Basiskonsum",
	industrials: "Industrie",
	"communication services": "Kommunikation",
	communication: "Kommunikation",
	telecommunications: "Telekommunikation",
	energy: "Energie",
	materials: "Rohstoffe",
	"basic materials": "Rohstoffe",
	utilities: "Versorger",
	"real estate": "Immobilien",
	treasury: "Staatsanleihen",
	"cash and/or derivatives": "Cash / Derivate",
}

export function sectorName(sector: string | null | undefined) {
	if (!sector) return null
	return SECTORS[sector.trim().toLowerCase()] ?? sector
}

export const REPLICATION: Record<string, string> = {
	full: "Physisch (vollständig)",
	sampling: "Physisch (optimiert)",
	physical: "Physisch",
	synthetic: "Synthetisch",
}

export const DISTRIBUTION: Record<string, string> = {
	accumulating: "Thesaurierend",
	distributing: "Ausschüttend",
}

export const PROVIDER_SOURCE: Record<string, string> = {
	ishares: "iShares (Bestandsliste)",
	vanguard: "Vanguard",
	yahoo: "Yahoo Finance",
}

/** Short words that are words, not abbreviations, in holdings names. */
const SHORT_WORDS = new Set([
	"inc",
	"co",
	"ltd",
	"plc",
	"of",
	"the",
	"and",
	"oil",
	"gas",
	"air",
	"new",
	"bio",
	"net",
	"one",
	"day",
	"cap",
	"ord",
	"pro",
])

/**
 * Holdings files write names in capitals ("AMAZON.COM INC"): shown as
 * "Amazon.com Inc". Short tokens stay capitals (abbreviations: "SAP",
 * "LVMH", "NV"), as does a name of a single word. Names with lower case
 * letters are left as they are.
 */
export function holdingName(name: string) {
	if (name !== name.toUpperCase()) return name
	const words = name.split(/(\s+)/)
	if (words.length === 1) return name
	return words
		.map(word => {
			const letters = word.replace(/[^\p{L}]/gu, "")
			if (letters.length <= 3 && !SHORT_WORDS.has(letters.toLowerCase()))
				return word
			return word
				.toLowerCase()
				.replace(
					/(^|[-/(&])(\p{L})/gu,
					(_, sep: string, ch: string) => sep + ch.toUpperCase()
				)
		})
		.join("")
}
