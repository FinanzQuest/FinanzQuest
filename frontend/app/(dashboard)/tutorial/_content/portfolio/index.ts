import { pathLessons } from "../../_engine/catalog"
import type { LessonDef } from "../../_engine/types"
import { placeholderLesson } from "../placeholder"

// TODO: replace the placeholders with real lessons (one file per lesson)
export const lessons: Record<string, LessonDef> = Object.fromEntries(
	pathLessons("portfolio").map(l => [l.id, placeholderLesson(l.id)])
)
