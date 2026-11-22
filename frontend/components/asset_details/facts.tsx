import { Info } from "lucide-react"
import type { ReactNode } from "react"
import Tooltip from "@/components/tooltip"
import { cn } from "@/lib/utils"

export interface Fact {
	label: string
	/** null: not known, the fact is left out */
	value: ReactNode | null
	/** short explanation for students, shown on hover/focus */
	hint?: string
	/** value colour for returns */
	tone?: "win" | "loss"
}

/** Label/value grid; facts without a value are left out. */
export function FactGrid({
	facts,
	className,
}: {
	facts: Fact[]
	className?: string
}) {
	const known = facts.filter(f => f.value != null && f.value !== "")
	if (known.length === 0) return null
	return (
		<dl
			className={cn(
				"grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-5",
				className
			)}
		>
			{known.map(fact => (
				<div key={fact.label} className="flex flex-col gap-1 min-w-0">
					<dt className="flex flex-row items-start gap-1 text-sm leading-tight text-muted-foreground">
						<span className="break-words min-w-0">{fact.label}</span>
						{fact.hint && (
							<Tooltip name={fact.hint} className="shrink-0 mt-px">
								<Info
									className="size-3.5"
									aria-label={`Erklärung: ${fact.label}`}
								/>
							</Tooltip>
						)}
					</dt>
					<dd
						className={cn(
							"text-lg font-semibold tabular-nums leading-tight break-words",
							fact.tone === "win" && "text-win",
							fact.tone === "loss" && "text-loss"
						)}
					>
						{fact.value}
					</dd>
				</div>
			))}
		</dl>
	)
}

/** "win" for gains, "loss" for losses (returns, drawdowns). */
export function toneOf(v: number | null | undefined): Fact["tone"] {
	if (v == null || v === 0) return undefined
	return v > 0 ? "win" : "loss"
}
