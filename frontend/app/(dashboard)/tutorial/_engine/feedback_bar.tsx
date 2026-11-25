"use client"

import { CircleCheck, CircleX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Props {
	correct: boolean
	explanation: string
	onContinue: () => void
}

export function FeedbackBar({ correct, explanation, onContinue }: Props) {
	const Icon = correct ? CircleCheck : CircleX
	return (
		<div
			role="status"
			aria-live="polite"
			className={cn(
				"border-t-2 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] motion-safe:animate-in motion-safe:slide-in-from-bottom-8 motion-safe:fade-in motion-safe:duration-200",
				correct ? "border-win bg-win/15" : "border-loss bg-loss/15"
			)}
		>
			<div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
				<div className="flex items-start gap-3">
					<Icon
						className={cn(
							"mt-0.5 size-6 shrink-0 motion-safe:animate-in motion-safe:zoom-in-50 motion-safe:duration-300",
							correct ? "text-win" : "text-loss"
						)}
					/>
					<div className="min-w-0">
						<p className={cn("font-bold", correct ? "text-win" : "text-loss")}>
							{correct ? "Richtig!" : "Nicht ganz"}
						</p>
						<p className="text-sm leading-relaxed text-foreground/80">
							{explanation}
						</p>
					</div>
				</div>
				<Button
					size="lg"
					className="h-11 w-full text-base sm:w-auto sm:self-end"
					onClick={onContinue}
				>
					Weiter
				</Button>
			</div>
		</div>
	)
}
