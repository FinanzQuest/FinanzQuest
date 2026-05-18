"use client"

import { cn } from "@/lib/utils"

interface SlideProgressProps {
	current: number
	count: number
	onGoTo: (index: number) => void
}

export function SlideProgress({ current, count, onGoTo }: SlideProgressProps) {
	return (
		<div className="flex-1 flex items-center justify-center gap-1.5">
			{Array.from({ length: count }).map((_, i) => (
				<button
					type="button"
					// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
					key={i}
					onClick={() => onGoTo(i)}
					className={cn(
						"transition-all duration-300 rounded-full",
						i === current
							? "w-6 h-2 bg-emerald-500"
							: "w-2 h-2 bg-zinc-700 hover:bg-zinc-500"
					)}
					aria-label={`Zu Slide ${i + 1}`}
				/>
			))}
		</div>
	)
}
