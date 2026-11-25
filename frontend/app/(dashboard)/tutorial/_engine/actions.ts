"use server"

import { getLessonMeta } from "./catalog"
import type { CompleteResult } from "./types"

export interface CompleteLessonInput {
	lessonId: string
	/** share of exercises answered correctly on the first try, 0..1 */
	score: number
	/** depot to credit the virtual reward to; null when none is selected */
	depotId: number | null
}

/**
 * STUB. Real implementation (S8) calls users.complete_lesson and revalidates /tutorial.
 * Returns a fake result so the completion screen can be built.
 */
export async function completeLesson(
	input: CompleteLessonInput
): Promise<{ res: CompleteResult | null; error: string | null }> {
	const meta = getLessonMeta(input.lessonId)
	if (!meta) return { res: null, error: "Unbekannte Lektion" }
	const passed = input.score >= meta.minScore
	const mastery = input.score >= 1 ? 3 : input.score >= 0.8 ? 2 : passed ? 1 : 0
	return {
		res: {
			passed,
			firstCompletion: passed,
			xpAwarded: passed ? meta.xp : 0,
			virtualCashAwarded:
				passed && input.depotId !== null ? meta.virtualCashReward : 0,
			rewardPending: passed && input.depotId === null,
			mastery,
			streak: 1,
			xpTotal: passed ? meta.xp : 0,
		},
		error: null,
	}
}
