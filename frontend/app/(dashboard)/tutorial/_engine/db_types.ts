// TODO: replace with generated types once frontend/database/types.ts is
// regenerated (it currently lacks the users tutorial objects).
import type { Client } from "@/database/custom_types"

export interface LessonProgressRow {
	user_id: string
	lesson_id: string
	first_completed_at: string
	last_completed_at: string
	completions: number
	best_score: number
	mastery: number
	virtual_cash_reward: number
	reward_paid_at: string | null
}

export interface LearnerOverviewRow {
	user_id: string
	xp_total: number
	streak: number
	streak_best: number
	last_active_day: string | null
	lessons_completed: number
}

export interface CompleteLessonRow {
	passed: boolean
	first_completion: boolean
	xp_awarded: number
	virtual_cash_awarded: number
	mastery: number
	streak: number
	xp_total: number
}

export interface ClassOverviewRow {
	user_id: string
	email: string | null
	user_name: string | null
	xp_total: number
	streak: number
	streak_best: number
	lessons_completed: number
	current_path_id: string | null
	current_lesson_id: string | null
	last_active_day: string | null
}

export interface ClassLessonRow {
	user_id: string
	lesson_id: string
	path_id: string
	mastery: number
	best_score: number
	completions: number
	first_completed_at: string
	last_completed_at: string
}

interface Result<T> {
	data: T | null
	error: { code?: string; message: string } | null
}
interface Query<T> extends PromiseLike<Result<T>> {
	eq(col: string, v: string): Query<T>
	maybeSingle(): PromiseLike<Result<T extends (infer U)[] ? U : T>>
}

/** Narrow, hand-typed view of the `users` schema tutorial objects. */
export interface UsersClient {
	from(table: "lesson_progress"): {
		select(c: string): Query<LessonProgressRow[]>
	}
	from(table: "learner_overview"): {
		select(c: string): Query<LearnerOverviewRow[]>
	}
	rpc(
		fn: "start_lesson",
		a: { p_lesson_id: string }
	): PromiseLike<Result<number>>
	rpc(
		fn: "complete_lesson",
		a: {
			p_lesson_id: string
			p_attempt_id: number
			p_score: number
			p_depot_id: number | null
		}
	): PromiseLike<Result<CompleteLessonRow[]>>
	rpc(fn: "tutorial_class_overview"): PromiseLike<Result<ClassOverviewRow[]>>
	rpc(
		fn: "tutorial_class_lessons",
		a: { p_user_id: string }
	): PromiseLike<Result<ClassLessonRow[]>>
}

export function usersClient(client: Client): UsersClient {
	return client.schema("users") as unknown as UsersClient
}
