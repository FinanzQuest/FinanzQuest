import "server-only"
import type { SearchParams } from "@/database/custom_types"
import { getServerClient, getUser } from "./auth"
import { getDepotDefaultId } from "./db"
import { getActiveDepotId } from "./depot_cookie/server"

function parseDepotParam(value: string | null | undefined) {
	if (!value) return null
	const parsed = Number.parseInt(value, 10)
	return Number.isNaN(parsed) ? null : parsed
}

/** Depot of the page: ?inspect_depot, ?depot, the depot cookie, the user's first depot. */
export async function getDepotIdWithInspect(params: SearchParams) {
	const inspected = parseDepotParam(params.inspect_depot)
	if (inspected !== null) {
		return { depotId: inspected, error: null, noDepot: null, isInspect: true }
	}

	const requested = parseDepotParam(params.depot)
	if (requested !== null) {
		return { depotId: requested, error: null, noDepot: null, isInspect: false }
	}

	return { ...(await getDepotId()), isInspect: false }
}

/** The active depot from the cookie, else the user's first depot. */
export async function getDepotId() {
	const { user } = await getUser()

	if (user) {
		const depotId = await getActiveDepotId(user.id)
		if (depotId) {
			return { depotId, error: null, noDepot: null }
		}
	}

	return await getDepotDefaultId(await getServerClient(), user?.id)
}
