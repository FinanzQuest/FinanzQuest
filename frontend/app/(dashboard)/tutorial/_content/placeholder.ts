import { getLessonMeta } from "../_engine/catalog"
import type { LessonDef } from "../_engine/types"

/** Placeholder lesson (2 cards + 1 exercise) until a content step replaces it. */
export function placeholderLesson(id: string): LessonDef {
	const title = getLessonMeta(id)?.title ?? id
	return {
		id,
		title,
		steps: [
			{
				type: "card",
				title,
				body: "Dieser Inhalt wird gerade erstellt. Schau bald wieder vorbei.",
			},
			{
				type: "card",
				title: "Kurz vor dem Ziel",
				body: "Eine kleine Übungsfrage zeigt dir, wie Lektionen später funktionieren.",
			},
			{
				type: "exercise",
				exercise: {
					kind: "true_false",
					statement: "Beim Investieren hilft es, langfristig zu denken.",
					correct: true,
					explanation:
						"Langfristig sinken Schwankungen im Verhältnis zur Entwicklung.",
				},
			},
		],
	}
}
