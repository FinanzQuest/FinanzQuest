"use server"

// Every export of a "use server" file is a public endpoint: only the actions
// the forms call are exported; helpers stay module-private.

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getDepotDefaultId } from "@/lib/db"
import { clearActiveDepotId } from "@/lib/depot_cookie/server"
import { createClient } from "@/utils/supabase/server"

export async function loginRedirect(email: string, password: string) {
	const client = await createClient()
	const { data, error } = await client.auth.signInWithPassword({
		email,
		password,
	})

	if (error) {
		return error.message
	}

	await clearActiveDepotId()
	const depot = (await getDepotDefaultId(client, data.user.id)).depotId

	revalidatePath("/", "layout")
	redirect(depot ? `/?depot=${depot}` : "/")
}

export async function createDepotRedirect() {
	const client = await createClient()
	const { data, error } = await client.auth.getUser()

	if (error || !data.user) {
		return { message: error?.message ?? "Could not fetch user" }
	}

	const res = await client
		.schema("depots")
		.rpc("new_depot_for_user", { p_user_id: data.user.id })

	if (res.error) {
		return { message: res.error.message }
	}
	if (!res.data) {
		return { message: "Depot not found" }
	}

	redirect(`/?depot=${res.data}`)
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
