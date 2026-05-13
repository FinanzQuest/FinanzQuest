"use server"
import { cookies } from "next/headers"
import { decodeDepotCookie, encodeDepotCookie } from "./encode"

const EXPIRES = 24 * 3600 * 1000

export async function newActiveDepotCookie(id: number, userId: string) {
	const encoded = await encodeDepotCookie(id, userId)
	return {
		name: "activeDepotId",
		value: encoded,
		expires: Date.now() + EXPIRES,
		path: "/",
		sameSite: "lax" as "lax",
		httpOnly: false,
	}
}

export async function setActiveDepotId(id: number, userId: string) {
	const cookieStore = await cookies()
	cookieStore.set(await newActiveDepotCookie(id, userId))
}

export async function clearActiveDepotId() {
	const cookieStore = await cookies()
	cookieStore.delete("activeDepotId")
}

export async function getActiveDepotId(userId: string) {
	const cookieStore = await cookies()
	const activeDepotId = cookieStore.get("activeDepotId")
	const encoded = activeDepotId?.value

	if (!encoded) return null

	const { depotId, valid } = await decodeDepotCookie(encoded, userId)

	if (!valid || !depotId) return null
	return depotId
}
