"use client"
import { Briefcase } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useOptimistic, useTransition } from "react"
import { toast } from "sonner"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { selectDepot } from "@/lib/depot_actions"

/**
 * Switches the active depot. List and active depot come from the dashboard
 * layout (server: cookie validated against the user's depots). Selecting
 * calls selectDepot(), which sets the cookie and re-renders the route, so the
 * page and this picker always agree; the picker updates optimistically.
 */
export default function DepotPicker({
	collapsed,
	depots,
	activeDepotId,
}: {
	collapsed?: boolean
	depots: { id: number; name: string }[]
	activeDepotId: number | null
}) {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const [optimisticId, setOptimisticId] = useOptimistic(activeDepotId)
	const [pending, startTransition] = useTransition()

	const trigger = collapsed ? (
		<SelectTrigger className="aspect-square! focus:ring-transparent! flex flex-row py-2 h-fit p-0">
			<Briefcase className="shrink-0 size-6" />
		</SelectTrigger>
	) : (
		<SelectTrigger className="rounded-t-none! focus:ring-transparent! w-full">
			<SelectValue placeholder="Depot wählen" />
		</SelectTrigger>
	)

	return (
		<Select
			// labels for the trigger (Base UI shows the raw value otherwise)
			items={depots.map(depot => ({
				value: depot.id.toString(),
				label: depot.name,
			}))}
			value={optimisticId?.toString() ?? null}
			disabled={pending}
			onValueChange={value => {
				if (value === null) return
				const id = Number.parseInt(value, 10)
				startTransition(async () => {
					setOptimisticId(id)
					const { error } = await selectDepot(id)
					if (error) {
						toast.error(error.message)
						return
					}
					// a teacher's ?inspect_depot view is not the active depot
					if (searchParams.has("inspect_depot")) {
						router.replace(pathname)
					}
				})
			}}
		>
			{trigger}
			<SelectContent align="start" side="right" sideOffset={10}>
				{depots.map(depot => (
					<SelectItem key={depot.id} value={depot.id.toString()}>
						{depot.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
}
