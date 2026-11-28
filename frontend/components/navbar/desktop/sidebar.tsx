"use client"

import {
	ArrowLeftRight,
	GraduationCap,
	Home,
	LayoutDashboard,
	Lightbulb,
	ListFilter,
	type LucideIcon,
	Menu,
	PiggyBank,
	SearchIcon,
	Trophy,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Suspense, useState } from "react"
import DepotPicker from "@/components/navbar/desktop/depot_picker"
import { SearchBarPopOut } from "@/components/search_bar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet"
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
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import logo from "@/public/logo.svg"
import logo_full from "@/public/logo_full.svg"
import User from "./user"

/** Loaded once on the server by the dashboard layout. */
export interface SidebarData {
	user: { name: string | null; email: string | null } | null
	isTeacher: boolean
	/** anonymous guest session (no account) */
	isGuest: boolean
	depots: { id: number; name: string }[]
	/** the active depot (cookie, validated against the user's depots) */
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
		Markt: [{ title: "Wertpapiersuche", url: "/search", icon: ListFilter }],
		Wissen: [{ title: "Tutorial", url: "/tutorial", icon: Lightbulb }],
		Wettbewerb: [{ title: "Leaderboard", url: "/leaderboard", icon: Trophy }],
	}
	if (isTeacher) {
		tree.Administration = [
			{ title: "Dashboard", url: "/admin", icon: LayoutDashboard },
			{ title: "Lernfortschritt", url: "/admin/learning", icon: GraduationCap },
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
								className="fq-press"
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
	data: SidebarData | null
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
					<SidebarAccount data={data} collapsed={collapsed} />
				</SidebarFooter>
			</Sidebar>
		</>
	)
}

// ── Phones / iPad portrait: slim top bar + bottom tab bar + "Mehr" sheet ─────
/** Main sections in the bottom tab bar (short labels for ~72px wide tabs). */
const tabItems: Array<ItemT> = [
	{ title: "Depot", url: "/", icon: Home },
	{ title: "Suche", url: "/search", icon: ListFilter },
	{ title: "Umsätze", url: "/transactions", icon: ArrowLeftRight },
	{ title: "Sparplan", url: "/savings_plan", icon: PiggyBank },
]

function isActive(pathname: string, url: string) {
	return url === "/" || url === "/admin"
		? pathname === url
		: pathname.startsWith(url)
}

function MobileTopbar() {
	return (
		<header className="md:hidden shrink-0 w-full border-b bg-sidebar pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
			<div className="flex h-14 items-center gap-3 px-4">
				<Link href="/" className="shrink-0" aria-label="Mein Depot">
					<Image
						src={logo}
						className="size-9 rounded-[33%]"
						alt="FinanzQuest"
						height={36}
					/>
				</Link>
				<SearchBarPopOut
					doRedirect
					triggerRender={({ onClick }) => (
						<Button
							onClick={onClick}
							variant="outline"
							className="h-10 min-w-0 flex-1 justify-start gap-2 rounded-full bg-background px-4 font-normal dark:bg-background"
						>
							<SearchIcon className="size-4 shrink-0 stroke-muted-foreground" />
							<span className="truncate text-muted-foreground">
								Wertpapiersuche...
							</span>
						</Button>
					)}
				/>
			</div>
		</header>
	)
}

