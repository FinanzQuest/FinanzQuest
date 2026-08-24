import { currencyFormat } from "@/lib/cash_display_string"
import { cn } from "@/lib/utils"

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
	const percent =
		!neutral && prev != null && prev > 0 ? (value / prev) * 100 : null

	return (
		<div className={cn("flex flex-col gap-1", className)}>
			<span className="text-sm uppercase tracking-wide text-muted-foreground">
				{label}
			</span>
			<span className={cn("text-xl font-semibold number tabular-nums", color)}>
				{sign}
				{currencyFormat.format(value)}
				{percent != null && (
					<span className="ml-1 text-base">
						({sign}
						{Math.abs(percent).toFixed(1)} %)
					</span>
				)}
			</span>
		</div>
	)
}
