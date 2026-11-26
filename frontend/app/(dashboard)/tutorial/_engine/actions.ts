"use server"

import { revalidatePath } from "next/cache"
import { getServerClient } from "@/lib/auth"
import { getLessonMeta } from "./catalog"
import { usersClient } from "./db_types"
import type { CompleteResult } from "./types"

export interface CompleteLessonInput {
	lessonId: string
	attemptId: number
	/** share of exercises answered correctly on the first try, 0..1 */
	score: number
	/** depot to credit the virtual reward to; null when none is selected */
	depotId: number | null
}

async function db() {
	return usersClient(await getServerClient())
}

export type StartLessonResult =
	| { attemptId: number; error: null; locked: false }
	| { attemptId: null; error: string; locked: boolean }

/** Opens an attempt for the player (rate-limited and unlock-checked by the DB). */
export async function startLesson(
	lessonId: string
): Promise<StartLessonResult> {
	if (!getLessonMeta(lessonId)) {
		return { attemptId: null, error: "Unbekannte Lektion", locked: false }
	}
	const { data, error } = await (await db()).rpc("start_lesson", {
		p_lesson_id: lessonId,
	})
	if (error || data === null) {
		switch (error?.code) {
			case "42501":
				return { attemptId: null, error: "Lektion gesperrt", locked: true }
			case "54000":
				return {
					attemptId: null,
					error:
						"Du hast heute schon viele Lektionen gestartet. Mach eine Pause und probiere es morgen wieder.",
					locked: false,
				}
			default:
				return {
					attemptId: null,
					error: "Die Lektion konnte nicht gestartet werden.",
					locked: false,
				}
		}
	}
	return { attemptId: Number(data), error: null, locked: false }
}

export async function completeLesson(
	input: CompleteLessonInput
): Promise<{ res: CompleteResult | null; error: string | null }> {
	if (!getLessonMeta(input.lessonId)) {
		return { res: null, error: "Unbekannte Lektion" }
	}
	const { data, error } = await (await db()).rpc("complete_lesson", {
		p_lesson_id: input.lessonId,
		p_attempt_id: input.attemptId,
		p_score: input.score,
		p_depot_id: input.depotId,
	})
	const row = data?.[0]
	if (error || !row) {
		if (error?.code === "22023" && /too fast/i.test(error.message)) {
			return {
				res: null,
				error: "Zu schnell – nimm dir etwas mehr Zeit für die Lektion",
			}
		}
		if (error?.code === "42501") {
			return { res: null, error: "Keine Berechtigung für diese Aktion." }
		}
		return {
			res: null,
			error: "Das Ergebnis konnte nicht gespeichert werden.",
		}
	}
	revalidatePath("/tutorial", "layout")
	revalidatePath("/")
	revalidatePath("/transactions")
	return {
		res: {
			passed: row.passed,
			firstCompletion: row.first_completion,
			xpAwarded: row.xp_awarded,
			virtualCashAwarded: Number(row.virtual_cash_awarded),
			rewardPending:
				row.passed && input.depotId === null && row.first_completion,
			mastery: row.mastery,
			streak: row.streak,
			xpTotal: row.xp_total,
		},
		error: null,
	}
}
