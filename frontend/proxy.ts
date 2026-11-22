import type { NextRequest } from "next/server"
import { updateSession } from "@/utils/supabase/proxy"

/**
 * Per request: refresh the session cookies and check the session (verified
 * locally, see updateSession). The active depot is resolved by the pages
 * (lib/depots.ts), not here, so requests and prefetches cost no database
 * round trip.
 */
export async function proxy(request: NextRequest) {
	const { response } = await updateSession(request)
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
