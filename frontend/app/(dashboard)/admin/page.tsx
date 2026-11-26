import { ErrorCard } from "@/components/cards/cards"
import { PageShell } from "@/components/page_shell"
import type { Client } from "@/database/custom_types"
import { getServerClient } from "@/lib/auth"
import { hasSpecialRoles } from "@/lib/db"
import { numberFormat } from "@/lib/util"
import { AdminUsersTable } from "./table"

export default async function Page() {
	const client = await getServerClient()
	{
		const { error, hasPermission } = await hasSpecialRoles(["teacher"], client)

		if (error || !hasPermission) {
			return <ErrorCard error={error || new Error("Permission denied")} />
		}
	}

	const { error, stats, users } = await dataFetcher(client)

	if (error) {
		return <ErrorCard error={error} />
	}

	return (
		<PageShell className="max-w-none">
			<div className="flex flex-col gap-4">
				<div className="flex flex-col gap-2">
					<span className="text-sm text-muted-foreground">Nutzerzahl</span>
					<span className="text-[clamp(2.5rem,6vw,4rem)] leading-none font-extrabold number tabular-nums tracking-tight">
						{numberFormat.format(stats.user_count)}
					</span>
				</div>
				<div className="flex flex-row gap-x-10 gap-y-4 flex-wrap">
					<div className="flex flex-col gap-1">
						<span className="text-sm uppercase tracking-wide text-muted-foreground">
							Schüler
						</span>
						<span className="text-xl font-semibold number tabular-nums">
							{numberFormat.format(stats.student_count)}
						</span>
					</div>
					<div className="flex flex-col gap-1">
						<span className="text-sm uppercase tracking-wide text-muted-foreground">
							Lehrer
						</span>
						<span className="text-xl font-semibold number tabular-nums">
							{numberFormat.format(stats.teacher_count)}
						</span>
					</div>
				</div>
			</div>
			<div className="flex flex-col gap-4 w-full grow">
				<AdminUsersTable className="bg-background rounded-lg" data={users} />
			</div>
		</PageShell>
	)
}

const dataFetcher = async (client: Client) => {
	const [
		{ data: users, error: userError },
		{ data: stats, error: statsError },
	] = await Promise.all([
		client.schema("users").from("admin_overview").select("*"),
		client.schema("users").rpc("stats").maybeSingle(),
	])

	if (userError || statsError || !users || !stats) {
		return {
			error: userError || statsError || new Error("No data found"),
			users: null,
			stats: null,
		}
	}

	return { error: null, users, stats }
}
