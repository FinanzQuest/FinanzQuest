import { cn } from "@/lib/utils"
import { fmtPercent } from "./format"

export interface Share {
	key: string
	label: string
	/** e.g. sector or country under the label */
	detail?: string | null
	/** fraction of the fund */
	weight: number
	/** muted bar (e.g. "Sonstige") */
	muted?: boolean
}

/**
 * Horizontal bar chart of shares (fractions of a whole), largest first.
 * Bars are scaled to the largest share so small funds stay readable; the
 * percentage is the real share.
 */
export function ShareBars({
	shares,
	className,
	label,
}: {
	shares: Share[]
	className?: string
	/** accessible name of the chart */
	label: string
}) {
	const max = Math.max(...shares.map(s => s.weight), 0.0001)
	return (
		<ul aria-label={label} className={cn("flex flex-col gap-3", className)}>
			{shares.map(share => (
				<li key={share.key} className="flex flex-col gap-1">
					<div className="flex flex-row items-baseline justify-between gap-3 text-sm">
						<span className="min-w-0 truncate">
							<span className="font-medium">{share.label}</span>
							{share.detail && (
								<span className="text-muted-foreground"> · {share.detail}</span>
							)}
						</span>
						<span className="tabular-nums font-semibold shrink-0">
							{fmtPercent(share.weight)}
						</span>
					</div>
					<div className="h-2 w-full rounded-full bg-muted overflow-hidden">
						<div
							className={cn(
								"h-full rounded-full",
								share.muted ? "bg-muted-foreground/40" : "bg-primary"
							)}
							style={{ width: `${(share.weight / max) * 100}%` }}
						/>
					</div>
				</li>
			))}
		</ul>
	)
}
