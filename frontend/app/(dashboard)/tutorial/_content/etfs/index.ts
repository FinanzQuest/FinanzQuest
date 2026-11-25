import type { LessonDef } from "../../_engine/types"
import { checkpoint } from "./checkpoint"
import { indexBauen } from "./index_bauen"
import { indizesVergleich } from "./indizes_vergleich"
import { kostenVarianten } from "./kosten_varianten"
import { laenderSektoren } from "./laender_sektoren"

export const lessons: Record<string, LessonDef> = Object.fromEntries(
	[
		indexBauen,
		indizesVergleich,
		laenderSektoren,
		kostenVarianten,
		checkpoint,
	].map(l => [l.id, l])
)
