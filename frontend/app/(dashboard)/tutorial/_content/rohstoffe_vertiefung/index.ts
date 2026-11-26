import type { LessonDef } from "../../_engine/types"
import { checkpoint } from "./checkpoint"
import { futuresContango } from "./futures_contango"
import { rohstoffeImPortfolio } from "./rohstoffe_im_portfolio"

export const lessons: Record<string, LessonDef> = Object.fromEntries(
	[rohstoffeImPortfolio, futuresContango, checkpoint].map(l => [l.id, l])
)
