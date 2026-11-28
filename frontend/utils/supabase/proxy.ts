import { createServerClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"
import { jwtVerify } from "jose"
import { type NextRequest, NextResponse } from "next/server"
import type { Database } from "@/database/types"

/** Reachable without a session (login, sign-up, guest start, e-mail confirmation, errors). */
const PUBLIC_PATHS = ["/login", "/signup", "/try", "/confirm", "/error"]

function isPublic(pathname: string) {
	return PUBLIC_PATHS.some(
		path => pathname === path || pathname.startsWith(`${path}/`)
	)
}

// GoTrue signs access tokens with the shared JWT secret (HS256). With the
// secret, the proxy verifies them locally; without it, getClaims() has to ask
// GoTrue on every request — including every route prefetch.
const jwtSecret = process.env.SUPABASE_JWT_SECRET
	? new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET)
	: null

async function sessionUserId(
	supabase: SupabaseClient<Database>
): Promise<string | null> {
	if (!jwtSecret) {
		const { data } = await supabase.auth.getClaims()
		return (data?.claims?.sub as string | undefined) ?? null
	}
	// Reads the session cookie; refreshes (one GoTrue call) only when the
	// access token has expired. The token is then verified here: signature and
	// expiry. Pages still verify the user with GoTrue once per render.
	const {
		data: { session },
	} = await supabase.auth.getSession()
	if (!session) return null
	try {
		const { payload } = await jwtVerify(session.access_token, jwtSecret, {
			algorithms: ["HS256"],
		})
		return payload.sub ?? null
	} catch {
		return null
	}
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

	// Nothing between createServerClient and the session check: it refreshes
	// an expired session; code in between risks random logouts.
	const userId = await sessionUserId(supabase)

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
