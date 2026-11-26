import type { LessonDef } from "../../_engine/types"
import { checkpoint } from "./checkpoint"
import { risikenFallen } from "./risiken_fallen"
import { schwankungen } from "./schwankungen"
import { wasIstKrypto } from "./was_ist_krypto"

export const lessons: Record<string, LessonDef> = Object.fromEntries(
	[wasIstKrypto, schwankungen, risikenFallen, checkpoint].map(l => [l.id, l])
)
