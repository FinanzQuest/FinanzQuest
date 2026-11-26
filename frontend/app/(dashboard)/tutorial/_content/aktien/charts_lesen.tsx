import type { LessonDef } from "../../_engine/types"
import { CandleAnatomy, OverlayDemo } from "./diagrams"

export const chartsLesen: LessonDef = {
	id: "aktien.charts-lesen",
	title: "Charts lesen",
	steps: [
		{
			type: "card",
			title: "Die Kerze",
			body: "Im Candlestick-Chart steht jede Kerze für einen Zeitraum, etwa einen Tag. Der Körper zeigt Eröffnungs- und Schlusskurs, die Dochte zeigen Höchst- und Tiefstkurs. Wechsle zwischen steigend und fallend.",
			diagram: <CandleAnatomy />,
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Was zeigen die dünnen Linien (Dochte) einer Kerze?",
				options: [
					"Das Handelsvolumen",
					"Höchst- und Tiefstkurs des Zeitraums",
					"Die Dividende",
					"Den Durchschnittskurs",
				],
				correct: 1,
				explanation:
					"Der Körper reicht von Eröffnung bis Schluss, die Dochte bis zum höchsten und tiefsten Kurs.",
			},
		},
		{
			type: "card",
			title: "100- und 200-Tage-Linie",
			body: "Die 100- und 200-Tage-Linie sind gleitende Durchschnitte: der Mittelwert der letzten 100 beziehungsweise 200 Schlusskurse. Sie glätten Schwankungen und zeigen den Trend. Schalte sie unten ein.",
			diagram: <OverlayDemo />,
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Die 200-Tage-Linie reagiert langsamer auf Kursänderungen als die 100-Tage-Linie.",
				correct: true,
				explanation:
					"Sie mittelt über mehr Tage, deshalb ist sie träger und glatter.",
			},
		},
		{
			type: "card",
			title: "Wie Profis sie nutzen",
			body: "Liegt der Kurs über der Linie, spricht man von einem Aufwärtstrend, darunter von einem Abwärtstrend. Das ist nur eine Beschreibung der Vergangenheit, keine Prognose. Verlass dich nie allein darauf.",
		},
		{
			type: "card",
			title: "Benchmarks als Vergleich",
			body: "Die Overlays S&P 500, MSCI World, Schwellenländer und FTSE All-World zeigen Index-ETFs im selben Zeitraum. Alle Linien starten bei 100. Liegt deine Aktie darüber, war sie besser als dieser Markt.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question: "Was bildet welches Overlay ab?",
				pairs: [
					{ left: "S&P 500", right: "500 große US-Unternehmen" },
					{ left: "MSCI World", right: "Große Firmen aus Industrieländern" },
					{
						left: "Schwellenländer",
						right: "Aufstrebende Länder wie Indien oder China",
					},
					{
						left: "FTSE All-World",
						right: "Industrie- und Schwellenländer zusammen",
					},
				],
				explanation:
					"Der S&P 500 ist rein amerikanisch, die anderen drei sind international gestreut.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Deine Aktie steigt im Vergleichszeitraum von 100 auf 130, der MSCI World von 100 auf 120. Wie viele Prozentpunkte lief die Aktie besser?",
				min: 0,
				max: 30,
				step: 1,
				correct: 10,
				tolerance: 1,
				unit: "Pp.",
				explanation: "130 minus 120 ergibt 10 Prozentpunkte Vorsprung.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "order",
				question:
					"So vergleichst du eine Aktie mit einem Markt. Bringe die Schritte in Reihenfolge.",
				items: [
					"Aktienchart öffnen",
					"Benchmark-Overlay einschalten",
					"Beide Linien starten bei 100",
					"Endpunkte vergleichen",
				],
				explanation:
					"Erst Overlay aktivieren, dann beide Linien vom gleichen Start aus betrachten und das Ende vergleichen.",
			},
		},
	],
}
