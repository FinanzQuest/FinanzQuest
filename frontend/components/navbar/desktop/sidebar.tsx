"use client"

import {
	ArrowLeftRight,
	Home,
	LayoutDashboard,
	Lightbulb,
	type LucideIcon,
	Menu,
	PiggyBank,
	SearchIcon,
	Trophy,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Suspense, useState } from "react"
import DepotPicker from "@/components/navbar/desktop/depot_picker"
import { SearchBarPopOut } from "@/components/search_bar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarTrigger,
	useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import logo from "@/public/logo.svg"
import logo_full from "@/public/logo_full.svg"
import User from "./user"

/** Loaded once on the server by the dashboard layout. */
export interface SidebarData {
	user: { name: string | null; email: string | null } | null
	isTeacher: boolean
	depotIds: number[]
	/** active depot from the cookie; ?depot= in the URL takes precedence */
	activeDepotId: number | null
}

interface ItemT {
	title: string
	url: string
	icon: LucideIcon
}

function useNavTree(isTeacher: boolean): Record<string, Array<ItemT>> {
	const tree: Record<string, Array<ItemT>> = {
		Depot: [
			{ title: "Mein Depot", url: "/", icon: Home },
			{ title: "Transaktionen", url: "/transactions", icon: ArrowLeftRight },
			{ title: "Sparplan", url: "/savings_plan", icon: PiggyBank },
		],
		Wissen: [{ title: "Tutorial", url: "/tutorial", icon: Lightbulb }],
		Wettbewerb: [{ title: "Leaderboard", url: "/leaderboard", icon: Trophy }],
	}
	if (isTeacher) {
		tree.Administration = [
			{ title: "Dashboard", url: "/admin", icon: LayoutDashboard },
		]
	}
	return tree
}

