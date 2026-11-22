import "server-only"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Client } from "@/database/custom_types"
import type { Database } from "@/database/types"

/**
 * Service-role client for the GoTrue admin API. Bypasses RLS: server only
 * ("server-only" above) and without the user's session cookies, so it never
 * mixes the user's identity with the service role. Check permissions with
 * the user's own client (lib/admin_actions.ts) before using it.
 *
 * The key comes from a non-NEXT_PUBLIC_ variable so Next.js can never inline
 * it into browser code; the old NEXT_PUBLIC_ name is still accepted until the
 * env files are renamed.
 */
export async function createClient(): Promise<Client> {
	const url = process.env.NEXT_PUBLIC_SUPABASE_SERVER_URL
	const key =
		process.env.SUPABASE_SERVICE_ROLE_KEY ??
		process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY

	if (!url || !key) {
		throw new Error("Missing Supabase credentials")
	}

	return createSupabaseClient<Database>(url, key, {
		auth: { persistSession: false, autoRefreshToken: false },
	}) as unknown as Client
}
