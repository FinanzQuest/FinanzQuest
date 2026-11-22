import "server-only"
import { cache } from "react"
import { getServerClient, getUser } from "./auth"
import { getActiveDepotId } from "./depot_cookie/server"

export interface DepotRef {
	id: number
	name: string
}

/** The logged-in user's depots (id + name), once per request. */
export const getUserDepots = cache(async (): Promise<DepotRef[]> => {
	const { user } = await getUser()
	if (!user) return []
	const client = await getServerClient()
	const { data } = await client
		.schema("depots")
		.from("depots")
		.select("id, name")
		.contains("users", [user.id])
		.order("id")
	return data ?? []
})

/**
 * The active depot: the one in the activeDepotId cookie if it belongs to the
 * user, else their first depot (null: no depot yet). The single source of
 * truth for pages and the sidebar; changed only by selectDepot().
 */
export const getActiveDepot = cache(async (): Promise<DepotRef | null> => {
	const { user } = await getUser()
	if (!user) return null
	const [depots, cookieDepotId] = await Promise.all([
		getUserDepots(),
		getActiveDepotId(user.id),
	])
	return depots.find(depot => depot.id === cookieDepotId) ?? depots[0] ?? null
})
