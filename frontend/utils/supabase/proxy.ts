import { createServerClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"
import type { Database } from "@/database/types"

/** Reachable without a session (login, sign-up, e-mail confirmation, errors). */
const PUBLIC_PATHS = ["/login", "/signup", "/confirm", "/error"]

function isPublic(pathname: string) {
	return PUBLIC_PATHS.some(
		path => pathname === path || pathname.startsWith(`${path}/`)
	)
}

/**
 * Refreshes the Supabase session cookies and checks the session once per
 * request. Returns the response to send (with refreshed cookies, or a redirect
 * to /login), the request-bound client and the user id for further work.
 */
export async function updateSession(request: NextRequest): Promise<{
	response: NextResponse
	supabase: SupabaseClient<Database>
	userId: string | null
}> {
	let response = NextResponse.next({ request })

	const url = process.env.NEXT_PUBLIC_SUPABASE_SERVER_URL
	const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
	if (!url || !key) {
		throw new Error("Missing Supabase credentials")
	}

	const supabase = createServerClient<Database>(url, key, {
		cookies: {
			getAll() {
				return request.cookies.getAll()
			},
			setAll(
				cookiesToSet: {
					name: string
					value: string
					options: Parameters<NextResponse["cookies"]["set"]>[2]
				}[]
			) {
				for (const { name, value } of cookiesToSet) {
					request.cookies.set(name, value)
				}
				response = NextResponse.next({ request })
				for (const { name, value, options } of cookiesToSet) {
					response.cookies.set(name, value, options)
				}
			},
		},
	}) as unknown as SupabaseClient<Database>

	// Nothing between createServerClient and getClaims: it refreshes an
	// expired session; code in between risks random logouts.
	const { data } = await supabase.auth.getClaims()
	const userId = (data?.claims?.sub as string | undefined) ?? null

	if (!userId && !isPublic(request.nextUrl.pathname)) {
		const loginUrl = request.nextUrl.clone()
		loginUrl.pathname = "/login"
		loginUrl.search = ""
		return { response: NextResponse.redirect(loginUrl), supabase, userId }
	}

	// Callers must return this response (or copy its cookies), otherwise the
	// refreshed session is lost and the user gets logged out.
	return { response, supabase, userId }
}
