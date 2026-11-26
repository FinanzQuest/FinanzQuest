"use server"

import { getServerClient } from "@/lib/auth"
import {
	type ClassLessonRow,
	usersClient,
} from "../../tutorial/_engine/db_types"

/** Per-lesson progress of one student; the DB function enforces teacher/admin. */
export async function getStudentLessons(
	userId: string
): Promise<{ rows: ClassLessonRow[]; error: string | null }> {
	const { data, error } = await usersClient(await getServerClient()).rpc(
		"tutorial_class_lessons",
		{ p_user_id: userId }
	)
	if (error || !data) {
		return {
			rows: [],
			error:
				error?.code === "42501"
					? "Keine Berechtigung."
					: "Fortschritt konnte nicht geladen werden.",
		}
	}
	return { rows: data, error: null }
}
