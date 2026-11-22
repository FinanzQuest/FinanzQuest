import "server-only"
import type { SearchParams } from "@/database/custom_types"
import { getActiveDepot } from "./depots"

function parseDepotParam(value: string | null | undefined) {
	if (!value) return null
	const parsed = Number.parseInt(value, 10)
	return Number.isNaN(parsed) ? null : parsed
}

/**
 * Depot of the page: ?inspect_depot (teachers looking at a student's depot,
 * read-only; does not change the active depot), else the active depot.
 */
export async function getDepotIdWithInspect(params: SearchParams) {
	const inspected = parseDepotParam(params.inspect_depot)
	if (inspected !== null) {
		return { depotId: inspected, error: null, noDepot: null, isInspect: true }
	}
	return { ...(await getDepotId()), isInspect: false }
}

/** The active depot (cookie, validated against the user's depots). */
export async function getDepotId() {
	const depot = await getActiveDepot()
	if (!depot) {
		return { depotId: null, error: new Error("No depot found"), noDepot: true }
	}
	return { depotId: depot.id, error: null, noDepot: null }
}
