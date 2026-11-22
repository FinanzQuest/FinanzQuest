"use server"

// Every export of a "use server" file is a public endpoint: only the actions
// the forms call are exported; helpers stay module-private.

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { clearActiveDepotId, setActiveDepotId } from "@/lib/depot_cookie/server"
import { createClient } from "@/utils/supabase/server"

export async function loginRedirect(email: string, password: string) {
	const client = await createClient()
	const { error } = await client.auth.signInWithPassword({
		email,
		password,
	})

	if (error) {
		return error.message
	}

	// a previous user's depot cookie does not apply; the first depot is active
	await clearActiveDepotId()

	revalidatePath("/", "layout")
	redirect("/")
}

export async function createDepotRedirect(name?: string) {
	const client = await createClient()
	const { data, error } = await client.auth.getUser()

	if (error || !data.user) {
		return { message: error?.message ?? "Could not fetch user" }
	}

	const res = await client.schema("depots").rpc("new_depot_for_user", {
		p_user_id: data.user.id,
		// empty -> random friendly name (database default)
		p_name: name?.trim() || undefined,
	})

	if (res.error) {
		return { message: res.error.message }
	}
	if (!res.data) {
		return { message: "Depot not found" }
	}

	// the new depot becomes the active one
	await setActiveDepotId(res.data, data.user.id)
	revalidatePath("/", "layout")
	redirect("/")
}

export async function signUpRedirect(
	fullName: string,
	email: string,
	password: string
) {
	const client = await createClient()
	const { error } = await client.auth.signUp({
		email,
		password,
		options: { data: { name: fullName } },
	})

	if (error) {
		return { message: error.message }
	}

	await clearActiveDepotId()
	revalidatePath("/", "layout")
	redirect("/")
}

export async function logout() {
	const client = await createClient()

	await clearActiveDepotId()
	await client.auth.signOut()
	revalidatePath("/", "layout")
	redirect("/login")
}
