"use server"

import { getUser } from "./auth"
import { setActiveDepotId } from "./depot_cookie/server"
import { getUserDepots } from "./depots"

/**
 * Makes one of the user's depots the active one. Setting the cookie in a
 * server action re-renders the current route, so page and sidebar switch
 * together.
 */
export async function selectDepot(depotId: number) {
	const { user } = await getUser()
	if (!user) return { error: { message: "Nicht angemeldet" } }
	const depots = await getUserDepots()
	if (!depots.some(depot => depot.id === depotId)) {
		return { error: { message: "Depot nicht gefunden" } }
	}
	await setActiveDepotId(depotId, user.id)
	return {}
}
