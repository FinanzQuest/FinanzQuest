"use client"

import { useCallback, useEffect, useState, useSyncExternalStore } from "react"
import { ScrollAreaLite } from "@/components/scroll_area_lite"
import {
	Carousel,
	type CarouselApi,
	CarouselContent,
	CarouselItem,
} from "@/components/ui/carousel"
import { slides } from "./slides"
import { SlideNavigation } from "./slides/slide-navigation"
import { SlideProgress } from "./slides/slide-progress"

export default function Page() {
	const [api, setApi] = useState<CarouselApi>()
	// the carousel is the source of truth: subscribe to it instead of
	// mirroring it into state (the old listener was also never removed)
	const subscribe = useCallback(
		(onChange: () => void) => {
			if (!api) return () => {}
			api.on("select", onChange).on("reInit", onChange)
			return () => {
				api.off("select", onChange).off("reInit", onChange)
			}
		},
		[api]
	)
	const current = useSyncExternalStore(
		subscribe,
		() => api?.selectedScrollSnap() ?? 0,
		() => 0
	)
	const count = useSyncExternalStore(
		subscribe,
		() => api?.scrollSnapList().length ?? 0,
		() => 0
	)

	const goTo = useCallback((index: number) => api?.scrollTo(index), [api])

	const goPrev = useCallback(() => api?.scrollPrev(), [api])
	const goNext = useCallback(() => api?.scrollNext(), [api])

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "ArrowRight" || e.key === "ArrowDown") goNext()
			if (e.key === "ArrowLeft" || e.key === "ArrowUp") goPrev()
		}
		window.addEventListener("keydown", handler)
		return () => window.removeEventListener("keydown", handler)
	}, [goNext, goPrev])

	return (
		<main className="h-full md:px-12 px-4 pt-6 w-full overflow-hidden bg-background flex flex-col">
			{/* Header */}

			{/* Carousel */}

			<div className="flex-1 min-h-0 max-h-full">
				<Carousel
					setApi={setApi}
					opts={{
						loop: false,
						align: "start",
						watchDrag: (_emblaApi, event) => {
							const target = event.target as HTMLElement
							// Nicht draggen wenn der Klick von einem Slider kommt
							return !target.closest("[data-no-swipe]")
						},
					}}
					className="h-full w-full *:h-full"
				>
					<CarouselContent className="h-full ml-0">
						{slides.map((Slide, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: order will not change
							<CarouselItem key={i} className="h-full pl-0">
								<ScrollAreaLite data-no-swipe className="h-full w-fit mx-auto">
									<Slide />
								</ScrollAreaLite>
							</CarouselItem>
						))}
					</CarouselContent>
				</Carousel>
			</div>

			{/* Footer */}
			<footer className="my-2 w-fit mx-auto bg-muted/50 flex-none flex items-center gap-4 px-4 py-4 border h-16 rounded-2xl border-border">
				<SlideNavigation
					onPrev={goPrev}
					onNext={goNext}
					canPrev={current > 0}
					canNext={current < count - 1}
				/>
				<SlideProgress current={current} count={count} onGoTo={goTo} />
				<div>
					{current + 1} / {count}
				</div>
			</footer>
		</main>
	)
}
