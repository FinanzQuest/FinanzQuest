import type { LessonDef } from "../../_engine/types"
import { PanicGame } from "./panic_game"

export const panikSimulation: LessonDef = {
	id: "psychologie.panik-simulation",
	title: "Panik-Simulation",
	steps: [
		{
			type: "card",
			title: "Dein Nervenkostüm im Test",
			body: "Gleich läuft ein Crash monatsweise ab, ähnlich wie 2008. Du hast 10.000 € virtuell investiert. Du kannst jederzeit verkaufen. Danach vergleichen wir mit Durchhalten.",
		},
		{
			type: "card",
			title: "Die Simulation",
			body: "Starte und entscheide selbst. Es gibt kein Richtig oder Falsch, nur eine Erkenntnis am Ende.",
			diagram: <PanicGame />,
		},
		{
			type: "card",
			title: "Verlustaversion",
			body: "Verluste fühlen sich etwa doppelt so schlimm an wie gleich große Gewinne gut. Darum wollen wir im Tief raus, damit der Schmerz aufhört. Genau dadurch wird aus einem Buchverlust ein echter Verlust.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Was bedeutet Verlustaversion?",
				options: [
					"Verluste wiegen emotional schwerer als gleich große Gewinne",
					"Man vermeidet grundsätzlich jede Geldanlage",
					"Man kauft nur Aktien, die schon gefallen sind",
					"Verluste sind an der Börse verboten",
				],
				correct: 0,
				explanation:
					"Verlustaversion ist ein gut belegter Effekt der Verhaltensökonomie.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Ein Kursverlust ist erst dann endgültig, wenn Du verkaufst.",
				correct: true,
				explanation:
					"Bis dahin ist es ein Buchverlust. Verkaufst Du im Tief, machst Du ihn endgültig und verpasst die Erholung.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "order",
				question:
					"Bringe den typischen Panik-Ablauf in die richtige Reihenfolge.",
				items: [
					"Kurse fallen deutlich",
					"Schlagzeilen und Angst nehmen zu",
					"Viele verkaufen im Tief",
					"Der Markt erholt sich ohne sie",
				],
				explanation:
					"Wer aus Angst im Tief verkauft, steigt oft erst bei höheren Kursen wieder ein.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question: "Ordne Gefühl und passende sinnvolle Reaktion zu.",
				pairs: [
					{
						left: "Angst im Crash",
						right: "Plan von früher lesen, nicht verkaufen",
					},
					{
						left: "Gier im Boom",
						right: "Anteil prüfen, nicht nachkaufen aus FOMO",
					},
					{
						left: "Unsicherheit",
						right: "Langfristiges Ziel in Erinnerung rufen",
					},
				],
				explanation:
					"Ein schriftlicher Plan hilft, Entscheidungen von Emotionen zu trennen.",
			},
		},
	],
}
