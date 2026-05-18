import type { SupabaseClient } from "@supabase/supabase-js"
import type { NextRequest, NextResponse } from "next/server"
import { updateSession } from "@/utils/supabase/proxy"
import type { Database } from "./database/types"
import { getDepotDefaultId } from "./lib/db"
import { decodeDepotCookie } from "./lib/depot_cookie/encode"
import { newActiveDepotCookie } from "./lib/depot_cookie/server"
import { createClient } from "./utils/supabase/server"

async function tryGetDepotFromCookie(request: NextRequest) {
	const cookie = request.cookies.get("activeDepotId")
	if (!cookie) {
		return null
	}
	const client = await createClient()
	const userId = (await client.auth.getUser()).data.user?.id
	if (!userId) {
		return null
	}
	const { depotId, valid } = await decodeDepotCookie(cookie.value, userId)
	if (!valid) {
		console.log("cookie invalid", cookie.value, userId)
		return null
	}
	console.log("cookie valid", cookie.value, userId)
	return depotId
}

async function tryGetDepotFromSearchParams(request: NextRequest) {
	const depotId = request.nextUrl.searchParams.get("depot")
	if (!depotId) {
		return null
	}
	const parsedDepotId = Number.parseInt(depotId, 10)
	if (Number.isNaN(parsedDepotId)) {
		return null
	}

	return parsedDepotId
}

async function tryUpdateDepotId(
	client: SupabaseClient<Database>,
	response: NextResponse,
	depotId: number
) {
	const userId = (await client.auth.getUser()).data.user?.id
	if (!userId) {
		return false
	}
	const cookie = await newActiveDepotCookie(depotId, userId)
	response.cookies.set(cookie.name, cookie.value)
	return true
}

export async function proxy(request: NextRequest) {
	const response = await updateSession(request)
	const client = await createClient()
	const depotId = await tryGetDepotFromSearchParams(request)
		.then(depotId => {
			console.log("depotId proxy is ", depotId)
			return depotId ?? tryGetDepotFromCookie(request)
		})
		.then(async depotId => {
			console.log("depotId proxy is ", depotId)
			return depotId ?? (await getDepotDefaultId(client)).depotId
		})

	if (depotId) {
		await tryUpdateDepotId(client, response, depotId)
	}
	return response
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * Feel free to modify this pattern to include more paths.
		 */
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
}
