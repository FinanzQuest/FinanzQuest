import "@/app/globals.css"
import "./layout.css"

import type { Metadata } from "next"
import type React from "react"
import { Suspense } from "react"
import {
	AppSidebar,
	type SidebarData,
} from "@/components/navbar/desktop/sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { getServerClient, getUser } from "@/lib/auth"
import { hasSpecialRoles } from "@/lib/db"
import { getActiveDepot, getUserDepots } from "@/lib/depots"
export const metadata: Metadata = {
	title: "FinanzQuest",
	description: "FinanzQuest",
}

/**
 * Sidebar data, loaded on the server on a full page load and whenever the
 * route is refreshed (e.g. after selectDepot); shares the request's cached
 * getUser() / depots with the page.
 */
async function getSidebarData(): Promise<SidebarData> {
	const { user } = await getUser()
	if (!user) {
		return { user: null, isTeacher: false, depots: [], activeDepotId: null }
	}
	const [roles, depots, active] = await Promise.all([
		hasSpecialRoles(["teacher"], await getServerClient()),
		getUserDepots(),
		getActiveDepot(),
	])
	return {
		user: {
			name: (user.user_metadata?.name as string | undefined) ?? null,
			email: user.email ?? null,
		},
		isTeacher: roles.hasPermission === true,
		depots,
		activeDepotId: active?.id ?? null,
	}
}

/** Sidebar with the user's data; streams in after the static shell. */
async function Sidebar() {
	return <AppSidebar data={await getSidebarData()} />
}

export default function DashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<>
			<SidebarProvider className="h-svh overflow-hidden flex-col md:flex-row">
				<Suspense fallback={<AppSidebar data={null} />}>
					<Sidebar />
				</Suspense>
				{/* each route's loading.tsx shows its page-shaped skeleton */}
				<div className="flex-1 min-h-0 min-w-0 w-full overflow-hidden">
					{children}
				</div>
			</SidebarProvider>
			<Toaster />
		</>
	)
}
