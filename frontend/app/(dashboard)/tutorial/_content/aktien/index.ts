import type { LessonDef } from "../../_engine/types"
import { chartsLesen } from "./charts_lesen"
import { checkpoint } from "./checkpoint"
import { kgvKbvDividende } from "./kgv_kbv_dividende"
import { risikoKennzahlen } from "./risiko_kennzahlen"
import { unternehmenBewerten } from "./unternehmen_bewerten"

export const lessons: Record<string, LessonDef> = Object.fromEntries(
	[
		unternehmenBewerten,
		kgvKbvDividende,
		risikoKennzahlen,
		chartsLesen,
		checkpoint,
	].map(l => [l.id, l])
)
