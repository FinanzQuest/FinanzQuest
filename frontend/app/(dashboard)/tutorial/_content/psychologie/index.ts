import type { LessonDef } from "../../_engine/types"
import { checkpoint } from "./checkpoint"
import { crashs } from "./crashs"
import { einmalVsSparplan } from "./einmal_vs_sparplan"
import { panikSimulation } from "./panik_simulation"
import { rebalancing } from "./rebalancing"
import { timeInMarket } from "./time_in_market"

export const lessons: Record<string, LessonDef> = Object.fromEntries(
	[
		crashs,
		panikSimulation,
		timeInMarket,
		einmalVsSparplan,
		rebalancing,
		checkpoint,
	].map(l => [l.id, l])
)
