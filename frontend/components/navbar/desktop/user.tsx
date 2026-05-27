import type { SupabaseClient } from "@supabase/supabase-js"
import { LogOut, UserIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { logout } from "@/app/(auth)/actions"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Database } from "@/database/types"
import { createClient } from "@/utils/supabase/client"

function getInitials(name: string) {
	const words = name.split(/(\s+)|(-)/)
	if (words.length === 1) return words[0].charAt(0).toUpperCase()

	const first = words[0].charAt(0).toUpperCase()
	const last = words[words.length - 1].charAt(0).toUpperCase()

	return `${first}${last}`
}

export default function User({ collapsed }: { collapsed?: boolean }) {
	const client = createClient()
	const [userData, setUserData] = useState<
		Awaited<ReturnType<typeof dataFetcher>>["data"] | null
	>(null)

	useEffect(() => {
		dataFetcher(client).then(result => {
			if (result.error) {
				console.error(result.error)
			} else {
				setUserData(result.data)
			}
		})
	}, [client])

	const trigger = collapsed ? (
		<DropdownMenuTrigger className="aspect-square rounded-lg border flex flex-row outline-none text-sm border-input gap-1 items-center overflow-hidden">
			<UserIcon className="size-6 mx-auto my-auto" />
		</DropdownMenuTrigger>
	) : (
		<DropdownMenuTrigger className="rounded-t-md border flex flex-row outline-none text-sm border-input gap-1 items-center overflow-hidden">
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
				<DropdownMenuLabel className="flex flex-row gap-3 items-center">
					<Avatar className="rounded-lg size-12 ">
						<AvatarFallback className="rounded-lg">
							{userData?.name ? getInitials(userData.name) : "?"}
						</AvatarFallback>
					</Avatar>
					<div>
						<div className="text-lg">{userData?.name}</div>
						<div className="text-muted-foreground font-normal">
							{userData?.email}
						</div>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={() => logout()}>
					<div className="flex items-center gap-4">
						<LogOut className="size-5" />
						<div>Logout</div>
					</div>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

export async function dataFetcher(client: SupabaseClient<Database>) {
	const {
		data: { user },
		error,
	} = await client.auth.getUser()

	if (error) {
		return { error, data: null }
	}

	if (!user) {
		return { error: new Error("User not found"), data: null }
	}

	return {
		data: {
			name: user.user_metadata.name,
			email: user.email,
		},
		error: null,
	}
}
