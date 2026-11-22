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
		<main className="h-full w-full overflow-hidden bg-background flex flex-col">
			<div className="flex-1 min-h-0">
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
								<ScrollAreaLite className="h-full w-full md:px-12 px-4">
									<Slide />
								</ScrollAreaLite>
							</CarouselItem>
						))}
					</CarouselContent>
				</Carousel>
			</div>

			<footer className="flex-none border-t md:px-12 px-4 py-3">
				<div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
					<SlideNavigation
						direction="prev"
						onClick={goPrev}
						disabled={current === 0}
					/>
					<div className="flex flex-col items-center gap-1.5">
						<SlideProgress current={current} count={count} onGoTo={goTo} />
						<span className="text-xs text-muted-foreground number tabular-nums">
							{current + 1} / {count}
						</span>
					</div>
					<SlideNavigation
						direction="next"
						onClick={goNext}
						disabled={current >= count - 1}
					/>
				</div>
			</footer>
		</main>
	)
}
