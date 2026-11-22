"use client"

import { CheckCircle2, XCircle } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
	Figure,
	SlideHeader,
	SlideLayout,
	SlideSection,
	Stat,
} from "./slide-layout"

const PRINCIPLES = [
	{
		title: "Frühzeitig beginnen",
		desc: "Zeit ist der entscheidende Faktor: Der Zinseszinseffekt braucht Jahrzehnte, um seine volle Wirkung zu entfalten.",
	},
	{
		title: "Regelmäßig investieren",
		desc: "Ein Sparplan macht Vermögensaufbau alltagstauglich und nutzt den Cost-Average-Effekt.",
	},
	{
		title: "Breit diversifizieren",
		desc: "ETFs streuen das Risiko automatisch über hunderte oder tausende Unternehmen.",
	},
	{
		title: "Kosten niedrig halten",
		desc: "Eine hohe TER frisst über Jahrzehnte einen erheblichen Teil der Rendite auf.",
	},
	{
		title: "Langfristig denken",
		desc: "Kursschwankungen gehören dazu - wer nicht voreilig verkauft, profitiert langfristig.",
	},
]

const QUIZ: { question: string; options: string[]; correct: number }[] = [
	{
		question: "Was beschreibt die Rentenlücke?",
		options: [
			"Den Unterschied zwischen Aktien- und Anleiherendite",
			"Die Differenz zwischen letztem Gehalt und gesetzlicher Rente",
			"Den Verlust durch Inflation",
			"Die jährlichen Kosten eines ETFs",
		],
		correct: 1,
	},
	{
		question: "Was bedeutet Zinseszins?",
		options: [
			"Man zahlt Zinsen an die Bank",
			"Zinsen werden nur auf das Startkapital berechnet",
			"Man bekommt Zinsen auf bereits erzielte Zinsen",
			"Der Zinssatz steigt jährlich",
		],
		correct: 2,
	},
	{
		question: "Was ist die TER eines ETFs?",
		options: [
			"Die Steuer auf Kursgewinne",
			"Die jährliche Verwaltungsgebühr des Fonds",
			"Die Mindestanlagesumme",
			"Der aktuelle Börsenkurs",
		],
		correct: 1,
	},
	{
		question: "Was bedeutet Diversifikation?",
		options: [
			"In ein einziges Unternehmen investieren",
			"Kapital auf viele verschiedene Anlagen verteilen",
			"Aktien kurzfristig kaufen und verkaufen",
			"Nur in sichere Staatsanleihen investieren",
		],
		correct: 1,
	},
	{
		question: "Was ist ein thesaurierender ETF?",
		options: [
			"Ein ETF der nur in Schwellenländer investiert",
			"Ein ETF der Gewinne regelmäßig auszahlt",
			"Ein ETF der Erträge automatisch reinvestiert",
			"Ein ETF mit besonders hohen Kosten",
		],
		correct: 2,
	},
]

type QuizState = "idle" | "running" | "done"

