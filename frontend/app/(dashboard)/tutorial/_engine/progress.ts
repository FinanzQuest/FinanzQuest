import "server-only"
import type { LearnerProgress } from "./types"

/**
 * STUB. Real implementation (S8) reads users.lesson_progress / learner_stats.
 * Returning empty progress means only the first lesson of `grundlagen` is unlocked.
 */
export async function getProgress(): Promise<LearnerProgress> {
	return { xpTotal: 0, streak: 0, lessons: {} }
}
