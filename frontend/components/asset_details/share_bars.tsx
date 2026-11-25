import { ChevronRight } from "lucide-react"
import Link from "next/link"
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
	/** the entry's own page (e.g. a holding's asset page) */
	href?: string | null
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
	linkCountries,
}: {
	shares: Share[]
	className?: string
	/** accessible name of the chart */
	label: string
	/** keys are ISO alpha-2 codes: link rows to the world map on hover */
	linkCountries?: boolean
}) {
	const max = Math.max(...shares.map(s => s.weight), 0.0001)
	return (
		<ul aria-label={label} className={cn("flex flex-col gap-1", className)}>
			{shares.map(share => {
				const content = (
					<>
						<div className="flex flex-row items-baseline justify-between gap-3 text-sm">
							<span className="min-w-0 truncate">
								<span
									className={cn(
										"font-medium",
										share.href &&
											"underline-offset-2 decoration-muted-foreground/50 group-hover:underline"
									)}
								>
									{share.label}
								</span>
								{share.detail && (
									<span className="text-muted-foreground">
										{" "}
										· {share.detail}
									</span>
								)}
							</span>
							<span className="flex flex-row items-center gap-1 tabular-nums font-semibold shrink-0">
								{fmtPercent(share.weight)}
								{share.href && (
									<ChevronRight
										aria-hidden
										className="size-3.5 text-muted-foreground group-hover:text-foreground"
									/>
								)}
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
					</>
				)
				return (
					<li
						key={share.key}
						data-country={linkCountries ? share.key : undefined}
						className="rounded-lg"
					>
						{share.href ? (
							<Link
								href={share.href}
								className="group flex flex-col gap-1 -mx-2 px-2 py-1 rounded-lg hover:bg-muted/50 focus-visible:bg-muted/50 outline-none transition-colors"
							>
								{content}
							</Link>
						) : (
							<div className="flex flex-col gap-1 py-1">{content}</div>
						)}
					</li>
				)
			})}
		</ul>
	)
}
