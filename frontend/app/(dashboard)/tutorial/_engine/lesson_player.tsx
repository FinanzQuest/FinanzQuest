"use client"

import { X } from "lucide-react"
import { useRouter } from "next/navigation"
import { type ReactNode, useEffect, useReducer, useState } from "react"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { loadLesson } from "../_content"
import { CompleteScreen } from "./complete_screen"
import {
	isCorrect as isMatchCorrect,
	MatchPairs,
} from "./exercises/match_pairs"
import {
	isCorrect as isMcCorrect,
	MultipleChoice,
} from "./exercises/multiple_choice"
import {
	isCorrect as isOrderCorrect,
	OrderItems,
} from "./exercises/order_items"
import {
	isCorrect as isSliderCorrect,
	SliderEstimate,
} from "./exercises/slider_estimate"
import { isCorrect as isTfCorrect, TrueFalse } from "./exercises/true_false"
import { FeedbackBar } from "./feedback_bar"
import {
	currentStepIndex,
	getProgressRatio,
	getScore,
	initPlayer,
	playerReducer,
} from "./player_machine"
import type { Answer, Exercise, LessonDef } from "./types"

interface LessonPlayerProps {
	lessonId: string
	depotId: number | null
	nextHref: string | null
	/** server-rendered slots of this lesson, by slot name */
	slots: Record<string, ReactNode>
}

export function LessonPlayer(props: LessonPlayerProps) {
	const [lesson, setLesson] = useState<LessonDef | null>(null)
	const [failed, setFailed] = useState(false)
	const [attempt, setAttempt] = useState(0)
	const { lessonId } = props

	useEffect(() => {
		let cancelled = false
		loadLesson(lessonId)
			.then(l => !cancelled && setLesson(l))
			.catch(() => !cancelled && setFailed(true))
		return () => {
			cancelled = true
		}
	}, [lessonId])

	if (failed) {
		return (
			<p className="p-8 text-center text-muted-foreground">
				Diese Lektion konnte nicht geladen werden.
			</p>
		)
	}
	if (!lesson) {
		return (
			<div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
				Lektion wird geladen …
			</div>
		)
	}
	return (
		<PlayerInner
			key={attempt}
			lesson={lesson}
			{...props}
			onRetry={() => setAttempt(a => a + 1)}
		/>
	)
}

function initialAnswer(e: Exercise): Answer | null {
	switch (e.kind) {
		case "slider":
			return Math.round((e.min + e.max) / 2 / e.step) * e.step
		case "order":
			return []
		case "match":
			return {}
		default:
			return null
	}
}

function canCheck(e: Exercise, a: Answer | null) {
	if (a === null) return false
	if (e.kind === "order") return (a as number[]).length === e.items.length
	if (e.kind === "match")
		return Object.keys(a as object).length === e.pairs.length
	return true
}

function checkAnswer(e: Exercise, a: Answer | null) {
	switch (e.kind) {
		case "mc":
			return isMcCorrect(e, a as number | null)
		case "true_false":
			return isTfCorrect(e, a as boolean | null)
		case "slider":
			return isSliderCorrect(e, a as number | null)
		case "order":
			return isOrderCorrect(e, a as number[] | null)
		case "match":
			return isMatchCorrect(e, a as Record<number, number> | null)
	}
}

function ExerciseView({
	exercise,
	answer,
	setAnswer,
	locked,
}: {
	exercise: Exercise
	answer: Answer | null
	setAnswer: (a: Answer) => void
	locked: boolean
}) {
	switch (exercise.kind) {
		case "mc":
			return (
				<MultipleChoice
					exercise={exercise}
					value={answer as number | null}
					onChange={setAnswer}
					locked={locked}
				/>
			)
		case "true_false":
			return (
				<TrueFalse
					exercise={exercise}
					value={answer as boolean | null}
					onChange={setAnswer}
					locked={locked}
				/>
			)
		case "slider":
			return (
				<SliderEstimate
					exercise={exercise}
					value={answer as number}
					onChange={setAnswer}
					locked={locked}
				/>
			)
		case "order":
			return (
				<OrderItems
					exercise={exercise}
					value={answer as number[]}
					onChange={setAnswer}
					locked={locked}
				/>
			)
		case "match":
			return (
				<MatchPairs
					exercise={exercise}
					value={answer as Record<number, number>}
					onChange={setAnswer}
					locked={locked}
				/>
			)
	}
}

