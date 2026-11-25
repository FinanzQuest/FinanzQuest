"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import type { MatchExercise } from "../types"
import { shuffledIndices } from "./order_items"

/** value = left index -> right index (index into pairs) chosen by the user. */
export const isCorrect = (
	e: MatchExercise,
	value: Record<number, number> | null
) =>
	!!value &&
	Object.keys(value).length === e.pairs.length &&
	e.pairs.every((_, i) => value[i] === i)

// one static class set per pair so Tailwind can see them
const pairStyles = [
	"border-overlay-1 bg-overlay-1/15",
	"border-overlay-2 bg-overlay-2/15",
	"border-overlay-3 bg-overlay-3/15",
	"border-overlay-4 bg-overlay-4/15",
	"border-overlay-5 bg-overlay-5/15",
	"border-overlay-6 bg-overlay-6/15",
]

interface Props {
	exercise: MatchExercise
	value: Record<number, number>
	onChange: (v: Record<number, number>) => void
	locked: boolean
}

export function MatchPairs({ exercise, value, onChange, locked }: Props) {
	const [selectedLeft, setSelectedLeft] = useState<number | null>(null)
	const rightOrder = shuffledIndices(exercise.pairs.length, exercise.question)
	const leftOfRight = (r: number) =>
		Number(Object.keys(value).find(l => value[Number(l)] === r) ?? NaN)

	const tapLeft = (l: number) => {
		if (l in value) {
			const { [l]: _removed, ...rest } = value
			onChange(rest)
			setSelectedLeft(null)
		} else setSelectedLeft(selectedLeft === l ? null : l)
	}
	const tapRight = (r: number) => {
		const owner = leftOfRight(r)
		if (!Number.isNaN(owner)) {
			const { [owner]: _removed, ...rest } = value
			onChange(rest)
			return
		}
		if (selectedLeft === null) return
		onChange({ ...value, [selectedLeft]: r })
		setSelectedLeft(null)
	}

	const style = (l: number, ok: boolean | null) =>
		cn(
			"flex min-h-12 w-full items-center rounded-2xl border-2 p-3 text-left text-sm font-medium transition-all active:translate-y-px",
			"border-border bg-card hover:bg-muted",
			l >= 0 && pairStyles[l % pairStyles.length],
			ok === true && "border-win bg-win/15",
			ok === false && "border-loss bg-loss/15"
		)

	return (
		<div className="flex flex-col gap-4">
			<h2 className="text-xl font-bold leading-snug">{exercise.question}</h2>
			<p className="text-sm text-muted-foreground">
				Tippe links einen Begriff an und dann rechts den passenden Partner.
			</p>
			<div className="grid grid-cols-2 gap-3">
				<div className="flex flex-col gap-2">
					{exercise.pairs.map((p, l) => {
						const paired = l in value
						return (
							<button
								key={p.left}
								type="button"
								disabled={locked}
								onClick={() => tapLeft(l)}
								className={cn(
									style(
										paired ? l : -1,
										locked && paired ? value[l] === l : null
									),
									selectedLeft === l && "border-primary bg-primary/10"
								)}
							>
								<span className="min-w-0 wrap-break-word">{p.left}</span>
							</button>
						)
					})}
				</div>
				<div className="flex flex-col gap-2">
					{rightOrder.map(r => {
						const owner = leftOfRight(r)
						const paired = !Number.isNaN(owner)
						return (
							<button
								key={exercise.pairs[r].right}
								type="button"
								disabled={locked}
								onClick={() => tapRight(r)}
								className={style(
									paired ? owner : -1,
									locked && paired ? owner === r : null
								)}
							>
								<span className="min-w-0 wrap-break-word">
									{exercise.pairs[r].right}
								</span>
							</button>
						)
					})}
				</div>
			</div>
		</div>
	)
}
