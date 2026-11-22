export const currencyFormat = Intl.NumberFormat("de-DE", {
	style: "currency",
	minimumFractionDigits: 0,
	currency: "EUR",
	currencyDisplay: "symbol",
})
export const currencyFormatFixedLength = Intl.NumberFormat("de-DE", {
	style: "currency",
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
	currency: "EUR",
	currencyDisplay: "symbol",
})

/** 1.37e11, "USD" -> "137 Mrd. $"; without (or with an unknown) currency
 * only the number: "137 Mrd.". null for missing values. */
export function compactMoneyString(
	amount: number | null | undefined,
	currency?: string | null
): string | null {
	if (amount == null || !Number.isFinite(amount)) return null
	const compact = { notation: "compact", maximumFractionDigits: 1 } as const
	const code = currency?.trim()
	if (code) {
		try {
			return Intl.NumberFormat("de-DE", {
				...compact,
				style: "currency",
				currency: code,
			}).format(amount)
		} catch {
			// not an ISO currency code: number only
		}
	}
	return Intl.NumberFormat("de-DE", compact).format(amount)
}

export function to_display_string(
	amount: number | null,
	absolute?: boolean,
	dec_places = 3,
	abbreviate = true
): string {
	if (
		amount === 0 ||
		amount === null ||
		amount === undefined ||
		Number.isNaN(amount)
	) {
		return "-"
	}

	if (!abbreviate) {
		return (absolute ? Math.abs(amount) : amount).toFixed(dec_places)
	}

	const sign = absolute ? 1 : Math.sign(amount)
	const money_amount: number = Math.abs(amount)

	if (money_amount < 1) {
		return (money_amount * sign).toFixed(dec_places)
	}

	const abbreviations: Map<number, string> = new Map([
		[1, ""],
		[1000, "k"],
		[1000 * 1000, "M"],
		[1000 * 1000 * 1000, "B"],
	])

	let display_string = ""
	let biggest_divisor = 0
	let biggest_short = ""

	const pre_round_fac = 10 ** dec_places

	for (const [divisor, short] of abbreviations) {
		if (biggest_divisor < divisor && money_amount >= divisor) {
			biggest_divisor = divisor
			biggest_short = short
		}
	}

	display_string = `${
		(Math.round((money_amount / biggest_divisor) * pre_round_fac) /
			pre_round_fac) *
		sign
	}${biggest_short}`

	return display_string
}
