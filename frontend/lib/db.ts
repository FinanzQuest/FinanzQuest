import type { SupabaseClient } from "@supabase/supabase-js"
import type { SpecialRole } from "@/database/custom_types"
import type { Database } from "@/database/types"

export async function getDepotDefaultId(
	client: SupabaseClient<Database>,
	knownUserId?: string
) {
	const { error: userIdError, userId } = knownUserId
		? { error: null, userId: knownUserId }
		: await getUserId(client)
	if (userIdError)
		return {
			error: userIdError,
			depotId: null,
			noDepot: null,
		}
	const { data, error } = await client
		.schema("depots")
		.from("depots")
		.select("id")
		.contains("users", [userId])
		.order("id", { ascending: true })
		.limit(1)
		.maybeSingle()
	if (error) {
		console.error(error)
		return {
			error,
			depotId: null,
			noDepot: null,
		}
	}

	if (!data?.id) {
		return {
			error: new Error("No depot found"),
			depotId: null,
			noDepot: true,
		}
	}

	return {
		depotId: data?.id,
		error: null,
	}
}

export async function hasSpecialRoles<T extends SupabaseClient<Database>>(
	roles: SpecialRole[],
	client: T
) {
	const { error, data } = await client.schema("users").rpc("has_any_role", {
		required_roles: roles,
	})

	if (error) return { error, hasPermission: false }

	return { error: null, hasPermission: data }
}

export async function getUserId(client: SupabaseClient<Database>) {
	const {
		data: { user },
		error,
	} = await client.auth.getUser()
	if (error)
		return {
			error,
			userId: null,
		}

	const id = user?.id
	if (!id)
		return {
			error: new Error("User not found"),
			userId: null,
		}
	return {
		userId: id,
		error: null,
	}
}
