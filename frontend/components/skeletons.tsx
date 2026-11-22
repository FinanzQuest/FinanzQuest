import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

// Page-shaped placeholders (shadcn Skeleton) shown while a route's data
// streams in. They mirror the real layouts so content does not jump.

const page =
	"w-full h-fit max-w-300 mx-auto md:px-12 px-4 py-6 flex flex-col gap-8"

/** Label, big number, a line below (Depotwert, Monatliches Budget, …). */
function ValueHeader({ stats = 4 }: { stats?: number }) {
	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-2">
				<Skeleton className="h-4 w-40" />
				<Skeleton className="h-[clamp(2.5rem,6vw,4rem)] w-72 max-w-full" />
				<Skeleton className="h-3 w-24" />
			</div>
			<div className="flex flex-row gap-x-10 gap-y-4 flex-wrap">
				{Array.from({ length: stats }, (_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: static placeholders
					<div key={i} className="flex flex-col gap-2">
						<Skeleton className="h-3 w-16" />
						<Skeleton className="h-6 w-24" />
					</div>
				))}
			</div>
		</div>
	)
}

/** Chart area with its toolbar pill below. */
export function ChartSkeleton({ className }: { className?: string }) {
	return (
		<div className={cn("flex flex-col gap-2", className)}>
			<Skeleton className="w-full aspect-4/3 md:aspect-20/9 lg:aspect-6/2 xl:aspect-8/2 rounded-3xl" />
			<Skeleton className="h-12 w-full rounded-full" />
		</div>
	)
}

function Rows({ count, className }: { count: number; className?: string }) {
	return (
		<div className="flex flex-col gap-2">
			{Array.from({ length: count }, (_, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: static placeholders
				<Skeleton key={i} className={cn("h-16 w-full", className)} />
			))}
		</div>
	)
}

/** Generic dashboard page (layout fallback). */
export function PageSkeleton() {
	return (
		<div className={page}>
			<ValueHeader />
			<Rows count={5} />
		</div>
	)
}

export function DashboardSkeleton() {
	return (
		<div className={page}>
			<ValueHeader />
			<ChartSkeleton />
			<div className="flex flex-row justify-between">
				<Skeleton className="h-12 w-40 rounded-full" />
				<Skeleton className="h-12 w-48 rounded-full" />
			</div>
			<Rows count={4} />
		</div>
	)
}

export function StockSkeleton() {
	return (
		<div className={page}>
			<div className="flex flex-row gap-4 items-start">
				<Skeleton className="size-24 shrink-0 rounded-2xl" />
				<div className="flex flex-col gap-2 grow pt-2">
					<Skeleton className="h-7 w-32" />
					<Skeleton className="h-4 w-56" />
					<Skeleton className="h-4 w-44" />
				</div>
				<div className="flex flex-row gap-2">
					<Skeleton className="h-9 w-24 rounded-full" />
					<Skeleton className="h-9 w-24 rounded-full" />
				</div>
			</div>
			<ValueHeader stats={2} />
			<ChartSkeleton />
			<Skeleton className="h-36 w-full" />
		</div>
	)
}

/** Header plus a table (transactions, savings plan, admin). */
export function TableSkeleton({ header = false }: { header?: boolean }) {
	return (
		<div className={page}>
			{header && <ValueHeader stats={2} />}
			<div className="flex flex-row justify-between gap-4">
				<Skeleton className="h-9 w-64 rounded-full" />
				<Skeleton className="h-9 w-28 rounded-full" />
			</div>
			<div className="flex flex-col gap-px rounded-2xl border overflow-hidden">
				<Skeleton className="h-10 w-full rounded-none" />
				{Array.from({ length: 8 }, (_, i) => (
					<Skeleton
						// biome-ignore lint/suspicious/noArrayIndexKey: static placeholders
						key={i}
						className="h-12 w-full rounded-none opacity-60"
					/>
				))}
			</div>
		</div>
	)
}

export function LeaderboardSkeleton() {
	return (
		<div className={page}>
			<ValueHeader stats={2} />
			<div className="flex flex-col rounded-2xl border divide-y divide-border/50">
				{Array.from({ length: 8 }, (_, i) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: static placeholders
						key={i}
						className="grid grid-cols-[3rem_1fr_1fr_6rem_8rem] items-center gap-6 px-4 py-4"
					>
						<Skeleton className="h-4 w-8" />
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-4 w-40" />
						<Skeleton className="h-4 w-20 justify-self-end" />
						<Skeleton className="h-8 w-full" />
					</div>
				))}
			</div>
		</div>
	)
}
