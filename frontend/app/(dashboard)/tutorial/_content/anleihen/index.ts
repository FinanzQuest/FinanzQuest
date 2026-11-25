import type { LessonDef } from "../../_engine/types"
import { anleihenImPortfolio } from "./anleihen_im_portfolio"
import { bonitaet } from "./bonitaet"
import { checkpoint } from "./checkpoint"
import { wieAnleihenFunktionieren } from "./wie_anleihen_funktionieren"
import { zinsenUndKurse } from "./zinsen_und_kurse"

export const lessons: Record<string, LessonDef> = Object.fromEntries(
	[
		wieAnleihenFunktionieren,
		zinsenUndKurse,
		bonitaet,
		anleihenImPortfolio,
		checkpoint,
	].map(l => [l.id, l])
)
