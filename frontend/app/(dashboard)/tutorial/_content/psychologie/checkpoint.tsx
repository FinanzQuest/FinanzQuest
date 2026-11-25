import type { LessonDef } from "../../_engine/types"

export const checkpoint: LessonDef = {
	id: "psychologie.checkpoint",
	title: "Checkpoint Psychologie",
	steps: [
		{
			type: "card",
			title: "Zeig, was Du gelernt hast",
			body: "Zehn Fragen zu Crashs, Verhalten, Sparplan und Rebalancing. Nimm Dir Zeit und denke an die Simulation zurück.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question:
					"Was ist im Crash meist die beste Reaktion für langfristige Anleger?",
				options: [
					"Sofort alles verkaufen",
					"Plan prüfen und ruhig bleiben",
					"Auf Kredit nachkaufen",
					"Depot nicht mehr ansehen und löschen",
				],
				correct: 1,
				explanation: "Ein Plan schützt vor Entscheidungen aus Angst.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Ein Verlust auf dem Papier wird erst durch den Verkauf endgültig.",
				correct: true,
				explanation: "Bis zum Verkauf ist er nur ein Buchverlust.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Ein Index fällt um 50 Prozent. Wie viel Prozent Anstieg braucht er danach, um das alte Hoch zu erreichen?",
				min: 0,
				max: 200,
				step: 10,
				correct: 100,
				tolerance: 10,
				unit: "%",
				explanation: "Von 50 zurück auf 100 ist eine Verdopplung.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question: "Ordne die Krise ihrem Jahr zu.",
				pairs: [
					{ left: "Dotcom-Blase", right: "2000 bis 2003" },
					{ left: "Finanzkrise", right: "2007 bis 2009" },
					{ left: "Covid-Crash", right: "2020" },
					{ left: "Zinswende", right: "2022" },
				],
				explanation:
					"Jede Krise hatte andere Ursachen, am Ende erholte sich der Markt.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question:
					"Wie nennt man den Effekt, dass Verluste stärker wirken als gleich große Gewinne?",
				options: [
					"Herdenverhalten",
					"Verlustaversion",
					"Cost-Average",
					"Drift",
				],
				correct: 1,
				explanation: "Verlustaversion treibt viele zu Panikverkäufen.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Die besten Börsentage liegen oft kurz nach den schlechtesten.",
				correct: true,
				explanation: "Wer im Crash aussteigt, verpasst diese Tage leicht.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "order",
				question:
					"Sortiere die Anlage-Gewohnheiten von hilfreich nach riskant: Plan mit Zielanteilen, jährlich prüfen, nur Nachrichten lesen, nach Gerüchten kaufen.",
				items: [
					"Plan mit Zielanteilen",
					"Einmal im Jahr prüfen",
					"Nur Nachrichten lesen",
					"Nach Gerüchten kaufen",
				],
				explanation:
					"Je mehr Entscheidungen von Stimmung kommen, desto riskanter.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Der Cost-Average-Effekt macht einen Sparplan immer rentabler als eine Einmalanlage.",
				correct: false,
				explanation: "In steigenden Märkten liegt die Einmalanlage meist vorn.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Wozu dient Rebalancing?",
				options: [
					"Um höhere Rendite zu garantieren",
					"Um das gewünschte Risiko zu halten",
					"Um Steuern zu vermeiden",
					"Um Kosten zu erhöhen",
				],
				correct: 1,
				explanation:
					"Rebalancing stellt Deine Zielanteile wieder her, es garantiert keine Rendite.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Dein 70/30-Depot driftet auf 80 Prozent Aktien. Wie viel Prozent des Depots musst Du umschichten, um wieder auf 70/30 zu kommen?",
				min: 0,
				max: 30,
				step: 1,
				correct: 10,
				tolerance: 1,
				unit: "%",
				explanation:
					"10 Prozent des Depotwerts wandern von Aktien zu Anleihen.",
			},
		},
	],
}
