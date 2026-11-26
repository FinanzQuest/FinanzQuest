import type { LessonDef } from "../../_engine/types"

export const checkpoint: LessonDef = {
	id: "rohstoffe-vertiefung.checkpoint",
	title: "Checkpoint Rohstoffe-Vertiefung",
	steps: [
		{
			type: "card",
			title: "Zeig, was Du gelernt hast",
			body: "Sechs Fragen zu Portfolio-Rolle, Futures und Contango. Dies ist Bildung, keine Anlageberatung.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Warum werden Rohstoffe manchmal beigemischt?",
				options: [
					"Weil sie garantiert Gewinne bringen",
					"Weil sie oft anderen Einflüssen folgen als Aktien",
					"Weil sie Dividenden zahlen",
					"Weil das Gesetz es verlangt",
				],
				correct: 1,
				explanation:
					"Der mögliche Vorteil liegt in der anderen Kursentwicklung.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Dein Portfolio hat 5.000 €, davon 10 % in Rohstoffen. Wie viel Euro sind das?",
				min: 0,
				max: 1000,
				step: 50,
				correct: 500,
				tolerance: 0,
				unit: "€",
				explanation: "10 % von 5.000 € sind 500 €.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question: "Ordne zu.",
				pairs: [
					{ left: "Contango", right: "Späterer Future teurer" },
					{ left: "Backwardation", right: "Späterer Future billiger" },
					{ left: "Roll", right: "Wechsel in den nächsten Kontrakt" },
				],
				explanation:
					"Die Begriffe beschreiben die Terminkurve und den Kontraktwechsel.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement: "Bei Contango kostet der Roll tendenziell Rendite.",
				correct: true,
				explanation: "Der neue Kontrakt ist teurer als der verkaufte.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Warum kann ein Futures-ETF vom Spotpreis abweichen?",
				options: [
					"Wegen Rollkosten und Gebühren",
					"Weil Spotpreise erfunden sind",
					"Weil er Dividenden zahlt",
					"Gar nicht, er folgt exakt",
				],
				correct: 0,
				explanation: "Rollkosten und Gebühren summieren sich über die Zeit.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement: "Rohstoffe zahlen Dividenden wie Aktien.",
				correct: false,
				explanation: "Rohstoffe bringen nur Rendite durch Preisänderungen.",
			},
		},
	],
}
