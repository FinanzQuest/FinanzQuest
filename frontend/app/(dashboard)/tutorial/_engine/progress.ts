import "server-only"
import { getServerClient, getUser } from "@/lib/auth"
import { usersClient } from "./db_types"
import type { LearnerProgress } from "./types"

/** Progress of the current user: passed lessons (rows) plus XP / streak. */
export async function getProgress(): Promise<LearnerProgress> {
	const empty: LearnerProgress = { xpTotal: 0, streak: 0, lessons: {} }
	const { user } = await getUser()
	if (!user) return empty
	const db = usersClient(await getServerClient())
	const [rows, overview] = await Promise.all([
		db.from("lesson_progress").select("*").eq("user_id", user.id),
		db.from("learner_overview").select("*").eq("user_id", user.id),
	])
	const lessons: LearnerProgress["lessons"] = {}
	for (const r of rows.data ?? []) {
		lessons[r.lesson_id] = {
			lessonId: r.lesson_id,
			completions: r.completions,
			bestScore: Number(r.best_score),
			mastery: r.mastery,
		}
	}
	const o = overview.data?.[0]
	return { xpTotal: o?.xp_total ?? 0, streak: o?.streak ?? 0, lessons }
}
