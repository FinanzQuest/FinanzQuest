"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface SlideNavigationProps {
	onPrev: () => void
	onNext: () => void
	canPrev: boolean
	canNext: boolean
}

export function SlideNavigation({
	onPrev,
	onNext,
	canPrev,
	canNext,
}: SlideNavigationProps) {
	return (
		<div className="flex items-center gap-2">
			<Button
				variant="ghost"
				size="icon"
				onClick={onPrev}
				disabled={!canPrev}
				className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30"
			>
				<ChevronLeft className="w-5 h-5" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				onClick={onNext}
				disabled={!canNext}
				className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30"
			>
				<ChevronRight className="w-5 h-5" />
			</Button>
		</div>
	)
}
