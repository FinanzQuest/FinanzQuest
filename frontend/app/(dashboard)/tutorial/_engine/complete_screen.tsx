"use client"

import { Crown, Flame, Sparkles, Trophy, Wallet } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { currencyFormat } from "@/lib/cash_display_string"
import { numberFormat } from "@/lib/util"
import { cn } from "@/lib/utils"
import { completeLesson } from "./actions"
import type { CompleteResult } from "./types"

interface Props {
	lessonId: string
	score: number
	depotId: number | null
	nextHref: string | null
	onRetry: () => void
}

export function CompleteScreen({
	lessonId,
	score,
	depotId,
	nextHref,
	onRetry,
}: Props) {
	const [result, setResult] = useState<CompleteResult | null>(null)
	const [error, setError] = useState<string | null>(null)
	const sent = useRef(false)

	useEffect(() => {
		if (sent.current) return
		sent.current = true
		completeLesson({ lessonId, score, depotId }).then(r => {
			setResult(r.res)
			setError(r.error)
		})
	}, [lessonId, score, depotId])

	const pop = (delay: string) =>
		cn(
			"motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500 motion-safe:fill-mode-both",
			delay
		)

	return (
		<div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-4 py-8 text-center">
			<div className="relative flex size-28 items-center justify-center">
				<span
					aria-hidden
					className="absolute inset-0 rounded-full bg-primary/15 motion-safe:animate-ping motion-safe:[animation-iteration-count:2]"
				/>
				<span className="relative flex size-24 items-center justify-center rounded-full border-b-4 border-primary bg-primary/10 text-primary motion-safe:animate-in motion-safe:zoom-in-50 motion-safe:duration-500">
					<Trophy className="size-11" />
				</span>
			</div>
			<div className={pop("delay-150")}>
				<h1 className="text-3xl font-bold">Lektion geschafft!</h1>
				<p className="mt-1 text-muted-foreground">
					{numberFormat.format(Math.round(score * 100))} % beim ersten Versuch
					richtig
				</p>
			</div>

			{error && <p className="text-sm text-loss">{error}</p>}
			{!result && !error && (
				<p className="text-sm text-muted-foreground">
					Ergebnis wird gespeichert …
				</p>
			)}

			{result && (
				<>
					{!result.passed && (
						<p className="rounded-2xl border bg-card p-4 text-sm">
							Für diesen Checkpoint brauchst du mehr richtige Antworten. Versuch
							es gleich noch einmal.
						</p>
					)}
					<div
						className={cn("grid w-full grid-cols-3 gap-3", pop("delay-300"))}
					>
						<Stat
							icon={<Sparkles className="size-5" />}
							label="XP"
							value={`+${numberFormat.format(result.xpAwarded)}`}
						/>
						<Stat
							icon={<Flame className="size-5" />}
							label="Serie"
							value={`${result.streak} Tage`}
						/>
						<div className="flex flex-col items-center gap-1 rounded-2xl border bg-card p-3">
							<div className="flex">
								{[1, 2, 3].map(n => (
									<Crown
										key={n}
										className={cn(
											"size-5",
											n <= result.mastery
												? "fill-current text-overlay-2 motion-safe:animate-in motion-safe:zoom-in-0 motion-safe:fill-mode-both"
												: "text-muted-foreground/40"
										)}
										style={{ animationDelay: `${500 + n * 150}ms` }}
									/>
								))}
							</div>
							<span className="text-xs text-muted-foreground">
								Meisterschaft
							</span>
						</div>
					</div>

					{result.virtualCashAwarded > 0 && (
						<div
							className={cn(
								"flex w-full items-center gap-3 rounded-2xl border border-win bg-win/15 p-4 text-left text-sm",
								pop("delay-500")
							)}
						>
							<Wallet className="size-5 shrink-0 text-win" />
							<span>
								<b>{currencyFormat.format(result.virtualCashAwarded)}</b>{" "}
								virtuelles Guthaben wurden deinem Depot gutgeschrieben.
							</span>
						</div>
					)}
					{result.rewardPending && (
						<div
							className={cn(
								"flex w-full items-center gap-3 rounded-2xl border bg-card p-4 text-left text-sm",
								pop("delay-500")
							)}
						>
							<Wallet className="size-5 shrink-0 text-muted-foreground" />
							<span>
								Du hast kein Depot ausgewählt. Dein virtuelles Guthaben wird
								später gutgeschrieben, sobald du ein Depot gewählt hast.
							</span>
						</div>
					)}
				</>
			)}

			<div className="flex w-full flex-col gap-2 pt-2">
				{result?.passed && nextHref ? (
					<Button
						size="lg"
						className="h-11 w-full text-base"
						render={<Link href={nextHref} />}
						nativeButton={false}
					>
						Nächste Lektion
					</Button>
				) : null}
				<Button
					size="lg"
					variant={result?.passed && nextHref ? "outline" : "default"}
					className="h-11 w-full text-base"
					render={<Link href="/tutorial" />}
					nativeButton={false}
				>
					Zur Übersicht
				</Button>
				{result && !result.passed && (
					<Button
						size="lg"
						variant="outline"
						className="h-11 w-full text-base"
						onClick={onRetry}
					>
						Nochmal versuchen
					</Button>
				)}
			</div>
		</div>
	)
}

function Stat({
	icon,
	label,
	value,
}: {
	icon: React.ReactNode
	label: string
	value: string
}) {
	return (
		<div className="flex flex-col items-center gap-1 rounded-2xl border bg-card p-3">
			<span className="text-primary">{icon}</span>
			<span className="font-bold tabular-nums">{value}</span>
			<span className="text-xs text-muted-foreground">{label}</span>
		</div>
	)
}