// ── Shared nav items (used in both sidebar and sheet) ────────────────────────
function NavItems({
	tree,
	collapsed = false,
}: {
	tree: Record<string, Array<ItemT>>
	collapsed?: boolean
}) {
	return Object.entries(tree).map(([label, items]) => (
		<div key={label}>
			<SidebarGroup
				className={cn(collapsed && "px-auto flex flex-col justify-center")}
				key={label}
			>
				{!collapsed && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
				<SidebarMenu className="gap-2">
					{items.map(item => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton
								variant={collapsed ? "outline" : "default"}
								render={<Link href={item.url} />}
								tooltip={item.title}
								size="default"
							>
								<item.icon className={cn(collapsed ? "size-6" : "size-6")} />
								{!collapsed && <span>{item.title}</span>}
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroup>
			{collapsed && (
				<Separator className="w-[calc(100%-4*var(--spacing))]! mx-auto" />
			)}
		</div>
	))
}

// ── Desktop sidebar (collapsible icon) ───────────────────────────────────────
function DesktopSidebar({
	tree,
	data,
}: {
	tree: Record<string, Array<ItemT>>
	data: SidebarData
}) {
	const { state } = useSidebar()
	const collapsed = state === "collapsed"

	return (
		<>
			<SidebarTrigger
				className={cn(
					"absolute top-2 z-30 hidden rounded-full border bg-background shadow-md md:inline-flex",
					collapsed ? "left-16" : "left-[17rem]"
				)}
				size="icon"
			/>
			<Sidebar
				collapsible="icon"
				className={cn(
					"bg-sidebar hidden rounded-2xl m-2 h-auto border overflow-hidden md:flex",
					collapsed ? "" : "px-1"
				)}
			>
				<SidebarHeader className={cn(" mb-3", !collapsed && "mx-1 mt-2")}>
					{!collapsed && (
						<Image
							src={logo_full}
							alt="FinanzQuest"
							className="shrink-0 grow-0 overflow-hidden"
							height={64}
						/>
					)}
					{collapsed && (
						<Image
							src={logo}
							alt="FinanzQuest"
							className="aspect-square w-full border rounded-[33%] bg-background *:fill-win overflow-hidden mb-2"
							width={100}
							height={100}
						/>
					)}
				</SidebarHeader>

				<SidebarContent className="gap-1">
					{!collapsed && (
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton
									render={
										<SearchBarPopOut
											doRedirect
											triggerRender={({ onClick }) => (
												<div className="mx-3">
													<Button
														onClick={onClick}
														className="bg-background hover:bg-background w-full flex items-center justify-start py-4 gap-2 whitespace-nowrap text-ellipsis overflow-hidden"
													>
														<SearchIcon className="size-4 shrink-0 stroke-muted-foreground" />
														<span className="text-muted-foreground shrink truncate">
															Wertpapiersuche...
														</span>
													</Button>
												</div>
											)}
										/>
									}
								/>
							</SidebarMenuItem>
						</SidebarMenu>
					)}

					{collapsed && (
						<Separator className="w-[calc(100%-4*var(--spacing))]! mx-auto" />
					)}
					{collapsed && (
						<SidebarGroup>
							<SidebarMenu>
								<SidebarMenuItem className="mx-auto">
									<SearchBarPopOut
										doRedirect
										triggerRender={({ onClick }) => (
											<SidebarMenuButton
												onClick={onClick}
												variant="outline"
												tooltip="Suche"
												className="items-center justify-center"
												size="default"
											>
												<SearchIcon className="size-6 shrink-0 aspect-square" />
											</SidebarMenuButton>
										)}
									/>
								</SidebarMenuItem>
							</SidebarMenu>
						</SidebarGroup>
					)}
					{collapsed && (
						<Separator className="w-[calc(100%-4*var(--spacing))]! mx-auto" />
					)}
					<NavItems tree={tree} collapsed={collapsed} />
				</SidebarContent>

				<SidebarFooter
					className={cn(
						"flex flex-col *:bg-background/50",
						collapsed ? "gap-2" : "gap-0"
					)}
				>
					<User collapsed={collapsed} user={data.user} />
					<Suspense fallback={null}>
						<DepotPicker
							collapsed={collapsed}
							depotIds={data.depotIds}
							activeDepotId={data.activeDepotId}
						/>
					</Suspense>
				</SidebarFooter>
			</Sidebar>
		</>
	)
}

// ── iPad portrait: topbar + hamburger sheet ──────────────────────────────────
function MobileTopbar({
	tree,
	data,
}: {
	tree: Record<string, Array<ItemT>>
	data: SidebarData
}) {
	const [open, setOpen] = useState(false)

	return (
		<div className="md:hidden w-full flex items-center justify-between flex-row px-4 py-3 border-b bg-sidebar ">
			<Link href="/">
				<Image
					src={logo}
					className="rounded-[33%]"
					alt="FinanzQuest"
					height={32}
				/>
			</Link>

			<SearchBarPopOut
				doRedirect
				triggerRender={({ onClick }) => (
					<Button
						onClick={onClick}
						variant="ghost"
						className="w-[300px]"
						size="icon"
					>
						<div className="w-full flex items-center gap-2 justify-center whitespace-nowrap text-ellipsis overflow-hidden rounded-md text-sm font-medium transition-colors border border-input shadow-sm bg-background h-9 px-3 py-1">
							<SearchIcon className="size-6 shrink-0 stroke-muted-foreground" />
							<span className="text-muted-foreground shrink truncate">
								Wertpapiersuche...
							</span>
						</div>
					</Button>
				)}
			/>
			<div className="flex items-center gap-2 flex-row justify-between">
				<Sheet open={open} onOpenChange={setOpen}>
					<SheetTrigger
						render={
							<Button variant="ghost" size="icon">
								<Menu className="size-5" />
							</Button>
						}
					></SheetTrigger>
					<SheetContent side="left" className="w-72 p-0 flex flex-col">
						<div className="px-6 py-4 border-b">
							<h1 className="font-bold text-2xl">FinanzQuest</h1>
						</div>
						<div className="flex-1 overflow-y-auto px-3 py-2">
							{/* Wrap in fake sidebar context for SidebarMenuButton to work */}
							<nav className="flex flex-col gap-1">
								{Object.entries(tree).map(([label, items]) => (
									<div key={label} className="mb-2">
										<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-1">
											{label}
										</p>
										{items.map(item => (
											<Link
												key={item.title}
												href={item.url}
												onClick={() => setOpen(false)}
												className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent transition-colors"
											>
												<item.icon className="size-5 shrink-0" />
												<span>{item.title}</span>
											</Link>
										))}
									</div>
								))}
							</nav>
						</div>
						<div className="border-t px-3 py-3 flex flex-col gap-2">
							<User user={data.user} />
							<Suspense fallback={null}>
								<DepotPicker
									depotIds={data.depotIds}
									activeDepotId={data.activeDepotId}
								/>
							</Suspense>
						</div>
					</SheetContent>
				</Sheet>
			</div>
		</div>
	)
}

// ── iPad landscape: icon-only sidebar (collapsed by default) ─────────────────
// This reuses DesktopSidebar - on md+ it shows, on portrait it's hidden via CSS.
// We control "landscape only" via a media query wrapper in the layout instead.

// ── Main export ──────────────────────────────────────────────────────────────
export function AppSidebar({ data }: { data: SidebarData }) {
	const tree = useNavTree(data.isTeacher)

	return (
		<>
			{/* Portrait mobile/iPad: topbar */}
			<MobileTopbar tree={tree} data={data} />

			{/* Landscape iPad + Desktop: collapsible sidebar */}
			<DesktopSidebar tree={tree} data={data} />
		</>
	)
}
