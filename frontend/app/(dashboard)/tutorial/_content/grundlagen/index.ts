import type { LessonDef } from "../../_engine/types"
import { checkpoint } from "./checkpoint"
import { etfSparplan } from "./etf_sparplan"
import { renditeZinseszins } from "./rendite_zinseszins"
import { risikoStreuung } from "./risiko_streuung"
import { warumVorsorgen } from "./warum_vorsorgen"

const all = [
	warumVorsorgen,
	renditeZinseszins,
	risikoStreuung,
	etfSparplan,
	checkpoint,
]

export const lessons: Record<string, LessonDef> = Object.fromEntries(
	all.map(l => [l.id, l])
)
