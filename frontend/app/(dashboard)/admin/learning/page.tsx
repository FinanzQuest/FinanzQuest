import { ErrorCard } from "@/components/cards/cards"
import { PageShell } from "@/components/page_shell"
import { getServerClient } from "@/lib/auth"
import { hasSpecialRoles } from "@/lib/db"
import { usersClient } from "../../tutorial/_engine/db_types"
import { LearningTable } from "./learning_table"

export default async function Page() {
	const client = await getServerClient()
	const { error: roleError, hasPermission } = await hasSpecialRoles(
		["teacher"],
		client
	)
	if (roleError || !hasPermission) {
		return <ErrorCard error={roleError || new Error("Permission denied")} />
	}

	const { data, error } = await usersClient(client).rpc(
		"tutorial_class_overview"
	)
	if (error || !data) {
		return <ErrorCard error={new Error(error?.message ?? "No data found")} />
	}

	return (
		<PageShell className="max-w-none">
			<h1 className="text-2xl font-bold">Lernfortschritt</h1>
			<LearningTable data={data} />
		</PageShell>
	)
}
