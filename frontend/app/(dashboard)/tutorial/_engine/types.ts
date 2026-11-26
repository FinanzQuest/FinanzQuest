import type { ReactNode } from "react"

export type PathId =
	| "grundlagen"
	| "aktien"
	| "etfs"
	| "psychologie"
	| "anleihen"
	| "portfolio"
	| "krypto"
	| "krypto-vertiefung"
	| "rohstoffe"
	| "rohstoffe-vertiefung"
	| "steuern"
	| "spekulation"

/** Lucide icon key, resolved to a component in the UI (keeps the catalog serializable). */
export type PathIcon =
	| "sprout"
	| "trending-up"
	| "pie-chart"
	| "brain"
	| "landmark"
	| "sigma"
	| "receipt"
	| "dices"
	| "bitcoin"
	| "gem"

/** Asset types a tutorial path can belong to (api.assets.asset_type). */
export type AssetKind = "stock" | "fund" | "bond" | "crypto" | "commodity"

export interface PathDef {
	id: PathId
	title: string
	description: string
	icon: PathIcon
	/** paths that must be fully done before this one unlocks */
	requires: PathId[]
	status: "available" | "soon"
	/**
	 * Asset the path belongs to. `base` = required before buying it (enforced
	 * by users.require_asset_tutorial), `advanced` = optional deepening.
	 */
	asset?: { kind: AssetKind; tier: "base" | "advanced" }
	lessonIds: string[]
}

/** Metadata mirrored in the DB (ids, order, xp, reward, min_score). */
export interface LessonMeta {
	id: string
	pathId: PathId
	/** id without the path prefix; used in the route */
	slug: string
	title: string
	xp: number
	virtualCashReward: number
	/** minimum score (0..1) to count as passed */
	minScore: number
	checkpoint: boolean
}

export interface McExercise {
	kind: "mc"
	question: string
	options: string[]
	/** index into options */
	correct: number
	explanation: string
}

export interface TrueFalseExercise {
	kind: "true_false"
	statement: string
	correct: boolean
	explanation: string
}

export interface SliderExercise {
	kind: "slider"
	question: string
	min: number
	max: number
	step: number
	correct: number
	/** answers within +-tolerance count as correct */
	tolerance: number
	unit?: string
	explanation: string
}

export interface OrderExercise {
	kind: "order"
	question: string
	/** items in their CORRECT order; the player shuffles them */
	items: string[]
	explanation: string
}

export interface MatchExercise {
	kind: "match"
	question: string
	/** left[i] belongs to right[i]; the player shuffles the right column */
	pairs: { left: string; right: string }[]
	explanation: string
}

export type Exercise =
	| McExercise
	| TrueFalseExercise
	| SliderExercise
	| OrderExercise
	| MatchExercise

export interface CardStep {
	type: "card"
	title: string
	body: ReactNode
	diagram?: ReactNode
	/** name of a server slot (see _content/server_slots.ts) rendered below the body */
	slot?: string
}

export interface ExerciseStep {
	type: "exercise"
	exercise: Exercise
}

export type Step = CardStep | ExerciseStep

export interface LessonDef {
	id: string
	title: string
	steps: Step[]
}

/** Answer value per exercise kind, as held by the player. */
export type AnswerOf<E extends Exercise> = E extends McExercise
	? number
	: E extends TrueFalseExercise
		? boolean
		: E extends SliderExercise
			? number
			: E extends OrderExercise
				? number[]
				: E extends MatchExercise
					? Record<number, number>
					: never

export type Answer = AnswerOf<Exercise>

export type LessonState = "locked" | "available" | "in_progress" | "done"
export type PathState = "locked" | "open" | "done" | "soon"

export interface LessonProgress {
	lessonId: string
	completions: number
	bestScore: number
	/** 0..3 */
	mastery: number
}

export interface LearnerProgress {
	xpTotal: number
	streak: number
	lessons: Record<string, LessonProgress>
}

export interface CompleteResult {
	passed: boolean
	firstCompletion: boolean
	xpAwarded: number
	virtualCashAwarded: number
	/** true when a reward is owed but no depot was given */
	rewardPending: boolean
	mastery: number
	streak: number
	xpTotal: number
}
