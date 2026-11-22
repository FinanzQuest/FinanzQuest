import type { NextRequest } from "next/server"
import { updateSession } from "@/utils/supabase/proxy"
import { getDepotDefaultId } from "./lib/db"
import { decodeDepotCookie } from "./lib/depot_cookie/encode"
import { newActiveDepotCookie } from "./lib/depot_cookie/server"

const DEPOT_COOKIE = "activeDepotId"

function depotFromSearchParams(request: NextRequest) {
	const value = request.nextUrl.searchParams.get("depot")
	if (!value) return null
	const parsed = Number.parseInt(value, 10)
	return Number.isNaN(parsed) ? null : parsed
}

async function hasValidDepotCookie(request: NextRequest, userId: string) {
	const cookie = request.cookies.get(DEPOT_COOKIE)
	if (!cookie) return false
	return (await decodeDepotCookie(cookie.value, userId)).valid
}

/**
 * Per request: one session check (updateSession), then the active-depot
 * cookie — only written when ?depot= selects a depot or the cookie is missing
 * or belongs to another user; otherwise the request costs no extra round trip.
 */
export async function proxy(request: NextRequest) {
	const { response, supabase, userId } = await updateSession(request)
	if (!userId || response.headers.has("location")) {
		return response
	}

	let depotId = depotFromSearchParams(request)
	if (depotId === null && !(await hasValidDepotCookie(request, userId))) {
		depotId = (await getDepotDefaultId(supabase, userId)).depotId
	}

	if (depotId !== null) {
		const cookie = await newActiveDepotCookie(depotId, userId)
		response.cookies.set(cookie)
	}
	return response
}

export const config = {
	matcher: [
		/*
		 * All paths except static files and images. Prefetches and RSC
		 * requests still pass through: keep this function cheap.
		 */
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
}