function PlayerInner({
	lesson,
	lessonId,
	depotId,
	nextHref,
	slots,
	onRetry,
}: LessonPlayerProps & { lesson: LessonDef; onRetry: () => void }) {
	const router = useRouter()
	const [state, dispatch] = useReducer(
		playerReducer,
		lesson.steps.map(s => s.type),
		initPlayer
	)
	const [exitOpen, setExitOpen] = useState(false)
	const stepIdx = currentStepIndex(state)
	const step = stepIdx === undefined ? undefined : lesson.steps[stepIdx]
	const exercise = step?.type === "exercise" ? step.exercise : undefined

	const [answer, setAnswer] = useState<Answer | null>(null)
	// reset the answer whenever the player moves to another queue position
	const [answerPos, setAnswerPos] = useState(-1)
	if (answerPos !== state.pos) {
		setAnswerPos(state.pos)
		setAnswer(exercise ? initialAnswer(exercise) : null)
	}

	const ready = !!exercise && canCheck(exercise, answer)
	const act = () => {
		if (state.phase === "answering") {
			if (exercise && ready) {
				dispatch({ type: "check", correct: checkAnswer(exercise, answer) })
			}
		} else dispatch({ type: "continue" })
	}

	// Enter = check / continue
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key !== "Enter" || e.repeat || exitOpen || state.phase === "done")
				return
			e.preventDefault()
			act()
		}
		window.addEventListener("keydown", onKey)
		return () => window.removeEventListener("keydown", onKey)
	})

	if (state.phase === "done") {
		return (
			<div className="flex min-h-full flex-1 flex-col">
				<CompleteScreen
					lessonId={lessonId}
					score={getScore(state)}
					depotId={depotId}
					nextHref={nextHref}
					onRetry={onRetry}
				/>
			</div>
		)
	}

	return (
		<div className="flex min-h-full flex-1 flex-col">
			<header className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 pt-4">
				<Button
					variant="ghost"
					size="icon-lg"
					aria-label="Lektion verlassen"
					onClick={() => setExitOpen(true)}
				>
					<X />
				</Button>
				<Progress
					value={Math.round(getProgressRatio(state) * 100)}
					className="flex-1"
					aria-label="Fortschritt"
				/>
			</header>

			<main
				key={state.pos}
				className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-4 motion-safe:duration-200"
			>
				{step?.type === "card" && (
					<div className="flex flex-col gap-5">
						<h1 className="text-2xl font-bold leading-tight">{step.title}</h1>
						<div className="flex flex-col gap-4 text-base leading-relaxed text-foreground/80">
							{step.body}
						</div>
						{step.diagram}
						{step.slot ? slots[step.slot] : null}
					</div>
				)}
				{exercise && (
					<ExerciseView
						exercise={exercise}
						answer={answer}
						setAnswer={setAnswer}
						locked={state.phase === "feedback"}
					/>
				)}
			</main>

			<footer className="sticky bottom-0 bg-background">
				{state.phase === "feedback" && exercise ? (
					<FeedbackBar
						correct={state.lastCorrect === true}
						explanation={exercise.explanation}
						onContinue={act}
					/>
				) : (
					<div className="border-t px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
						<div className="mx-auto flex w-full max-w-2xl">
							<Button
								size="lg"
								className="h-11 w-full text-base sm:ml-auto sm:w-auto sm:px-8"
								disabled={state.phase === "answering" && !ready}
								onClick={act}
							>
								{state.phase === "answering" ? "Prüfen" : "Weiter"}
							</Button>
						</div>
					</div>
				)}
			</footer>

			<AlertDialog open={exitOpen} onOpenChange={setExitOpen}>
				<AlertDialogContent size="sm">
					<AlertDialogHeader>
						<AlertDialogTitle>Lektion verlassen?</AlertDialogTitle>
						<AlertDialogDescription>
							Dein Fortschritt in dieser Lektion geht verloren.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Weiterlernen</AlertDialogCancel>
						<AlertDialogAction onClick={() => router.push("/tutorial")}>
							Verlassen
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
