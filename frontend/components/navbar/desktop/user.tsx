"use client"
import { LogOut, UserIcon } from "lucide-react"
import { useState } from "react"
import { logout } from "@/app/(auth)/actions"
import SimpleAlertDialog from "@/components/simple_alert_dialog"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function User({
	collapsed,
	user,
	isGuest = false,
}: {
	collapsed?: boolean
	/** loaded by the dashboard layout */
	user: { name: string | null; email: string | null } | null
	isGuest?: boolean
}) {
	const [confirmOpen, setConfirmOpen] = useState(false)
	const userData = isGuest ? { name: "Gast", email: null } : user
	const trigger = collapsed ? (
		<DropdownMenuTrigger className="aspect-square rounded-lg flex flex-row outline-none text-sm border-input gap-1 items-center overflow-hidden">
			<UserIcon className="size-6 mx-auto my-auto" />
		</DropdownMenuTrigger>
	) : (
		<DropdownMenuTrigger className="rounded-t-2xl border-b flex flex-row outline-none text-sm border-input gap-1 items-center overflow-hidden">
			<div className="flex flex-col items-start overflow-hidden px-3 p-2">
				<div className="text-sm">{userData?.name}</div>
				<div className="text-muted-foreground text-xs font-normal text-ellipsis w-full overflow-hidden">
					{userData?.email}
				</div>
			</div>
		</DropdownMenuTrigger>
	)

	return (
		<>
			<DropdownMenu>
				{trigger}
				<DropdownMenuContent side="right" align="start" sideOffset={10}>
					<DropdownMenuGroup>
						<DropdownMenuLabel>
							<div className="text-base text-foreground">{userData?.name}</div>
							<div>{userData?.email}</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							variant="destructive"
							onClick={() => (isGuest ? setConfirmOpen(true) : logout())}
						>
							<LogOut />
							Logout
						</DropdownMenuItem>
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>
			<SimpleAlertDialog
				open={confirmOpen}
				onOpenChange={setConfirmOpen}
				title="Als Gast abmelden?"
				description="Dein Gast-Depot geht verloren, wenn du dich abmeldest. Erstelle zuerst ein Konto, um es zu behalten."
				confirm="Abmelden"
				cancel="Abbrechen"
				onConfirm={() => logout()}
			/>
		</>
	)
}
