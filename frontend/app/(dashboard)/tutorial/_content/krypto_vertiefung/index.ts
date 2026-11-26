import type { LessonDef } from "../../_engine/types"
import { blockchainTechnik } from "./blockchain_technik"
import { checkpoint } from "./checkpoint"
import { kryptoImPortfolio } from "./krypto_im_portfolio"

export const lessons: Record<string, LessonDef> = Object.fromEntries(
	[kryptoImPortfolio, blockchainTechnik, checkpoint].map(l => [l.id, l])
)
