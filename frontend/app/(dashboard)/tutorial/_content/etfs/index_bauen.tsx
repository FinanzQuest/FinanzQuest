import type { LessonDef } from "../../_engine/types"
import { HBars, IndexBuilder } from "./diagrams"

export const indexBauen: LessonDef = {
	id: "etfs.index-bauen",
	title: "Einen Index bauen",
	steps: [
		{
			type: "card",
			title: "Was ist ein Index?",
			body: "Ein Index ist ein Korb aus Aktien, der als eine einzige Zahl abgebildet wird. Steigen die Aktien im Korb im Schnitt, steigt der Index. Ein Index selbst kannst Du nicht kaufen. Ein ETF bildet ihn nach.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Einen Index wie den MSCI World kannst Du direkt an der Börse kaufen.",
				correct: false,
				explanation:
					"Ein Index ist nur eine Rechenvorschrift. Kaufen kannst Du einen ETF, der den Index nachbildet.",
			},
		},
		{
			type: "card",
			title: "Gewichtung nach Marktkapitalisierung",
			body: "Die Marktkapitalisierung ist Aktienkurs mal Anzahl der Aktien, also der Börsenwert einer Firma. Bei den meisten Indizes zählt eine große Firma mehr als eine kleine. Gewinnt sie, bewegt sie den Index stark.",
			diagram: (
				<HBars
					data={[
						{ name: "Alpha", value: 50 },
						{ name: "Beta", value: 30 },
						{ name: "Gamma", value: 15 },
						{ name: "Delta", value: 5 },
					]}
					note="Beispiel mit vier erfundenen Firmen und Anteil am Index in %."
				/>
			),
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Was bedeutet Marktkapitalisierung?",
				options: [
					"Der Gewinn einer Firma pro Jahr",
					"Aktienkurs mal Anzahl der Aktien",
					"Die Zahl der Mitarbeiter",
					"Der Umsatz im letzten Quartal",
				],
				correct: 1,
				explanation:
					"Marktkapitalisierung = Kurs mal Aktienzahl, der Börsenwert der Firma.",
			},
		},
		{
			type: "card",
			title: "Gleichgewichtet als Gegenstück",
			body: "Bei der gleichen Gewichtung zählt jede Firma gleich viel, egal wie groß sie ist. Dann haben kleine Firmen mehr Einfluss. Dafür muss der Index häufig umgeschichtet werden, was Kosten verursacht.",
		},
		{
			type: "card",
			title: "Probier es aus",
			body: "Verändere die Kurse der vier Firmen mit den Reglern. Vergleiche, wie stark der marktkapitalisierte und der gleichgewichtete Index reagieren.",
			diagram: <IndexBuilder />,
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Alpha hat in einem marktkapitalisierten Index 50 % Gewicht und steigt um 10 %, alle anderen bleiben gleich. Um wie viel Prozent steigt der Index?",
				min: 0,
				max: 10,
				step: 0.5,
				correct: 5,
				tolerance: 0.5,
				unit: "%",
				explanation:
					"50 % mal 10 % ergibt 5 %. Das Gewicht bestimmt den Einfluss.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "order",
				question:
					"Sortiere nach Gewicht im marktkapitalisierten Index, das größte zuerst.",
				items: [
					"Firma mit 500 Mrd. € Börsenwert",
					"Firma mit 300 Mrd. € Börsenwert",
					"Firma mit 150 Mrd. € Börsenwert",
					"Firma mit 50 Mrd. € Börsenwert",
				],
				explanation: "Je höher der Börsenwert, desto größer das Gewicht.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question: "Ordne die Methode der passenden Beschreibung zu.",
				pairs: [
					{ left: "Marktkapitalisierung", right: "Große Firmen zählen mehr" },
					{ left: "Gleichgewichtung", right: "Jede Firma zählt gleich" },
					{ left: "Index", right: "Rechenvorschrift für einen Aktienkorb" },
				],
				explanation:
					"Beide Gewichtungen sind Regeln innerhalb eines Index. Der ETF setzt sie praktisch um.",
			},
		},
	],
}
