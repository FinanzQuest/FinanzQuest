"use client"

import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TrueFalseExercise } from "../types"

export const isCorrect = (e: TrueFalseExercise, value: boolean | null) =>
	value === e.correct

interface Props {
	exercise: TrueFalseExercise
	value: boolean | null
	onChange: (v: boolean) => void
	locked: boolean
}

export function TrueFalse({ exercise, value, onChange, locked }: Props) {
	const options = [
		{ v: true, label: "Stimmt", Icon: Check },
		{ v: false, label: "Stimmt nicht", Icon: X },
	]
	return (
		<div className="flex flex-col gap-4">
			<h2 className="text-xl font-bold leading-snug">Stimmt das?</h2>
			<p className="rounded-2xl border bg-card p-4 text-base leading-relaxed">
				{exercise.statement}
			</p>
			<div className="grid grid-cols-2 gap-3">
				{options.map(({ v, label, Icon }) => {
					const selected = value === v
					const showRight = locked && v === exercise.correct
					const showWrong = locked && selected && v !== exercise.correct
					return (
						<button
							key={label}
							type="button"
							aria-pressed={selected}
							disabled={locked}
							onClick={() => onChange(v)}
							className={cn(
								"flex flex-col items-center gap-1 rounded-2xl border-2 border-b-4 px-2 py-4 text-sm font-semibold transition-all active:translate-y-px motion-safe:active:scale-[0.98]",
								"border-border bg-card hover:bg-muted",
								selected && !locked && "border-primary bg-primary/10",
								showRight && "border-win bg-win/15",
								showWrong && "border-loss bg-loss/15",
								locked && !showRight && !showWrong && "opacity-60"
							)}
						>
							<Icon className="size-5" />
							{label}
						</button>
					)
				})}
			</div>
		</div>
	)
}
