import type { LessonDef, Step } from "../../_engine/types"

const ex = (
	exercise: Extract<Step, { type: "exercise" }>["exercise"]
): Step => ({
	type: "exercise",
	exercise,
})

export const checkpoint: LessonDef = {
	id: "aktien.checkpoint",
	title: "Checkpoint Aktien",
	steps: [
		{
			type: "card",
			title: "Dein Aktien-Checkpoint",
			body: "Zehn Aufgaben zu allem, was du über Kennzahlen, Risiko und Charts gelernt hast. Du brauchst mindestens 70 %, um zu bestehen.",
		},
		ex({
			kind: "mc",
			question:
				"Der Kurs liegt bei 20 €, es gibt 500 Mio. Aktien. Wie groß ist der Börsenwert?",
			options: ["1 Mrd. €", "10 Mrd. €", "25 Mio. €", "100 Mrd. €"],
			correct: 1,
			explanation: "20 € × 500 Mio. = 10 Mrd. €.",
		}),
		ex({
			kind: "slider",
			question:
				"Umsatz 400 Mio. €, Gewinn 48 Mio. €. Wie hoch ist die Gewinnmarge?",
			min: 0,
			max: 30,
			step: 1,
			correct: 12,
			tolerance: 1,
			unit: "%",
			explanation: "48 : 400 = 0,12, also 12 %.",
		}),
		ex({
			kind: "true_false",
			statement:
				"Umsatzwachstum vergleicht den Umsatz mit dem gleichen Quartal des Vorjahres.",
			correct: true,
			explanation: "So sind saisonale Schwankungen herausgerechnet.",
		}),
		ex({
			kind: "slider",
			question: "Kurs 90 €, Gewinn je Aktie 6 €. Wie hoch ist das KGV?",
			min: 0,
			max: 40,
			step: 1,
			correct: 15,
			tolerance: 1,
			explanation: "90 : 6 = 15.",
		}),
		ex({
			kind: "mc",
			question:
				"Warum solltest du das KGV nur innerhalb einer Branche vergleichen?",
			options: [
				"Weil Branchen unterschiedlich hohe KGVs haben",
				"Weil das KGV nur in einer Branche gilt",
				"Weil Banken kein KGV haben",
				"Weil das KGV täglich wechselt",
			],
			correct: 0,
			explanation:
				"Wachstumsbranchen haben typischerweise höhere KGVs als zum Beispiel Versorger.",
		}),
		ex({
			kind: "true_false",
			statement: "Eine Dividendenrendite von 15 % ist immer ein gutes Zeichen.",
			correct: false,
			explanation: "Oft ist der Kurs gefallen und die Dividende gefährdet.",
		}),
		ex({
			kind: "match",
			question: "Ordne zu.",
			pairs: [
				{ left: "Volatilität", right: "Stärke der Schwankungen" },
				{ left: "Beta", right: "Schwankung relativ zum Markt" },
				{ left: "52-Wochen-Spanne", right: "Jahrestief und Jahreshoch" },
				{ left: "KBV", right: "Kurs zu Eigenkapital" },
			],
			explanation: "Das sind die Kennzahlen der Aktienseite.",
		}),
		ex({
			kind: "slider",
			question:
				"Beta 0,8, der Markt steigt um 10 %. Um wie viel Prozent steigt die Aktie ungefähr?",
			min: 0,
			max: 20,
			step: 1,
			correct: 8,
			tolerance: 1,
			unit: "%",
			explanation: "10 % × 0,8 = 8 %.",
		}),
		ex({
			kind: "order",
			question: "Sortiere nach Volatilität, von niedrig zu hoch.",
			items: [
				"Staatsanleihen-ETF",
				"Welt-ETF",
				"Einzelaktie eines Konzerns",
				"Kleine Biotech-Aktie",
			],
			explanation: "Mehr Streuung dämpft die Schwankungen.",
		}),
		ex({
			kind: "mc",
			question: "Was zeigt die 200-Tage-Linie im Chart?",
			options: [
				"Den höchsten Kurs der letzten 200 Tage",
				"Den Durchschnitt der letzten 200 Schlusskurse",
				"Die Dividende der letzten 200 Tage",
				"Den Kurs vor 200 Tagen",
			],
			correct: 1,
			explanation:
				"Sie ist ein gleitender Durchschnitt und zeigt den langfristigen Trend.",
		}),
	],
}
