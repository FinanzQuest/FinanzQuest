"use client"
import { LogOut, UserIcon } from "lucide-react"
import { logout } from "@/app/(auth)/actions"
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
}: {
	collapsed?: boolean
	/** loaded by the dashboard layout */
	user: { name: string | null; email: string | null } | null
}) {
	const userData = user
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
		<DropdownMenu>
			{trigger}
			<DropdownMenuContent side="right" align="start" sideOffset={10}>
				<DropdownMenuGroup>
					<DropdownMenuLabel>
						<div className="text-base text-foreground">{userData?.name}</div>
						<div>{userData?.email}</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem variant="destructive" onClick={() => logout()}>
						<LogOut />
						Logout
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
