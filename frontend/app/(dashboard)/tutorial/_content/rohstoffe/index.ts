import type { LessonDef } from "../../_engine/types"
import { angebotNachfrage } from "./angebot_nachfrage"
import { checkpoint } from "./checkpoint"
import { goldSafeHaven } from "./gold_safe_haven"
import { wasSindRohstoffe } from "./was_sind_rohstoffe"

export const lessons: Record<string, LessonDef> = Object.fromEntries(
	[wasSindRohstoffe, goldSafeHaven, angebotNachfrage, checkpoint].map(l => [
		l.id,
		l,
	])
)
