import type { LessonDef } from "../../_engine/types"

export const futuresContango: LessonDef = {
	id: "rohstoffe-vertiefung.futures-contango",
	title: "Futures & Contango",
	steps: [
		{
			type: "card",
			title: "Warum Futures?",
			body: "Ein Barrel Öl lässt sich schlecht im Depot lagern. Rohstoff-ETFs und Fonds bilden den Preis deshalb meist über Futures nach. Ein Future hat ein festes Ablaufdatum, das Produkt muss also regelmäßig in den nächsten Kontrakt wechseln.",
		},
		{
			type: "card",
			title: "Der Roll",
			body: "Läuft der Future aus, verkauft der Fonds ihn und kauft den nächsten Kontrakt. Diesen Wechsel nennt man Roll. Ob dabei Rendite entsteht oder kostet, hängt vom Preisunterschied zwischen altem und neuem Kontrakt ab.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Was passiert beim Roll?",
				options: [
					"Der Fonds liefert den Rohstoff nach Hause",
					"Der auslaufende Future wird verkauft und der nächste gekauft",
					"Der Fonds zahlt Dividenden",
					"Der Spotpreis wird festgelegt",
				],
				correct: 1,
				explanation:
					"Der Fonds hält so dauerhaft Terminkontrakte, ohne Ware zu bekommen.",
			},
		},
		{
			type: "card",
			title: "Contango",
			body: "Contango bedeutet: Der spätere Future ist teurer als der aktuelle. Beim Roll kauft der Fonds dann teurer, als er verkauft hat. Bei gleichbleibendem Spotpreis kostet das Rendite, Jahr für Jahr.",
		},
		{
			type: "card",
			title: "Backwardation",
			body: "Backwardation ist das Gegenteil: Der spätere Future ist billiger als der aktuelle, etwa bei akuter Knappheit. Dann kann der Roll Rendite bringen. Ob Contango oder Backwardation herrscht, ändert sich im Zeitverlauf.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question: "Ordne zu.",
				pairs: [
					{
						left: "Contango",
						right: "Späterer Future teurer, Roll kostet Rendite",
					},
					{
						left: "Backwardation",
						right: "Späterer Future billiger, Roll kann Rendite bringen",
					},
					{ left: "Spotpreis", right: "Preis für sofortige Lieferung" },
				],
				explanation:
					"Die Form der Terminkurve entscheidet über die Rollrendite.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Du verkaufst den auslaufenden Future bei 100 und kaufst den nächsten bei 102. Wie viel Prozent kostet der Roll?",
				min: 0,
				max: 10,
				step: 1,
				correct: 2,
				tolerance: 0,
				unit: "%",
				explanation:
					"2 Punkte Aufschlag auf 100 sind 2 %, die Du pro Roll zusätzlich zahlst.",
			},
		},
		{
			type: "card",
			title: "Warum ETFs nicht dem Spotpreis folgen",
			body: "Rohstoff-ETFs auf Futures können sich daher vom Spotpreis entfernen, vor allem bei langem Contango. Dazu kommen Gebühren. Der ETF kann über Jahre schlechter laufen als der Rohstoffpreis selbst. Ausnahme: physisch hinterlegte Produkte wie bei Gold.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Ein Futures-basierter Rohstoff-ETF entwickelt sich immer exakt wie der Spotpreis.",
				correct: false,
				explanation:
					"Rollkosten und Gebühren führen zu Abweichungen, die sich über die Zeit summieren.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Worauf solltest Du vor dem Kauf eines Rohstoff-ETFs achten?",
				options: [
					"Nur auf den Namen",
					"Wie er nachbildet (physisch oder Futures) und welche Kosten er hat",
					"Nur auf die Farbe des Logos",
					"Auf nichts, alle sind gleich",
				],
				correct: 1,
				explanation:
					"Die Konstruktion bestimmt, wie nah das Produkt am Rohstoffpreis bleibt.",
			},
		},
	],
}
