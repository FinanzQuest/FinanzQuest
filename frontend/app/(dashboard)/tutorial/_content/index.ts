import { lessonMetas } from "../_engine/catalog"
import type { LessonDef, PathId } from "../_engine/types"

type PathModule = { lessons: Record<string, LessonDef> }

const pathModules: Partial<Record<PathId, () => Promise<PathModule>>> = {
	grundlagen: () => import("./grundlagen"),
	aktien: () => import("./aktien"),
	etfs: () => import("./etfs"),
	psychologie: () => import("./psychologie"),
	anleihen: () => import("./anleihen"),
	portfolio: () => import("./portfolio"),
	krypto: () => import("./krypto"),
	"krypto-vertiefung": () => import("./krypto_vertiefung"),
	rohstoffe: () => import("./rohstoffe"),
	"rohstoffe-vertiefung": () => import("./rohstoffe_vertiefung"),
}

/** lessonId -> dynamic import of that lesson's content. */
export const lessonLoaders: Record<string, () => Promise<LessonDef>> =
	Object.fromEntries(
		lessonMetas.flatMap(meta => {
			const load = pathModules[meta.pathId]
			if (!load) return []
			return [
				[
					meta.id,
					async () => {
						const lesson = (await load()).lessons[meta.id]
						if (!lesson) throw new Error(`Missing lesson content: ${meta.id}`)
						return lesson
					},
				],
			]
		})
	)

export function loadLesson(lessonId: string): Promise<LessonDef> {
	const loader = lessonLoaders[lessonId]
	if (!loader) return Promise.reject(new Error(`Unknown lesson: ${lessonId}`))
	return loader()
}
