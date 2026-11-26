import type { LessonDef } from "../../_engine/types"
import { capm } from "./capm"
import { checkpoint } from "./checkpoint"
import { efficientFrontier } from "./efficient_frontier"
import { kovarianzKorrelation } from "./kovarianz_korrelation"
import { optionenGriechen } from "./optionen_griechen"
import { renditeVolatilitaetMathe } from "./rendite_volatilitaet_mathe"
import { sharpeAlphaBeta } from "./sharpe_alpha_beta"

export const lessons: Record<string, LessonDef> = Object.fromEntries(
	[
		renditeVolatilitaetMathe,
		kovarianzKorrelation,
		sharpeAlphaBeta,
		efficientFrontier,
		capm,
		optionenGriechen,
		checkpoint,
	].map(l => [l.id, l])
)
