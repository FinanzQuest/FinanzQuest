import type { LessonDef } from "../../_engine/types"
import { MarginExplorer } from "./diagrams"

export const unternehmenBewerten: LessonDef = {
	id: "aktien.unternehmen-bewerten",
	title: "Unternehmen bewerten",
	steps: [
		{
			type: "card",
			title: "Was ist eine Aktie?",
			body: "Eine Aktie ist ein kleiner Anteil an einem Unternehmen. Wer Aktien hält, besitzt einen winzigen Teil der Firma und ist an Gewinnen und Kursänderungen beteiligt. Auf der Börse bestimmen Angebot und Nachfrage den Kurs.",
		},
		{
			type: "card",
			title: "Börsenwert",
			body: "Der Börsenwert (Marktkapitalisierung) ist der Preis des ganzen Unternehmens an der Börse: Kurs mal Anzahl der Aktien. Er sagt, wie groß eine Firma ist, nicht, ob sie gut oder teuer ist.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question:
					"Eine Aktie kostet 50 €, es gibt 2 Milliarden Aktien. Wie hoch ist der Börsenwert?",
				options: ["52 Mrd. €", "100 Mrd. €", "25 Mrd. €", "1 Mrd. €"],
				correct: 1,
				explanation: "50 € × 2 Mrd. Aktien = 100 Mrd. €.",
			},
		},
		{
			type: "card",
			title: "Umsatz",
			body: "Der Umsatz (12 Monate) ist alles, was ein Unternehmen in einem Jahr durch Verkäufe einnimmt. Davon müssen noch Löhne, Material, Miete und Steuern bezahlt werden. Umsatz ist also nicht Gewinn.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Ein hoher Börsenwert bedeutet, dass das Unternehmen auch einen hohen Gewinn macht.",
				correct: false,
				explanation:
					"Der Börsenwert zeigt nur, wie viel Anleger insgesamt zahlen. Ein Unternehmen kann groß bewertet sein und trotzdem kaum Gewinn machen.",
			},
		},
		{
			type: "card",
			title: "Umsatzwachstum",
			body: "Das Umsatzwachstum vergleicht den Umsatz mit dem gleichen Quartal im Vorjahr. Steigt er, gewinnt die Firma Kunden oder erhöht Preise. Schnelles Wachstum ist attraktiv, hält aber selten für immer an.",
		},
		{
			type: "card",
			title: "Gewinnmarge",
			body: "Die Gewinnmarge zeigt, wie viel vom Umsatz als Gewinn übrig bleibt: Gewinn geteilt durch Umsatz. Probiere es aus. Bei gleichem Umsatz ist die Firma mit der höheren Marge effizienter.",
			diagram: <MarginExplorer />,
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Ein Unternehmen hat 200 Mio. € Umsatz und 30 Mio. € Gewinn. Wie hoch ist die Gewinnmarge?",
				min: 0,
				max: 50,
				step: 1,
				correct: 15,
				tolerance: 1,
				unit: "%",
				explanation: "30 : 200 = 0,15, also 15 %.",
			},
		},
		{
			type: "card",
			title: "Zusammen betrachten",
			body: "Keine Kennzahl allein reicht. Eine Firma mit wachsendem Umsatz und stabiler Marge ist meist gesünder als eine, deren Umsatz wächst, während der Gewinn schrumpft. Vergleiche am besten Unternehmen derselben Branche.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "order",
				question: "Bringe den Weg vom Umsatz zur Gewinnmarge in Reihenfolge.",
				items: [
					"Das Unternehmen nimmt Umsatz ein",
					"Kosten und Steuern werden abgezogen",
					"Der Gewinn bleibt übrig",
					"Gewinn geteilt durch Umsatz ergibt die Marge",
				],
				explanation:
					"Erst kommt das Geld herein, dann gehen die Kosten ab, und was bleibt, setzt man ins Verhältnis zum Umsatz.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question: "Ordne die Kennzahl ihrer Bedeutung zu.",
				pairs: [
					{ left: "Börsenwert", right: "Kurs × Anzahl der Aktien" },
					{ left: "Umsatz", right: "Einnahmen aus Verkäufen" },
					{ left: "Umsatzwachstum", right: "Veränderung zum Vorjahresquartal" },
					{ left: "Gewinnmarge", right: "Gewinn pro Euro Umsatz" },
				],
				explanation:
					"Das sind die Kennzahlen, die du auch auf der Aktienseite der App findest.",
			},
		},
	],
}
