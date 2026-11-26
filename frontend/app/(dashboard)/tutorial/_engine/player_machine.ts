/** Pure state machine of the lesson player: step -> answering -> feedback -> next. */

export type StepKind = "card" | "exercise"
export type Phase = "step" | "answering" | "feedback" | "done"

export interface PlayerState {
	kinds: StepKind[]
	/** step indices still to show; wrong exercises are appended once */
	queue: number[]
	pos: number
	phase: Phase
	requeued: number[]
	/** exercise step index -> was it correct on the first attempt */
	firstTry: Record<number, boolean>
	/** correctness of the exercise currently in feedback */
	lastCorrect: boolean | null
}

export type PlayerAction =
	| { type: "check"; correct: boolean }
	| { type: "continue" }

function phaseFor(kinds: StepKind[], idx: number | undefined): Phase {
	if (idx === undefined) return "done"
	return kinds[idx] === "exercise" ? "answering" : "step"
}

export function initPlayer(kinds: StepKind[]): PlayerState {
	const queue = kinds.map((_, i) => i)
	return {
		kinds,
		queue,
		pos: 0,
		phase: phaseFor(kinds, queue[0]),
		requeued: [],
		firstTry: {},
		lastCorrect: null,
	}
}

export function playerReducer(
	state: PlayerState,
	action: PlayerAction
): PlayerState {
	const current = state.queue[state.pos]
	switch (action.type) {
		case "check": {
			if (state.phase !== "answering" || current === undefined) return state
			const firstAttempt = !(current in state.firstTry)
			const requeue = !action.correct && !state.requeued.includes(current)
			return {
				...state,
				phase: "feedback",
				lastCorrect: action.correct,
				firstTry: firstAttempt
					? { ...state.firstTry, [current]: action.correct }
					: state.firstTry,
				queue: requeue ? [...state.queue, current] : state.queue,
				requeued: requeue ? [...state.requeued, current] : state.requeued,
			}
		}
		case "continue": {
			if (state.phase !== "step" && state.phase !== "feedback") return state
			const pos = state.pos + 1
			return {
				...state,
				pos,
				phase: phaseFor(state.kinds, state.queue[pos]),
				lastCorrect: null,
			}
		}
	}
}

/** Share of exercises answered correctly on the first try (1 if there are none). */
export function getScore(state: PlayerState): number {
	const results = Object.values(state.firstTry)
	if (results.length === 0) return 1
	return results.filter(Boolean).length / results.length
}

/** Progress 0..1 over the current queue (grows when exercises are re-queued). */
export function getProgressRatio(state: PlayerState): number {
	return state.queue.length === 0 ? 1 : state.pos / state.queue.length
}

export function currentStepIndex(state: PlayerState): number | undefined {
	return state.queue[state.pos]
}
