"use server"

// Teacher actions. Every export is a public server action endpoint, so each
// one checks the caller's role first — with the caller's own session (the
// RLS-bound server client), never with the service-role client — and only
// then uses the service-role client for the GoTrue admin API.

import type { Client } from "@/database/custom_types"
import { createClient as createAdminClient } from "@/utils/supabase/admin"
import { createClient as createServerClient } from "@/utils/supabase/server"
import { hasSpecialRoles } from "./db"

type ActionResult = { error?: { message: string } | null }

/** The caller's server client if they are a teacher, else an error. */
async function requireTeacher(): Promise<
	{ client: Client; error: null } | { client: null; error: { message: string } }
> {
	const client = await createServerClient()
	const { error, hasPermission } = await hasSpecialRoles(["teacher"], client)
	if (error || !hasPermission) {
		return {
			client: null,
			error: { message: error?.message ?? "Could not verify permissions" },
		}
	}
	return { client, error: null }
}

/** Plain, serializable error for the client. */
function result(error: { message: string } | null | undefined): ActionResult {
	return error ? { error: { message: error.message } } : {}
}

export async function deleteUser(id: string): Promise<ActionResult> {
	const { error } = await requireTeacher()
	if (error) return { error }
	const admin = await createAdminClient()
	return result((await admin.auth.admin.deleteUser(id)).error)
}

export async function banUser(
	id: string,
	ban_duration: string
): Promise<ActionResult> {
	const { error } = await requireTeacher()
	if (error) return { error }
	const admin = await createAdminClient()
	return result(
		(await admin.auth.admin.updateUserById(id, { ban_duration })).error
	)
}

export async function unbanUser(id: string): Promise<ActionResult> {
	return banUser(id, "none")
}

export async function updateUser(
	id: string,
	{
		email,
		user_name,
	}: Partial<{
		email: string | null
		user_name: string | null
	}>
): Promise<ActionResult> {
	if (!email && !user_name) {
		return {}
	}
	const { error } = await requireTeacher()
	if (error) return { error }

	const admin = await createAdminClient()
	const { error: updateError } = await admin.auth.admin.updateUserById(id, {
		...(email && { email }),
		user_metadata: {
			...(email && { email }),
			...(user_name && { name: user_name }),
		},
	})
	return result(updateError)
}

export async function changePassword(
	id: string,
	password: string
): Promise<ActionResult> {
	const { error } = await requireTeacher()
	if (error) return { error }
	const admin = await createAdminClient()
	return result((await admin.auth.admin.updateUserById(id, { password })).error)
}

export async function newUser({
	email,
	password,
	user_name,
}: {
	email: string
	password: string
	user_name: string
}): Promise<ActionResult> {
	const { error } = await requireTeacher()
	if (error) return { error }
	const admin = await createAdminClient()
	const { error: createError } = await admin.auth.admin.createUser({
		email,
		password,
		user_metadata: { name: user_name },
	})
	return result(createError)
}

// The rest goes through checked database functions with the caller's own
// session; the role check here only gives a clear error early.

export async function grantTeacher(user_id: string): Promise<ActionResult> {
	const { client, error } = await requireTeacher()
	if (error) return { error }
	return result(
		(await client.schema("users").rpc("grant_teacher", { p_user_id: user_id }))
			.error
	)
}

export async function revokeTeacher(user_id: string): Promise<ActionResult> {
	const { client, error } = await requireTeacher()
	if (error) return { error }
	return result(
		(await client.schema("users").rpc("revoke_teacher", { p_user_id: user_id }))
			.error
	)
}

export async function changeBudget(
	depot_id: number,
	budget: number
): Promise<ActionResult> {
	const { client, error } = await requireTeacher()
	if (error) return { error }
	return result(
		(
			await client
				.schema("depots")
				.rpc("change_budget", { p_depot_id: depot_id, p_budget: budget })
		).error
	)
}

export async function deleteDepot(depot_id: number): Promise<ActionResult> {
	const { client, error } = await requireTeacher()
	if (error) return { error }
	return result(
		(await client.schema("depots").from("depots").delete().eq("id", depot_id))
			.error
	)
}

export async function grantReward(
	depot_id: number,
	amount: number
): Promise<ActionResult> {
	const { client, error } = await requireTeacher()
	if (error) return { error }
	return result(
		(
			await client
				.schema("depots")
				.rpc("grant_reward", { p_depot_id: depot_id, p_amount: amount })
		).error
	)
}
