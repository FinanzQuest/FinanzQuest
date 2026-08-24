import { Minus, TriangleIcon } from "lucide-react"
import { redirect } from "next/navigation"
import { ErrorCard } from "@/components/cards/cards"
import ChangeStat from "@/components/stat/change_stat"
import type { LeaderboardRow, SearchParams } from "@/database/custom_types"
import { currencyFormatFixedLength } from "@/lib/cash_display_string"
import { getDepotIdWithInspect } from "@/lib/get_depot_id"
import { cn } from "@/lib/utils"
import { createClient } from "@/utils/supabase/server"
import { Sparkline } from "./sparkline"

export default async function Page(props: {
	searchParams: Promise<SearchParams>
}) {
	const searchParams = await props.searchParams
	const { depotId, error: depotIdError } =
		await getDepotIdWithInspect(searchParams)
	if (depotIdError) {
		return <ErrorCard error={depotIdError} />
	}

	const { leaderboard, depot } = await dataFetcher(depotId)

	if (leaderboard.error || !leaderboard.data) {
		return (
			<ErrorCard
				error={leaderboard.error || new Error("Error fetching Data")}
			/>
		)
	}

	const rankChange =
		depot.data?.rank && depot.data?.prev_rank
			? depot.data?.prev_rank - depot.data?.rank
			: null

	const isRising = rankChange !== null && rankChange > 0

	const rankIndicator = (() => {
		if (rankChange === null || rankChange === 0)
			return <Minus className="size-4 text-muted-foreground self-center" />

		return (
			<div className="flex flex-row items-center gap-1.5">
				<TriangleIcon
					className={cn(
						"size-3.5 fill-current self-center",
						isRising ? "text-win" : "text-loss rotate-180"
					)}
				/>
				<span className="text-xl font-semibold number tabular-nums">
					{rankChange !== null && Math.abs(rankChange)}
				</span>
			</div>
		)
	})()

	return (
		<main className="w-full max-h-screen overflow-y-scroll px-4 md:px-8 py-6 flex flex-col gap-8">
			<div className="flex flex-col gap-4">
				<div className="flex flex-col gap-2">
					<span className="text-sm text-muted-foreground">Deine Position</span>
					<span className="text-[clamp(2.5rem,6vw,4rem)] leading-none font-extrabold number tabular-nums tracking-tight">
						#{depot.data?.rank}
					</span>
				</div>
				<div className="flex flex-row gap-x-10 gap-y-4 flex-wrap">
					<ChangeStat
						label="Depotwert"
						value={depot.data?.value ?? 0}
						neutral
					/>
					<div className="flex flex-col gap-1">
						<span className="text-sm uppercase tracking-wide text-muted-foreground">
							Veränderung
						</span>
						{rankIndicator}
					</div>
				</div>
			</div>
			<div className="grid grid-cols-[auto_auto_1fr_1fr_minmax(200px,_max-content)] w-full border rounded-2xl divide-y divide-border/50 gap-x-6">
				{leaderboard.data.map(row => (
					<LeaderboardEntry key={row.id} row={row} />
				))}
			</div>
		</main>
	)
}

function LeaderboardEntry({ row }: { row: LeaderboardRow }) {
	const rankChange = row.prev_rank && row.rank ? row.prev_rank - row.rank : null
	const isRising = rankChange != null && rankChange > 0

	const rankIndicator = (() => {
		if (row.prev_rank == null)
			return <div className="size-2 rounded-full self-center bg-blue-500" />
		if (rankChange === 0)
			return <Minus className="size-3 text-muted-foreground self-center" />

		return (
			<TriangleIcon
				className={cn(
					"size-2 fill-current self-center",
					isRising ? "text-win" : "text-loss rotate-180"
				)}
			/>
		)
	})()
	const userNames = row.users?.map((user, index) => {
		const isLast = row.users && index === row.users.length - 1
		return (
			<span key={user.user_id}>
				{user.name}
				{!isLast && ", "}
			</span>
		)
	})

	return (
		<div
			className={cn(
				"grid grid-cols-subgrid col-span-5 items-center px-4 hover:bg-muted/40"
			)}
		>
			<div className="grid grid-cols-subgrid py-4 col-span-4 self-stretch">
				<div className="flex flex-row items-center gap-2">
					{rankIndicator}
					<span className="text-sm text-muted-foreground number">
						#{row.rank}
					</span>
				</div>
				<div>Depot {row.id}</div>
				<div>{userNames}</div>
				<div className="number text-right tabular-nums">
					{row.value && currencyFormatFixedLength.format(row.value)}
				</div>
			</div>
			{row.sparkline && (
				<Sparkline
					className="self-center"
					data={row.sparkline}
					startValue={row.cash_start as number}
				/>
			)}
		</div>
	)
}

const dataFetcher = async (depotId: number) => {
	const client = await createClient()
	const user = (await client.auth.getUser()).data.user

	if (!user) {
		redirect("/login")
	}

	const [depot_entry, leaderboard_response] = await Promise.all([
		client
			.schema("depots")
			.from("leaderboard")
			.select("*")
			.eq("id", depotId)
			.limit(1)
			.maybeSingle(),
		client.schema("depots").from("leaderboard").select("*"),
	])
	return { leaderboard: leaderboard_response, depot: depot_entry }
}