function MobileTabBar({
	tree,
	data,
}: {
	tree: Record<string, Array<ItemT>>
	data: SidebarData | null
}) {
	const pathname = usePathname()
	const [open, setOpen] = useState(false)
	// everything not in the tab bar lives in the "Mehr" sheet
	const tabUrls = new Set(tabItems.map(item => item.url))
	const moreActive =
		!tabItems.some(item => isActive(pathname, item.url)) &&
		Object.values(tree)
			.flat()
			.some(item => isActive(pathname, item.url))

	const tabClass =
		"flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium leading-none transition-colors duration-150 ease-out fq-tab"

	return (
		<nav
			aria-label="Hauptnavigation"
			className="md:hidden order-last shrink-0 w-full border-t bg-sidebar pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]"
		>
			<ul className="flex flex-row items-stretch gap-1 px-2 py-1">
				{tabItems.map(item => {
					const active = isActive(pathname, item.url)
					return (
						<li key={item.url} className="flex flex-1">
							<Link
								href={item.url}
								aria-current={active ? "page" : undefined}
								className={cn(
									tabClass,
									active
										? "text-foreground"
										: "text-muted-foreground hover:text-foreground"
								)}
							>
								<item.icon
									className="size-6"
									strokeWidth={active ? 2.25 : 1.75}
								/>
								<span>{item.title}</span>
							</Link>
						</li>
					)
				})}
				<li className="flex flex-1">
					<Sheet open={open} onOpenChange={setOpen}>
						<SheetTrigger
							render={
								<button
									type="button"
									className={cn(
										tabClass,
										"w-full",
										moreActive || open
											? "text-foreground"
											: "text-muted-foreground hover:text-foreground"
									)}
								>
									<Menu
										className="size-6"
										strokeWidth={moreActive ? 2.25 : 1.75}
									/>
									<span>Mehr</span>
								</button>
							}
						/>
						<SheetContent
							side="bottom"
							className="max-h-[85svh] rounded-t-3xl pb-[env(safe-area-inset-bottom)]"
						>
							<SheetHeader className="pb-2">
								<SheetTitle className="text-lg font-semibold">Mehr</SheetTitle>
							</SheetHeader>
							<div className="min-h-0 flex-1 overflow-y-auto px-3">
								<nav className="flex flex-col gap-3">
									{Object.entries(tree).map(([label, items]) => {
										const rest = items.filter(item => !tabUrls.has(item.url))
										if (rest.length === 0) return null
										return (
											<div key={label} className="flex flex-col">
												<p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
													{label}
												</p>
												{rest.map(item => (
													<Link
														key={item.url}
														href={item.url}
														onClick={() => setOpen(false)}
														aria-current={
															isActive(pathname, item.url) ? "page" : undefined
														}
														className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-base font-medium transition-colors duration-150 ease-out hover:bg-accent aria-[current=page]:bg-accent fq-press"
													>
														<item.icon className="size-5 shrink-0" />
														<span>{item.title}</span>
													</Link>
												))}
											</div>
										)
									})}
								</nav>
							</div>
							<div className="mx-3 mt-3 mb-3 flex flex-col overflow-hidden rounded-2xl border bg-background/50">
								<SidebarAccount data={data} />
							</div>
						</SheetContent>
					</Sheet>
				</li>
			</ul>
		</nav>
	)
}

// ── iPad landscape: icon-only sidebar (collapsed by default) ─────────────────
// This reuses DesktopSidebar - on md+ it shows, on portrait it's hidden via CSS.
// We control "landscape only" via a media query wrapper in the layout instead.

// ── Main export ──────────────────────────────────────────────────────────────
/** User menu and depot picker; skeletons while the layout's data streams in. */
function SidebarAccount({
	data,
	collapsed,
}: {
	data: SidebarData | null
	collapsed?: boolean
}) {
	if (!data) {
		return collapsed ? (
			<>
				<Skeleton className="aspect-square w-full rounded-lg" />
				<Skeleton className="aspect-square w-full rounded-lg" />
			</>
		) : (
			<div className="flex flex-col gap-2 p-3">
				<Skeleton className="h-4 w-2/3" />
				<Skeleton className="h-3 w-full" />
				<Skeleton className="h-8 w-full mt-1" />
			</div>
		)
	}
	return (
		<>
			<User collapsed={collapsed} user={data.user} isGuest={data.isGuest} />
			<Suspense fallback={<Skeleton className="h-8 w-full" />}>
				<DepotPicker
					collapsed={collapsed}
					depots={data.depots}
					activeDepotId={data.activeDepotId}
				/>
			</Suspense>
		</>
	)
}

/** `data` null: still loading (rendered as the layout's Suspense fallback). */
export function AppSidebar({ data }: { data: SidebarData | null }) {
	const tree = useNavTree(data?.isTeacher ?? false)

	return (
		<>
			{/* Phones / portrait iPad: top bar with search, bottom tab bar */}
			<MobileTopbar />
			{/* usePathname needs a Suspense boundary for static prerendering */}
			<Suspense fallback={null}>
				<MobileTabBar tree={tree} data={data} />
			</Suspense>

			{/* Landscape iPad + Desktop: collapsible sidebar */}
			<DesktopSidebar tree={tree} data={data} />
		</>
	)
}