export function Slide11() {
	const [quizState, setQuizState] = useState<QuizState>("idle")
	const [currentQ, setCurrentQ] = useState(0)
	const [answers, setAnswers] = useState<(number | null)[]>(
		Array(QUIZ.length).fill(null)
	)
	const [selected, setSelected] = useState<number | null>(null)
	const [confirmed, setConfirmed] = useState(false)

	const score = answers.filter((a, i) => a === QUIZ[i].correct).length
	const q = QUIZ[currentQ]

	function handleConfirm() {
		if (selected === null) return
		const next = [...answers]
		next[currentQ] = selected
		setAnswers(next)
		setConfirmed(true)
	}

	function handleNext() {
		if (currentQ < QUIZ.length - 1) {
			setCurrentQ(q => q + 1)
			setSelected(null)
			setConfirmed(false)
		} else {
			setQuizState("done")
		}
	}

	function restart() {
		setQuizState("idle")
		setCurrentQ(0)
		setAnswers(Array(QUIZ.length).fill(null))
		setSelected(null)
		setConfirmed(false)
	}

	return (
		<SlideLayout>
			<SlideHeader eyebrow="Zusammenfassung" title="Die fünf Grundprinzipien" />

			<ol className="rounded-xl border divide-y">
				{PRINCIPLES.map((p, i) => (
					<li key={p.title} className="flex items-baseline gap-4 p-4">
						<span className="number tabular-nums text-sm text-muted-foreground w-4 shrink-0">
							{i + 1}
						</span>
						<div className="flex flex-col gap-0.5">
							<span className="font-semibold">{p.title}</span>
							<p className="text-sm text-muted-foreground leading-relaxed text-pretty">
								{p.desc}
							</p>
						</div>
					</li>
				))}
			</ol>

			<SlideSection title="Abschluss-Quiz">
				{quizState === "idle" && (
					<Figure>
						<div className="flex flex-col items-start gap-4">
							<p className="text-muted-foreground">
								{QUIZ.length} Fragen zu den Inhalten dieser Einheit. Teste, was
								du dir gemerkt hast.
							</p>
							<Button onClick={() => setQuizState("running")}>
								Quiz starten
							</Button>
						</div>
					</Figure>
				)}

				{quizState === "running" && (
					<Figure
						title={q.question}
						description={`Frage ${currentQ + 1} von ${QUIZ.length}`}
						action={
							<div className="flex gap-1 pt-1" aria-hidden>
								{QUIZ.map((_, i) => (
									<span
										// biome-ignore lint/suspicious/noArrayIndexKey: list is static and will not change
										key={i}
										className={cn(
											"size-2 rounded-full",
											i < currentQ
												? answers[i] === QUIZ[i].correct
													? "bg-win"
													: "bg-loss"
												: i === currentQ
													? "bg-foreground"
													: "bg-border"
										)}
									/>
								))}
							</div>
						}
					>
						<div className="flex flex-col gap-2">
							{q.options.map((opt, i) => {
								const isSelected = selected === i
								const isCorrect = i === q.correct
								return (
									<button
										// biome-ignore lint/suspicious/noArrayIndexKey: list is static and will not change
										key={i}
										type="button"
										disabled={confirmed}
										aria-pressed={isSelected}
										onClick={() => setSelected(i)}
										className={cn(
											"flex w-full items-center justify-between gap-2 rounded-xl border px-4 py-3 text-left text-sm transition-colors",
											"outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-default",
											!confirmed && "hover:bg-muted",
											!confirmed && isSelected && "border-foreground bg-muted",
											confirmed && isCorrect && "border-win bg-win/10",
											confirmed &&
												isSelected &&
												!isCorrect &&
												"border-loss bg-loss/10",
											confirmed &&
												!isCorrect &&
												!isSelected &&
												"text-muted-foreground"
										)}
									>
										<span>{opt}</span>
										{confirmed && isCorrect && (
											<CheckCircle2 className="size-4 shrink-0 text-win" />
										)}
										{confirmed && isSelected && !isCorrect && (
											<XCircle className="size-4 shrink-0 text-loss" />
										)}
									</button>
								)
							})}
						</div>

						<div className="flex justify-end">
							{!confirmed ? (
								<Button onClick={handleConfirm} disabled={selected === null}>
									Antwort bestätigen
								</Button>
							) : (
								<Button onClick={handleNext}>
									{currentQ < QUIZ.length - 1
										? "Nächste Frage"
										: "Ergebnis anzeigen"}
								</Button>
							)}
						</div>
					</Figure>
				)}

				{quizState === "done" && (
					<Figure>
						<div className="flex flex-col items-start gap-4">
							<Stat
								size="lg"
								label="Ergebnis"
								value={`${score} / ${QUIZ.length}`}
								tone={score >= 3 ? "win" : "loss"}
							/>
							<p className="text-muted-foreground">
								{score === QUIZ.length
									? "Perfekt! Du hast alle Fragen richtig beantwortet."
									: score >= 3
										? "Gut gemacht! Ein paar Konzepte kannst du nochmal nachlesen."
										: "Schau dir die Slides nochmal an - dann klappt's beim nächsten Versuch."}
							</p>
							<Button variant="outline" onClick={restart}>
								Nochmal versuchen
							</Button>
						</div>
					</Figure>
				)}
			</SlideSection>
		</SlideLayout>
	)
}
