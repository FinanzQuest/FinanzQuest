"use client"

import { useCallback, useEffect, useState } from "react"
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	type CarouselApi,
} from "@/components/ui/carousel"
import { slides } from "./slides"
import { SlideProgress } from "./slides/slide-progress"
import { SlideNavigation } from "./slides/slide-navigation"

export default function Page() {
	const [api, setApi] = useState<CarouselApi>()
	const [current, setCurrent] = useState(0)
	const [count, setCount] = useState(0)

	useEffect(() => {
		if (!api) return
		setCount(api.scrollSnapList().length)
		setCurrent(api.selectedScrollSnap())
		api.on("select", () => setCurrent(api.selectedScrollSnap()))
	}, [api])

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
		<main className="min-h-0 max-h-full w-full overflow-hidden bg-background flex flex-col">
			{/* Header */}

			{/* Carousel */}
			<div className="flex-1 min-h-0 max-h-full overflow-scroll">
				<Carousel
					setApi={setApi}
					opts={{ loop: false, align: "start" }}
					className="h-full w-full"
				>
					<CarouselContent className="h-full ml-0">
						{slides.map((Slide, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: order will not change
							<CarouselItem key={i} className="h-full pl-0">
								<div className="h-full w-full overflow-y-scroll">
									<Slide />
								</div>
							</CarouselItem>
						))}
					</CarouselContent>
				</Carousel>
			</div>

			{/* Footer */}
			<footer className="flex-none flex items-center gap-4 px-8 py-4 border-t border-border">
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
