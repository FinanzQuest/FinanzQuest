"use client"

import { cn } from "@/lib/utils"
import type { McExercise } from "../types"

export const isCorrect = (e: McExercise, value: number | null) =>
	value === e.correct

interface Props {
	exercise: McExercise
	value: number | null
	onChange: (v: number) => void
	locked: boolean
}

export function MultipleChoice({ exercise, value, onChange, locked }: Props) {
	return (
		<div className="flex flex-col gap-3">
			<h2 className="text-xl font-bold leading-snug">{exercise.question}</h2>
			<div className="flex flex-col gap-2">
				{exercise.options.map((opt, i) => {
					const selected = value === i
					const showRight = locked && i === exercise.correct
					const showWrong = locked && selected && i !== exercise.correct
					return (
						<button
							// biome-ignore lint/suspicious/noArrayIndexKey: options are static
							key={i}
							type="button"
							data-slot="option"
							aria-pressed={selected}
							disabled={locked}
							onClick={() => onChange(i)}
							className={cn(
								"flex items-center gap-3 rounded-2xl border-2 border-b-4 p-4 text-left text-sm font-medium transition-all active:translate-y-px motion-safe:active:scale-[0.99]",
								"border-border bg-card hover:bg-muted",
								selected && !locked && "border-primary bg-primary/10",
								showRight && "border-win bg-win/15",
								showWrong && "border-loss bg-loss/15",
								locked && !showRight && !showWrong && "opacity-60"
							)}
						>
							<span
								className={cn(
									"flex size-7 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold",
									selected && !locked && "border-primary"
								)}
							>
								{String.fromCharCode(65 + i)}
							</span>
							<span className="min-w-0 wrap-break-word">{opt}</span>
						</button>
					)
				})}
			</div>
		</div>
	)
}
