import "server-only"
import { cache } from "react"
import { createClient } from "@/utils/supabase/server"

/**
 * The Supabase server client of the current request. React `cache` makes it
 * one client per server render instead of one per helper.
 */
export const getServerClient = cache(createClient)

/**
 * The logged-in user, verified with the auth server once per request: layout,
 * page and helpers share the result instead of each calling `getUser()`.
 */
export const getUser = cache(async () => {
	const client = await getServerClient()
	const { data, error } = await client.auth.getUser()
	return { user: data.user, error }
})
