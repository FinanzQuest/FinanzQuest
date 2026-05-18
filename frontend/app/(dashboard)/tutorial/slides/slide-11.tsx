"use client"

import { CheckCircle2, XCircle } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SlideHeader, SlideLayout, SlideSection } from "./slide-layout"

const PRINCIPLES = [
	{
		number: "01",
		title: "Frühzeitig beginnen",
		desc: "Zeit ist der entscheidende Faktor: Der Zinseszinseffekt braucht Jahrzehnte, um seine volle Wirkung zu entfalten.",
	},
	{
		number: "02",
		title: "Regelmäßig investieren",
		desc: "Ein Sparplan macht Vermögensaufbau alltagstauglich und nutzt den Cost-Average-Effekt.",
	},
	{
		number: "03",
		title: "Breit diversifizieren",
		desc: "ETFs streuen das Risiko automatisch über hunderte oder tausende Unternehmen.",
	},
	{
		number: "04",
		title: "Kosten niedrig halten",
		desc: "Eine hohe TER frisst über Jahrzehnte einen erheblichen Teil der Rendite auf.",
	},
	{
		number: "05",
		title: "Langfristig denken",
		desc: "Kursschwankungen gehören dazu – wer nicht voreilig verkauft, profitiert langfristig.",
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

			<div className="grid grid-cols-1 gap-2">
				{PRINCIPLES.map(p => (
					<div
						key={p.number}
						className="rounded-xl border bg-muted/40 p-4 flex items-start gap-4"
					>
						<span className="text-emerald-500 font-bold font-mono text-lg w-8 shrink-0">
							{p.number}
						</span>
						<div>
							<span className="text-foreground font-semibold text-sm">
								{p.title}
							</span>
							<p className="text-foreground/60 text-xs mt-0.5 leading-relaxed">
								{p.desc}
							</p>
						</div>
					</div>
				))}
			</div>

			<SlideSection>
				<h2 className="text-foreground font-semibold text-lg">
					Abschluss-Quiz
				</h2>

				{quizState === "idle" && (
					<div className="rounded-xl border bg-muted/40 p-6 flex flex-col items-center gap-4 text-center">
						<p className="text-foreground/70 text-sm">
							5 Fragen zu den Inhalten dieser Einheit. Teste, was du dir gemerkt
							hast.
						</p>
						<Button onClick={() => setQuizState("running")}>
							Quiz starten
						</Button>
					</div>
				)}

				{quizState === "running" && (
					<div className="rounded-xl border bg-muted/40 p-6 flex flex-col gap-5">
						{/* Progress dots */}
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground text-xs">
								Frage {currentQ + 1} von {QUIZ.length}
							</span>
							<div className="flex gap-1">
								{QUIZ.map((_, i) => (
									<div
										// biome-ignore lint/suspicious/noArrayIndexKey: list is static and will not change
										key={i}
										className={cn(
											"w-2 h-2 rounded-full transition-all",
											i < currentQ
												? answers[i] === QUIZ[i].correct
													? "bg-emerald-500"
													: "bg-rose-500"
												: i === currentQ
													? "bg-foreground"
													: "bg-muted-foreground/30"
										)}
									/>
								))}
							</div>
						</div>

						{/* Question */}
						<p className="text-foreground font-semibold text-sm leading-relaxed">
							{q.question}
						</p>

						{/* Options */}
						<div className="flex flex-col gap-2">
							{q.options.map((opt, i) => {
								const isSelected = selected === i
								const isCorrect = i === q.correct

								let borderStyle = ""
								if (confirmed) {
									if (isCorrect)
										borderStyle = "border-emerald-500 bg-emerald-500/10"
									else if (isSelected)
										borderStyle = "border-rose-500 bg-rose-500/10"
									else borderStyle = "border bg-muted/20 opacity-50"
								} else if (isSelected)
									borderStyle = "border-foreground bg-muted/60"
								else borderStyle = "border-border bg-muted/40"

								return (
									<button
										// biome-ignore lint/suspicious/noArrayIndexKey: list is static and will not change
										key={i}
										type="button"
										disabled={confirmed}
										onClick={() => setSelected(i)}
										className={cn(
											"rounded-lg px-4 py-3 text-left text-sm transition-all",
											"flex items-center justify-between gap-2 w-full",
											"disabled:cursor-default",
											!confirmed && "hover:bg-muted/80 cursor-pointer",
											"border",
											borderStyle
										)}
									>
										<span className="text-foreground/80 pointer-events-none">
											{opt}
										</span>
										{confirmed && isCorrect && (
											<CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 pointer-events-none" />
										)}
										{confirmed && isSelected && !isCorrect && (
											<XCircle className="w-4 h-4 text-rose-500 shrink-0 pointer-events-none" />
										)}
									</button>
								)
							})}
						</div>

						{/* Actions */}
						<div className="flex justify-end">
							{!confirmed ? (
								<Button
									onClick={handleConfirm}
									disabled={selected === null}
									size="sm"
								>
									Antwort bestätigen
								</Button>
							) : (
								<Button onClick={handleNext} size="sm">
									{currentQ < QUIZ.length - 1
										? "Nächste Frage"
										: "Ergebnis anzeigen"}
								</Button>
							)}
						</div>
					</div>
				)}

				{quizState === "done" && (
					<div className="rounded-xl border bg-muted/40 p-6 flex flex-col items-center gap-4 text-center">
						<span className="text-5xl font-bold text-emerald-500">
							{score}/{QUIZ.length}
						</span>
						<p className="text-foreground/70 text-sm">
							{score === 5
								? "Perfekt! Du hast alle Fragen richtig beantwortet."
								: score >= 3
									? "Gut gemacht! Ein paar Konzepte kannst du nochmal nachlesen."
									: "Schau dir die Slides nochmal an – dann klappt's beim nächsten Versuch."}
						</p>
						<Button variant="outline" size="sm" onClick={restart}>
							Nochmal versuchen
						</Button>
					</div>
				)}
			</SlideSection>
		</SlideLayout>
	)
}
