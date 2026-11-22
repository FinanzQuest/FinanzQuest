import "@/app/globals.css"
import "./layout.css"

import type { Metadata } from "next"
import type React from "react"
import { Suspense } from "react"
import PageLoader from "@/components/loaders/page_loader"
import {
	AppSidebar,
	type SidebarData,
} from "@/components/navbar/desktop/sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { getServerClient, getUser } from "@/lib/auth"
import { hasSpecialRoles } from "@/lib/db"
import { getActiveDepotId } from "@/lib/depot_cookie/server"
export const metadata: Metadata = {
	title: "FinanzQuest",
	description: "FinanzQuest",
}

/**
 * Sidebar data, loaded once per full page load on the server (the layout is
 * kept across client navigations); shares the request's cached getUser()
 * with the page.
 */
async function getSidebarData(): Promise<SidebarData> {
	const { user } = await getUser()
	if (!user) {
		return { user: null, isTeacher: false, depotIds: [], activeDepotId: null }
	}
	const client = await getServerClient()
	const [roles, depots, activeDepotId] = await Promise.all([
		hasSpecialRoles(["teacher"], client),
		client
			.schema("depots")
			.from("depots")
			.select("id")
			.contains("users", [user.id])
			.order("id"),
		getActiveDepotId(user.id),
	])
	return {
		user: {
			name: (user.user_metadata?.name as string | undefined) ?? null,
			email: user.email ?? null,
		},
		isTeacher: roles.hasPermission === true,
		depotIds: (depots.data ?? []).map(depot => depot.id),
		activeDepotId,
	}
}

/** Sidebar with the user's data; streams in after the static shell. */
async function Sidebar() {
	return <AppSidebar data={await getSidebarData()} />
}

const emptySidebar: SidebarData = {
	user: null,
	isTeacher: false,
	depotIds: [],
	activeDepotId: null,
}

export default function DashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<>
			<SidebarProvider>
				<Suspense fallback={<AppSidebar data={emptySidebar} />}>
					<Sidebar />
				</Suspense>
				<Suspense fallback={<PageLoader />}>
					{/*<SidebarTrigger />*/}
					<div className="min-h-screen max-h-screen w-full overflow-hidden">
						{children}
					</div>
				</Suspense>
			</SidebarProvider>
			<Toaster />
		</>
	)
}
