import { ErrorCard } from "@/components/cards/cards"
import { PageShell } from "@/components/page_shell"
import { createClient } from "@/utils/supabase/server"
import { DepotTable } from "./table"

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<{ user_id?: string }>
}) {
	const { user_id } = await searchParams
	const { depots, error, profile } = await dataFetcher(user_id)

	if (error) return <ErrorCard error={error} />

	return (
		<PageShell className="gap-6 max-w-none">
			<div>
				{profile?.name && (
					<div className="text-muted-foreground">Depots von</div>
				)}
				<h1 className="text-2xl font-bold tracking-tight">
					{profile?.name ?? "Alle Depots"}
				</h1>
			</div>
			<div className="border rounded-xl p-2 bg-muted/25 w-full">
				<DepotTable className="rounded-lg bg-background" data={depots ?? []} />
			</div>
		</PageShell>
	)
}

async function dataFetcher(user_id?: string) {
	const client = await createClient()
	const [
		{ data: depots, error: depotError },
		{ data: profile, error: profileError },
	] = await Promise.all([
		client
			.schema("depots")
			.from("depot_overview")
			.select("*")
			.contains("all_ids", [user_id]),
		user_id
			? client
					.schema("users")
					.from("profile")
					.select("name")
					.eq("user_id", user_id)
					.maybeSingle()
			: Promise.resolve({ data: null, error: null }),
	])

	if (profileError || depotError || !depots) {
		return { error: null, depots: [], profile: null }
	}

	return { error: null, depots, profile }
}
