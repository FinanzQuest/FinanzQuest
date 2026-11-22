import "server-only"
import { createClient } from "@supabase/supabase-js"
import type { Client } from "@/database/custom_types"
import type { Database } from "@/database/types"

/**
 * Anonymous client without the user's cookies, for public data (prices,
 * assets, leaderboard). Usable inside "use cache" scopes, which must not read
 * cookies: the cached result is shared by all users.
 */
export function createPublicClient(): Client {
	const url = process.env.NEXT_PUBLIC_SUPABASE_SERVER_URL
	const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
	if (!url || !key) {
		throw new Error("Missing Supabase credentials")
	}
	return createClient<Database>(url, key, {
		auth: { persistSession: false, autoRefreshToken: false },
	}) as unknown as Client
}
