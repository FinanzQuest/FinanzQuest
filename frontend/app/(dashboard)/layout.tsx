import "@/app/globals.css"
import "./layout.css"

import type { Metadata } from "next"
import { connection } from "next/server"
import type React from "react"
import { Suspense } from "react"
import { GuestBanner } from "@/components/guest_banner"
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
	// per user and per request: never part of the prerendered shell (the
	// auth client reads the clock before the cookies)
	await connection()
	const { user } = await getUser()
	if (!user) {
		return {
			user: null,
			isTeacher: false,
			isGuest: false,
			depots: [],
			activeDepotId: null,
		}
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
		isGuest: user.is_anonymous === true,
		depots,
		activeDepotId: active?.id ?? null,
	}
}

/** Banner for guests only; streams in with the user. */
async function GuestNotice() {
	const { user } = await getUser()
	return user?.is_anonymous ? <GuestBanner /> : null
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
				<div className="flex-1 min-h-0 min-w-0 w-full overflow-hidden flex flex-col">
					<Suspense fallback={null}>
						<GuestNotice />
					</Suspense>
					<div className="flex-1 min-h-0">{children}</div>
				</div>
			</SidebarProvider>
			{/* phones: above the bottom tab bar */}
			<Toaster
				mobileOffset={{ bottom: "calc(4.5rem + env(safe-area-inset-bottom))" }}
			/>
		</>
	)
}
