"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SlideNavigationProps {
	direction: "prev" | "next"
	onClick: () => void
	disabled: boolean
}

export function SlideNavigation({
	direction,
	onClick,
	disabled,
}: SlideNavigationProps) {
	const Icon = direction === "prev" ? ChevronLeft : ChevronRight
	return (
		<Button
			variant="outline"
			size="icon"
			onClick={onClick}
			disabled={disabled}
			aria-label={direction === "prev" ? "Vorherige Slide" : "Nächste Slide"}
		>
			<Icon />
		</Button>
	)
}
