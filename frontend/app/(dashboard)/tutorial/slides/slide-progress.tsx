"use client"

import { cn } from "@/lib/utils"

interface SlideProgressProps {
	current: number
	count: number
	onGoTo: (index: number) => void
}

export function SlideProgress({ current, count, onGoTo }: SlideProgressProps) {
	return (
		<div className="flex items-center justify-center gap-1.5">
			{Array.from({ length: count }).map((_, i) => (
				<button
					type="button"
					// biome-ignore lint/suspicious/noArrayIndexKey: list is static and will not change
					key={i}
					onClick={() => onGoTo(i)}
					aria-label={`Zu Slide ${i + 1}`}
					aria-current={i === current ? "step" : undefined}
					className={cn(
						"h-2 rounded-full transition-all duration-300 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
						i === current
							? "w-6 bg-foreground"
							: "w-2 bg-border hover:bg-muted-foreground"
					)}
				/>
			))}
		</div>
	)
}
