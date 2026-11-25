import type { ReactNode } from "react"

/**
 * Server-only content (e.g. world_map.tsx) that client lessons cannot import.
 * lessonId -> slotName -> renderer. The lesson page renders every slot of the
 * lesson and passes the nodes to the client player; a `card` step references
 * one by `slot: "<slotName>"`.
 */
export type ServerSlot = () => ReactNode | Promise<ReactNode>

export const serverSlots: Record<string, Record<string, ServerSlot>> = {}
