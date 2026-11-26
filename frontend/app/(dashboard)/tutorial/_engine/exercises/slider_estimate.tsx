"use client"

import { Slider } from "@/components/ui/slider"
import { numberFormat } from "@/lib/util"
import type { SliderExercise } from "../types"

export const isCorrect = (e: SliderExercise, value: number | null) =>
	value !== null && Math.abs(value - e.correct) <= e.tolerance

interface Props {
	exercise: SliderExercise
	value: number
	onChange: (v: number) => void
	locked: boolean
}

const fmt = (e: SliderExercise, v: number) =>
	`${numberFormat.format(v)}${e.unit ? ` ${e.unit}` : ""}`

export function SliderEstimate({ exercise, value, onChange, locked }: Props) {
	return (
		<div className="flex flex-col gap-6">
			<h2 className="text-xl font-bold leading-snug">{exercise.question}</h2>
			<div className="rounded-2xl border bg-card p-5 flex flex-col gap-5">
				<div className="text-center text-3xl font-bold tabular-nums">
					{fmt(exercise, value)}
				</div>
				<Slider
					min={exercise.min}
					max={exercise.max}
					step={exercise.step}
					value={[value]}
					disabled={locked}
					onValueChange={v => onChange(Array.isArray(v) ? v[0] : v)}
				/>
				<div className="flex justify-between text-xs text-muted-foreground tabular-nums">
					<span>{fmt(exercise, exercise.min)}</span>
					<span>{fmt(exercise, exercise.max)}</span>
				</div>
				{locked && (
					<p className="text-center text-sm text-muted-foreground">
						Richtig:{" "}
						<b className="text-foreground">{fmt(exercise, exercise.correct)}</b>
					</p>
				)}
			</div>
		</div>
	)
}
