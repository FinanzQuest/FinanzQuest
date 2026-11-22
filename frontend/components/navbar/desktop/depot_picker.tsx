"use client"
import { Briefcase } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"

/**
 * Switches the active depot. The list and the cookie's depot come from the
 * dashboard layout (server); selecting navigates with ?depot=, and the proxy
 * stores the choice in the activeDepotId cookie for later pages.
 */
export default function DepotPicker({
	collapsed,
	depotIds,
	activeDepotId,
}: {
	collapsed?: boolean
	depotIds: number[]
	activeDepotId: number | null
}) {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const fromUrl = Number.parseInt(searchParams.get("depot") ?? "", 10)
	const active = Number.isNaN(fromUrl) ? activeDepotId : fromUrl

	const trigger = collapsed ? (
		<SelectTrigger className="aspect-square! focus:ring-transparent! flex flex-row py-2 h-fit p-0">
			<Briefcase className="shrink-0 size-6" />
		</SelectTrigger>
	) : (
		<SelectTrigger className="rounded-t-none! focus:ring-transparent! w-full">
			<SelectValue placeholder="Select a depot" />
		</SelectTrigger>
	)

	return (
		<Select
			// labels for the trigger (Base UI shows the raw value otherwise)
			items={depotIds.map(id => ({
				value: id.toString(),
				label: `Depot ${id}`,
			}))}
			value={active?.toString() ?? null}
			onValueChange={value => {
				if (value === null) return
				const params = new URLSearchParams(searchParams)
				params.set("depot", value)
				params.delete("inspect_depot")
				router.push(`${pathname}?${params}`)
			}}
		>
			{trigger}
			<SelectContent align="start" side="right" sideOffset={10}>
				{depotIds.map(id => (
					<SelectItem key={id} value={id.toString()}>
						Depot {id}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
}
