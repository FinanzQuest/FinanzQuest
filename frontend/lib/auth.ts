import "server-only"
import { connection } from "next/server"
import { cache } from "react"
import { createClient } from "@/utils/supabase/server"

/**
 * The Supabase server client of the current request. React `cache` makes it
 * one client per server render instead of one per helper. The client is
 * per request: `connection()` keeps it (the auth client reads the clock
 * before the cookies) and everything built on it out of the prerender.
 */
export const getServerClient = cache(async () => {
	await connection()
	return createClient()
})

/**
 * The logged-in user, verified with the auth server once per request: layout,
 * page and helpers share the result instead of each calling `getUser()`.
 */
export const getUser = cache(async () => {
	const client = await getServerClient()
	const { data, error } = await client.auth.getUser()
	return { user: data.user, error }
})
