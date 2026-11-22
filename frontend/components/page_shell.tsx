import type { ReactNode } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

/**
 * Frame of a dashboard page: scrolls inside the content area (the area next
 * to the sidebar, below the phone top bar) with the shared width, padding
 * and spacing. Children keep their height (no shrinking to fit).
 */
export function PageShell({
	children,
	className,
}: {
	children: ReactNode
	className?: string
}) {
	return (
		<ScrollArea className="h-full">
			<main
				className={cn(
					"w-full max-w-300 mx-auto md:px-12 px-4 py-6 flex flex-col gap-8 *:shrink-0",
					className
				)}
			>
				{children}
			</main>
		</ScrollArea>
	)
}
