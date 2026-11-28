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

type ServerClient = Awaited<ReturnType<typeof createClient>>

/** Creates a depot, makes it the active one and redirects; else a message. */
async function createAndActivateDepot(
	client: ServerClient,
	userId: string,
	name?: string
) {
	const res = await client.schema("depots").rpc("new_depot_for_user", {
		p_user_id: userId,
		// empty -> random friendly name (database default)
		p_name: name?.trim() || undefined,
	})

	if (res.error) {
		return { message: res.error.message }
	}
	if (!res.data) {
		return { message: "Depot not found" }
	}

	await setActiveDepotId(res.data, userId)
	revalidatePath("/", "layout")
	redirect("/")
}

export async function createDepotRedirect(name?: string) {
	const client = await createClient()
	const { data, error } = await client.auth.getUser()

	if (error || !data.user) {
		return { message: error?.message ?? "Could not fetch user" }
	}

	return createAndActivateDepot(client, data.user.id, name)
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

/** After the browser-side signInAnonymously(): depot + redirect. */
export async function startGuestRedirect() {
	const client = await createClient()
	const { data, error } = await client.auth.getUser()

	if (error || !data.user) {
		return { message: error?.message ?? "Gast-Sitzung nicht gefunden" }
	}
	if (!data.user.is_anonymous) {
		return { message: "Kein Gast-Zugang" }
	}

	// reuse the guest's depot (reload, second visit); guests get only one
	const existing = await client
		.schema("depots")
		.from("depots")
		.select("id")
		.contains("users", [data.user.id])
		.order("id")
		.limit(1)
		.maybeSingle()
	if (existing.error) {
		return { message: existing.error.message }
	}

	if (existing.data) {
		await setActiveDepotId(existing.data.id, data.user.id)
		revalidatePath("/", "layout")
		redirect("/")
	}

	return createAndActivateDepot(client, data.user.id)
}

/** Turns the guest into a real account; the depot stays (same user id). */
export async function upgradeGuestRedirect(
	name: string,
	email: string,
	password: string
) {
	const client = await createClient()
	const current = await client.auth.getUser()
	if (current.error || !current.data.user?.is_anonymous) {
		return { message: "Kein Gast-Zugang" }
	}

	const { data, error } = await client.auth.updateUser({
		email,
		password,
		data: { name },
	})

	if (error) {
		if (
			error.code === "email_exists" ||
			/already (been )?registered/i.test(error.message)
		) {
			return {
				message:
					"Diese E-Mail ist bereits registriert. Logge dich stattdessen ein – dein Gast-Depot geht dabei verloren.",
			}
		}
		return { message: error.message }
	}

	// email verification enabled: the address is only pending
	if (data.user?.new_email) {
		return {
			message:
				"Bestätige deine E-Mail über den Link, den wir dir geschickt haben, um dein Konto abzuschließen.",
		}
	}

	await client.auth.refreshSession()
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
