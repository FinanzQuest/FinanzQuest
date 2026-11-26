import type { LessonDef } from "../../_engine/types"

export const checkpoint: LessonDef = {
	id: "anleihen.checkpoint",
	title: "Checkpoint Anleihen",
	steps: [
		{
			type: "card",
			title: "Zeig, was Du gelernt hast",
			body: "Zehn Fragen zu Kupon, Zinsrisiko, Bonität und Mischung. Wenn Du hier sicher bist, bist Du bereit für die Portfoliotheorie.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Was ist der Kupon einer Anleihe?",
				options: [
					"Der Kaufpreis",
					"Der jährliche Zins auf den Nennwert",
					"Die Rückzahlung am Ende",
					"Die Gebühr der Bank",
				],
				correct: 1,
				explanation: "Der Kupon ist der feste Zins in Prozent vom Nennwert.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Nennwert 2.000 €, Kupon 4 %, Laufzeit 3 Jahre. Wie viel Zinsen erhältst Du insgesamt?",
				min: 0,
				max: 500,
				step: 10,
				correct: 240,
				tolerance: 0,
				unit: "€",
				explanation: "80 € pro Jahr mal 3 Jahre ergeben 240 €.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Kaufst Du eine Anleihe unter 100 % und hältst sie bis zum Ende, liegt Deine Rendite über dem Kupon.",
				correct: true,
				explanation: "Zum Kupon kommt der Kursgewinn bis zum Nennwert dazu.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Warum fallen Anleihekurse, wenn die Marktzinsen steigen?",
				options: [
					"Weil weniger Menschen Anleihen mögen",
					"Weil neue Anleihen mehr Zins bieten und alte billiger werden müssen",
					"Weil der Nennwert sinkt",
					"Weil der Kupon gekürzt wird",
				],
				correct: 1,
				explanation:
					"Der Kupon ist fest. Der Kurs passt sich an, bis die Rendite zum Marktzins passt.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Duration 10, Zinsen steigen um 0,5 Prozentpunkte. Wie ändert sich der Kurs ungefähr?",
				min: -10,
				max: 5,
				step: 0.5,
				correct: -5,
				tolerance: 1,
				unit: "%",
				explanation: "-10 × 0,5 = ca. -5 %.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "order",
				question: "Sortiere nach Zinsänderungsrisiko, niedrig bis hoch.",
				items: [
					"Anleihe, 1 Jahr",
					"Anleihe, 5 Jahre",
					"Anleihe, 15 Jahre",
					"Anleihe, 40 Jahre",
				],
				explanation: "Längere Laufzeit bedeutet höhere Duration.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question: "Ordne die Begriffe zu.",
				pairs: [
					{ left: "Investment Grade", right: "Rating von AAA bis BBB" },
					{ left: "High Yield", right: "Rating unter BBB, hoher Zins" },
					{ left: "Spread", right: "Risikoaufschlag auf sichere Anleihen" },
					{ left: "Duration", right: "Maß für die Zinsempfindlichkeit" },
				],
				explanation:
					"Bonität (Rating, Spread) und Zinsrisiko (Duration) sind zwei unterschiedliche Risiken.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Im Jahr 2022 haben Anleihen die Aktienverluste ausgeglichen.",
				correct: false,
				explanation:
					"Anleihen verloren 2022 durch stark steigende Zinsen ähnlich viel wie Aktien. Der Puffer fiel aus.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Welche Anleihe zahlt wahrscheinlich die höchste Rendite?",
				options: [
					"Bundesanleihe, AAA",
					"Unternehmensanleihe, A",
					"Unternehmensanleihe, BBB",
					"Unternehmensanleihe, B",
				],
				correct: 3,
				explanation:
					"Das höchste Ausfallrisiko wird mit dem höchsten Risikoaufschlag bezahlt.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question:
					"Du brauchst Dein Geld in einem Jahr sicher. Was ist am sinnvollsten?",
				options: [
					"Langlaufender Anleihen-ETF",
					"Tagesgeld oder Festgeld",
					"Aktien-ETF",
					"Einzelne Junk-Anleihe",
				],
				correct: 1,
				explanation: "Bei kurzem Horizont zählt Planbarkeit mehr als Rendite.",
			},
		},
	],
}
