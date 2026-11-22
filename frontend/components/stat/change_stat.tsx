import { currencyFormat } from "@/lib/cash_display_string"
import { cn } from "@/lib/utils"

const signedPercent = new Intl.NumberFormat("de-DE", {
	style: "percent",
	minimumFractionDigits: 1,
	maximumFractionDigits: 1,
	signDisplay: "exceptZero",
})

export default function ChangeStat({
	label,
	value,
	prev,
	neutral,
	className,
}: {
	label: string
	value: number
	prev?: number | null
	neutral?: boolean
	className?: string
}) {
	const color = neutral
		? "text-foreground"
		: value > 0
			? "text-win"
			: value < 0
				? "text-loss"
				: "text-muted-foreground"
	const sign = neutral ? "" : value > 0 ? "+" : ""
	const ratio = !neutral && prev != null && prev > 0 ? value / prev : null
	// no reference value (e.g. the depot is younger than the period): a
	// change of "0 €" would be wrong, show a dash
	const unknown = !neutral && prev === null

	return (
		<div className={cn("flex flex-col gap-1", className)}>
			<span className="text-sm uppercase tracking-wide text-muted-foreground">
				{label}
			</span>
			{unknown ? (
				<span className="text-xl font-semibold text-muted-foreground">–</span>
			) : (
				<span
					className={cn("text-xl font-semibold number tabular-nums", color)}
				>
					{sign}
					{currencyFormat.format(value)}
					{ratio != null && (
						<span className="ml-1 text-base">
							({signedPercent.format(ratio)})
						</span>
					)}
				</span>
			)}
		</div>
	)
}
