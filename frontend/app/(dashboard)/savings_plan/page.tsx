import { PiggyBank } from "lucide-react"
import { ErrorCard } from "@/components/cards/cards"
import { PageShell } from "@/components/page_shell"
import ChangeStat from "@/components/stat/change_stat"
import { Button } from "@/components/ui/button"
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty"
import type { SearchParams } from "@/database/custom_types"
import { getServerClient } from "@/lib/auth"
import { currencyFormat } from "@/lib/cash_display_string"
import { getDepotIdWithInspect } from "@/lib/get_depot_id"
import { formatDateString } from "@/lib/util"
import NewEntryDialog from "./new_dialog"
import { SavingsPlanTable } from "./table"
export default async function Page(props: {
	searchParams: Promise<SearchParams>
}) {
	const searchParams = await props.searchParams
	const {
		depotId,
		error: depotIdError,
		isInspect,
	} = await getDepotIdWithInspect(searchParams)
	if (depotIdError || !depotId) {
		return (
			<ErrorCard
				error={depotIdError || new Error("Depot ID not found")}
			></ErrorCard>
		)
	}

	const { data, error, budget } = await dataFetcher(depotId)

	if (error) {
		return <ErrorCard error={error}></ErrorCard>
	}

	return (
		<PageShell>
			{budget && (
				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						<span className="text-sm text-muted-foreground">
							Monatliches Budget
						</span>
						<span className="text-[clamp(2.5rem,6vw,4rem)] leading-none font-extrabold number tabular-nums tracking-tight">
							{currencyFormat.format(budget.budget ?? 0)}
						</span>
						{budget.last_changed && (
							<span className="text-sm text-muted-foreground">
								{formatDateString(budget.last_changed)}
							</span>
						)}
					</div>
					<div className="flex flex-row gap-x-10 gap-y-4 flex-wrap">
						<ChangeStat
							label="Restbudget"
							value={budget.remaining_budget ?? 0}
						/>
						<ChangeStat
							label="Ausgaben"
							value={budget.monthly_expenses ?? 0}
							neutral
						/>
					</div>
				</div>
			)}
			<div className="flex flex-col gap-4 w-full grow">
				{data.length === 0 ? (
					<Empty>
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<PiggyBank />
							</EmptyMedia>
							<EmptyTitle>
								{isInspect ? "Der" : "Dein"} Sparplan ist leer.
							</EmptyTitle>
							<EmptyDescription>
								{isInspect
									? "Die Schüler haben noch keine Einträge erstellt."
									: "Füge einen neuen Eintrag hinzu, um mit deinem Sparplan loszulegen."}
							</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<EmptyContent>
								{!isInspect && (
									<NewEntryDialog
										depotId={depotId}
										trigger={<Button>Eintrag hinzufügen</Button>}
									/>
								)}
							</EmptyContent>
						</EmptyContent>
					</Empty>
				) : (
					<SavingsPlanTable
						depotId={depotId}
						className="bg-background !rounded-lg"
						monthlyBudget={budget?.monthly_expenses ?? undefined}
						data={data}
					/>
				)}
			</div>
		</PageShell>
	)
}

const dataFetcher = async (depotId: number) => {
	const client = await getServerClient()

	const [budgetResult, savingsPlansResult] = await Promise.all([
		client
			.schema("depots")
			.from("savings_plans_budget_overview")
			.select()
			.eq("depot_id", depotId)
			.limit(1)
			.maybeSingle(),
		client
			.schema("depots")
			.from("savings_plans_with_asset")
			.select("*")
			.eq("depot_id", depotId),
	])

	if (budgetResult.error || savingsPlansResult.error) {
		return {
			data: null,
			budget: null,
			error: budgetResult.error || (savingsPlansResult.error as Error),
		}
	}

	return {
		data: savingsPlansResult.data,
		budget: budgetResult.data,
		error: null,
	}
}
