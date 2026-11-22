export const toISODateOnly = (date: Date) => date.toISOString().slice(0, 10)
export const msPerDay = 1000 * 3600 * 24
export const getCurrentDate = () => new Date()

export const numberFormat = Intl.NumberFormat("de-DE", {
	minimumFractionDigits: 0,
	maximumFractionDigits: 2,
})

export const dateFormat = Intl.DateTimeFormat("de-DE", {
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
	hour: "2-digit",
	minute: "2-digit",
})

export const formatDate = (date: Date) => {
	return dateFormat.format(date)
}

export const formatDateString = (dateString: string) => {
	const date = new Date(dateString)
	return formatDate(date)
}

export function parseDate(dateString?: string | null): Date | null {
	if (!dateString) return null
	try {
		return new Date(dateString)
	} catch {
		return null
	}
}

export const getDateCertainDaysAgo = (days: number) => {
	const date = new Date()
	date.setUTCHours(0, 0, 0, 0)
	date.setUTCDate(date.getUTCDate() - days)
	return date
}

export const getDateOneWeekAgo = () => getDateCertainDaysAgo(7)

export const getTimeBetweenDates = (
	startDate?: Date | null,
	endDate?: Date | null
) => {
	if (!startDate || !endDate) return null

	const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
	return Math.round(diffTime / msPerDay)
}

export function toAbsoluteTimeString(date: Date, timeZone?: string) {
	return date.toLocaleDateString("de", { timeZone })
}

export function relativeDateString(
	date: Date,
	absolute: "necessary" | "never" = "necessary"
): string {
	const diff = getTimeBetweenDates(new Date(), date) as number

	if (diff <= 1) {
		return "heute"
	}

	if (diff === 2) {
		return "gestern"
	}

	if (diff < 7) {
		const days = [
			"Sonntag",
			"Montag",
			"Dienstag",
			"Mittwoch",
			"Donnerstag",
			"Freitag",
			"Samstag",
		]
		return days[date.getDay()]
	}

	if (absolute === "necessary" && diff > 30) {
		return date.toLocaleDateString("de")
	}

	return `vor ${diff - 1} Tagen`
}

const monthYearFormat = Intl.DateTimeFormat("de-DE", {
	month: "short",
	year: "2-digit",
	timeZone: "Europe/Berlin",
})

/**
 * Short chart-axis label: "Heute", "Gestern", the weekday within a week,
 * "20.11." within about a year, "Nov. 25" before that. With
 * absolute = "never", older dates stay "20.11." as well.
 */
export function relativeDateStringCompact(
	date: Date,
	absolute: "necessary" | "never" = "necessary"
): string {
	const diff = getTimeBetweenDates(new Date(), date) as number

	if (diff <= 1) {
		return "Heute"
	}

	if (diff === 2) {
		return "Gestern"
	}

	if (diff < 7) {
		const days = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]
		return days[date.getDay()]
	}

	if (absolute === "necessary" && diff > 330) {
		return monthYearFormat.format(date)
	}

	return Intl.DateTimeFormat("de-DE", {
		day: "2-digit",
		month: "2-digit",
		timeZone: "Europe/Berlin",
	}).format(date)
}

const asset_type_displays = new Map(
	Object.entries({
		commodity: "Ware",
		crypto: "Krypto",
		fund: "ETF",
		stock: "Aktie",
	})
)

export function asset_type_display(asset_type: string): string | null {
	return asset_type_displays.get(asset_type) ?? null
}

const asset_type_colors = new Map(
	Object.entries({
		commodity: "var(--color-commodity)",
		crypto: "var(--color-crypto)",
		fund: "var(--color-fund)",
		stock: "var(--color-stock)",
	})
)

export function asset_type_color(asset_type: string): string | null {
	return asset_type_colors.get(asset_type) ?? null
}

// Intraday times are shown in German market time on server and client alike,
// so a server-rendered "Stand" matches the client-rendered chart.
const marketTimeZone = "Europe/Berlin"

const timeFormat = Intl.DateTimeFormat("de-DE", {
	hour: "2-digit",
	minute: "2-digit",
	timeZone: marketTimeZone,
})

const weekdayTimeFormat = Intl.DateTimeFormat("de-DE", {
	weekday: "short",
	hour: "2-digit",
	minute: "2-digit",
	timeZone: marketTimeZone,
})

const dayMonthFormat = Intl.DateTimeFormat("de-DE", {
	day: "2-digit",
	month: "2-digit",
	timeZone: marketTimeZone,
})

const marketDateFormat = Intl.DateTimeFormat("de-DE", {
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
	timeZone: marketTimeZone,
})

/** "HH:MM" in market time. */
export const toTimeString = (date: Date) => timeFormat.format(date)

/** "Mo., HH:MM" in market time — for multi-day intraday axes. */
export const toWeekdayTimeString = (date: Date) =>
	weekdayTimeFormat.format(date)

/** "DD.MM.YYYY, HH:MM" in market time. */
export const toDateTimeString = (date: Date) =>
	`${marketDateFormat.format(date)}, ${timeFormat.format(date)}`

/**
 * Display string for the time a price is valid as of: "HH:MM" if it is from
 * today, otherwise the date. A daily close is valid as of midnight UTC after
 * its day (see api.daily_price_as_of), so that case shows the close's day.
 */
export function quoteTimeString(date: Date): string {
	const isDailyClose =
		date.getUTCHours() === 0 &&
		date.getUTCMinutes() === 0 &&
		date.getUTCSeconds() === 0 &&
		date.getUTCMilliseconds() === 0
	if (isDailyClose) {
		return toAbsoluteTimeString(new Date(date.getTime() - msPerDay), "UTC")
	}
	if (marketDateFormat.format(date) === marketDateFormat.format(new Date())) {
		return toTimeString(date)
	}
	return toDateTimeString(date)
}

/**
 * How a chart's time axis labels its ticks: "date" (daily data), "time"
 * (one trading day), "weekdayTime" (a few days of intraday bars), "dateTime"
 * (weeks of intraday bars: date ticks, date + time in the tooltip).
 */
export type TimeAxis = "date" | "time" | "weekdayTime" | "dateTime"

export function timeAxisTick(timestamp: string, axis: TimeAxis = "date") {
	const date = new Date(timestamp)
	if (axis === "time") return toTimeString(date)
	if (axis === "weekdayTime") return toWeekdayTimeString(date)
	if (axis === "dateTime") return dayMonthFormat.format(date)
	return relativeDateStringCompact(date)
}

/** Start (00:00 UTC) of the trading day `days` weekdays back, today = 1. */
export function startOfTradingDaysAgo(days: number, now = new Date()): Date {
	const date = new Date(
		Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
	)
	let remaining = days
	for (;;) {
		const weekday = date.getUTCDay()
		if (weekday !== 0 && weekday !== 6 && --remaining <= 0) return date
		date.setUTCDate(date.getUTCDate() - 1)
	}
}

export function timeAxisLabel(timestamp: string, axis: TimeAxis = "date") {
	const date = new Date(timestamp)
	return axis === "date" ? toAbsoluteTimeString(date) : toDateTimeString(date)
}
