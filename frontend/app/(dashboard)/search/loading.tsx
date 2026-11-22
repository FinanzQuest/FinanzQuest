import { Skeleton } from "@/components/ui/skeleton"

export function ResultsSkeleton() {
	return (
		<div className="flex flex-col gap-3">
			<Skeleton className="h-4 w-40" />
			<div className="flex flex-col rounded-2xl border divide-y divide-border/60 overflow-hidden">
				{Array.from({ length: 8 }, (_, i) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: static placeholders
						key={i}
						className="flex flex-row items-center gap-4 px-4 py-3"
					>
						<Skeleton className="size-10 rounded-lg" />
						<div className="flex flex-col gap-2 grow">
							<Skeleton className="h-4 w-48" />
							<Skeleton className="h-3 w-32" />
						</div>
						<Skeleton className="h-8 w-24" />
						<Skeleton className="h-5 w-16" />
					</div>
				))}
			</div>
		</div>
	)
}

export default function Loading() {
	return (
		<div className="w-full h-fit max-w-300 mx-auto md:px-12 px-4 py-6 flex flex-col gap-6">
			<Skeleton className="h-8 w-56" />
			<Skeleton className="h-11 w-full rounded-full" />
			<div className="flex flex-row gap-2">
				<Skeleton className="h-8 w-56 rounded-full" />
				<Skeleton className="h-8 w-24 rounded-full" />
				<Skeleton className="h-8 w-28 rounded-full" />
			</div>
			<ResultsSkeleton />
		</div>
	)
}
