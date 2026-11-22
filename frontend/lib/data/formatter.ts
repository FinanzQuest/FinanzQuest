import type {
	CleanedStockPrice,
	NonNullableRow,
	StockPrice,
} from "@/database/custom_types"
import { getTimeBetweenDates, msPerDay, toISODateOnly } from "../util"

type Price = Omit<StockPrice, "id" | "asset_id">

export function formatter(data: Array<StockPrice>, treshold = 1) {
	const dataWithEmptyDays: Array<Price> = []
	for (let index = 0; index < data.length; index++) {
		const previousTimeStamp = data[index - 1]?.tstamp
		const price = data[index]
		if (!previousTimeStamp) {
			dataWithEmptyDays.push(price)
			continue
		}

		const tDiff = getTimeBetweenDates(
			new Date(previousTimeStamp),
			new Date(price.tstamp)
		) as number

		if (tDiff > treshold) {
			for (let i = 1; i < tDiff; i += treshold) {
				const tstamp = toISODateOnly(
					new Date(i * msPerDay + new Date(previousTimeStamp).getTime())
				)
				dataWithEmptyDays.push({
					close: null,
					high: null,
					low: null,
					open: null,
					tstamp,
					volume: null,
				})
			}
		}

		dataWithEmptyDays.push({
			...price,
			tstamp: price.tstamp,
		} as CleanedStockPrice)
	}

	const filtered = dataWithEmptyDays.filter(
		price =>
			price.close !== null ||
			price.open !== null ||
			price.high !== null ||
			price.low !== null ||
			price.volume !== null
	) as NonNullableRow<Price>[]

	return { dataWithEmptyDays: dataWithEmptyDays, data: filtered }
}

/**
 * Intraday bars of the last `days` trading days (days that have bars, by UTC
 * date). Bars are not padded with empty slots — gaps (nights, weekends) are
 * simply skipped on the categorical chart axis.
 */
export function intradayFormatter(data: Array<StockPrice>, days: number) {
	const bars = data.filter(price => price.close !== null)
	const utcDay = (price: StockPrice) => toISODateOnly(new Date(price.tstamp))
	const tradingDays = [...new Set(bars.map(utcDay))]
	const firstDay = tradingDays.at(-days)
	if (!firstDay) return bars as Array<Price>
	return bars.filter(price => utcDay(price) >= firstDay) as Array<Price>
}

// function isNullishRow<T extends Record<string, unknown>>(
//   row: T,
// ): row is NonNullableRow<T> {
//   const values = Object.values(row);

//   return values.includes(null) || values.includes(undefined);
// }

// export const formatFloatingPoints = (
//   { open, close, high, low }: StockPrice,
// ) => ({
//   open: open ? formatFloatingPoint(open, 2) : open,
//   close: close ? formatFloatingPoint(close, 2) : close,
//   high: high ? formatFloatingPoint(high, 2) : high,
//   low: low ? formatFloatingPoint(low, 2) : low,
// });
// export const formatFloatingPoint = (
//   value: number,
//   digits: number,
// ): number | null => {
//   const factor = Math.pow(10, digits);
//   const integerPart = Math.floor(value);
//   const fractionalPart = value - integerPart;
//   const reducedFractionalPart = Math.floor(fractionalPart * factor) / factor;
//   return integerPart + reducedFractionalPart;
// };

export const formatFloatingPointString = (
	value: number,
	digits: number
): string => {
	return value.toFixed(digits)
}
