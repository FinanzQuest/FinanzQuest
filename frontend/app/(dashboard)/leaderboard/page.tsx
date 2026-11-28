import { Minus, TriangleIcon } from "lucide-react"
import { cacheLife, cacheTag } from "next/cache"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ErrorCard } from "@/components/cards/cards"
import { PageShell } from "@/components/page_shell"
import ChangeStat from "@/components/stat/change_stat"
import type { LeaderboardRow, SearchParams } from "@/database/custom_types"
import { getUser } from "@/lib/auth"
import { currencyFormatFixedLength } from "@/lib/cash_display_string"
import { getDepotIdWithInspect } from "@/lib/get_depot_id"
import { cn } from "@/lib/utils"
import { createPublicClient } from "@/utils/supabase/public"
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

	const [{ leaderboard, depot }, { user }] = await Promise.all([
		dataFetcher(depotId),
		getUser(),
	])
	const isGuest = user?.is_anonymous === true

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
		<PageShell>
			{isGuest ? (
				<p className="text-sm text-muted-foreground">
					Als Gast erscheinst du nicht in der Rangliste.{" "}
					<Link href="/signup" className="underline underline-offset-2">
						Konto erstellen
					</Link>
				</p>
			) : (
				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						<span className="text-sm text-muted-foreground">
							Deine Position{depot.data?.name && ` · ${depot.data.name}`}
						</span>
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
			)}
			<div className="flex flex-col w-full border rounded-2xl divide-y divide-border/50 overflow-hidden">
				{leaderboard.data.map(row => (
					<LeaderboardEntry
						key={row.id}
						row={row}
						own={row.id === depot.data?.id}
					/>
				))}
			</div>
		</PageShell>
	)
}

function LeaderboardEntry({
	row,
	own,
}: {
	row: LeaderboardRow
	/** the viewer's active depot: highlighted */
	own: boolean
}) {
	const rankChange = row.prev_rank && row.rank ? row.prev_rank - row.rank : null
	const isRising = rankChange != null && rankChange > 0

	const rankIndicator = (() => {
		if (row.prev_rank == null)
			return (
				<div
					className="size-2 rounded-full self-center bg-overlay-1"
					title="Neu"
				/>
			)
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
	const userNames = (row.users ?? [])
		.map(user => user.name)
		.filter(Boolean)
		.join(", ")

	return (
		<div
			className={cn(
				"grid items-center gap-x-4 px-4 py-3 hover:bg-muted/40",
				"grid-cols-[2.75rem_minmax(0,1fr)_auto] sm:grid-cols-[3.5rem_minmax(0,1fr)_auto_5rem] md:grid-cols-[4rem_minmax(0,1fr)_9rem_12rem]",
				own && "bg-muted/60"
			)}
			aria-current={own ? "true" : undefined}
		>
			<div className="flex flex-row items-center gap-2">
				{rankIndicator}
				<span className="text-sm text-muted-foreground number">
					#{row.rank}
				</span>
			</div>
			<div className="flex flex-col min-w-0">
				<span className="truncate font-medium">
					{row.name}
					{own && (
						<span className="text-muted-foreground font-normal"> · du</span>
					)}
				</span>
				{userNames && (
					<span className="truncate text-sm text-muted-foreground">
						{userNames}
					</span>
				)}
			</div>
			<div className="number text-right tabular-nums text-sm md:text-base">
				{row.value != null && currencyFormatFixedLength.format(row.value)}
			</div>
			<div className="hidden sm:block">
				{row.sparkline && (
					<Sparkline
						data={row.sparkline}
						startValue={row.cash_start as number}
					/>
				)}
			</div>
		</div>
	)
}

/**
 * The leaderboard is public and the same for every user: cached for a
 * minute across all requests ("use cache"), instead of one query per user
 * and auto-refresh.
 */
async function getLeaderboard(): Promise<{
	rows: LeaderboardRow[] | null
	error: string | null
}> {
	"use cache"
	cacheLife("minutes")
	cacheTag("leaderboard")
	const { data, error } = await createPublicClient()
		.schema("depots")
		.from("leaderboard")
		.select("*")
	return {
		rows: data as LeaderboardRow[] | null,
		error: error?.message ?? null,
	}
}

const dataFetcher = async (depotId: number) => {
	const { user } = await getUser()
	if (!user) {
		redirect("/login")
	}

	const { rows, error } = await getLeaderboard()
	return {
		leaderboard: { data: rows, error: error ? new Error(error) : null },
		depot: { data: rows?.find(row => row.id === depotId) ?? null },
	}
}
