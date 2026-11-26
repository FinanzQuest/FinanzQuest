"use client"

import { cn } from "@/lib/utils"
import type { OrderExercise } from "../types"

/** value = indices into exercise.items (= correct order) in the order the user placed them. */
export const isCorrect = (e: OrderExercise, value: number[] | null) =>
	!!value && value.length === e.items.length && value.every((v, i) => v === i)

/** Deterministic shuffle (never the identity for n > 1) so SSR/CSR and re-renders agree. */
export function shuffledIndices(n: number, seed: string): number[] {
	let h = 2166136261
	for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
	const idx = Array.from({ length: n }, (_, i) => i)
	for (let i = n - 1; i > 0; i--) {
		h = Math.imul(h ^ (h >>> 15), 2246822507) + i
		const j = Math.abs(h) % (i + 1)
		;[idx[i], idx[j]] = [idx[j], idx[i]]
	}
	if (n > 1 && idx.every((v, i) => v === i)) idx.push(idx.shift() as number)
	return idx
}

interface Props {
	exercise: OrderExercise
	value: number[]
	onChange: (v: number[]) => void
	locked: boolean
}

export function OrderItems({ exercise, value, onChange, locked }: Props) {
	const pool = shuffledIndices(exercise.items.length, exercise.question).filter(
		i => !value.includes(i)
	)
	return (
		<div className="flex flex-col gap-4">
			<h2 className="text-xl font-bold leading-snug">{exercise.question}</h2>
			<p className="text-sm text-muted-foreground">
				Tippe die Karten in der richtigen Reihenfolge an. Tippe auf eine
				gesetzte Karte, um sie zurückzulegen.
			</p>
			<ol className="flex flex-col gap-2">
				{exercise.items.map((_, slot) => {
					const placed = value[slot]
					const ok = locked && placed === slot
					const bad = locked && placed !== undefined && placed !== slot
					return (
						// biome-ignore lint/suspicious/noArrayIndexKey: slots are positional
						<li key={slot}>
							<button
								type="button"
								disabled={locked || placed === undefined}
								onClick={() => onChange(value.filter(v => v !== placed))}
								className={cn(
									"flex min-h-12 w-full items-center gap-3 rounded-2xl border-2 p-3 text-left text-sm transition-all",
									placed === undefined
										? "border-dashed border-border text-muted-foreground"
										: "border-b-4 border-primary bg-primary/10 font-medium motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:duration-150",
									ok && "border-win bg-win/15",
									bad && "border-loss bg-loss/15"
								)}
							>
								<span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
									{slot + 1}
								</span>
								<span className="min-w-0 wrap-break-word">
									{placed === undefined ? "…" : exercise.items[placed]}
								</span>
							</button>
						</li>
					)
				})}
			</ol>
			{!locked && (
				<div className="flex flex-wrap gap-2">
					{pool.map(i => (
						<button
							key={i}
							type="button"
							onClick={() => onChange([...value, i])}
							className="rounded-2xl border-2 border-b-4 bg-card px-3 py-2 text-left text-sm font-medium transition-all hover:bg-muted active:translate-y-px motion-safe:active:scale-[0.98]"
						>
							{exercise.items[i]}
						</button>
					))}
				</div>
			)}
		</div>
	)
}
