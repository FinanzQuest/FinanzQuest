import type { LessonDef } from "../../_engine/types"
import { KgvCalculator } from "./diagrams"

export const kgvKbvDividende: LessonDef = {
	id: "aktien.kgv-kbv-dividende",
	title: "KGV, KBV & Dividende",
	steps: [
		{
			type: "card",
			title: "KGV: der Preis des Gewinns",
			body: "Das Kurs-Gewinn-Verhältnis (KGV) ist der Aktienkurs geteilt durch den Gewinn je Aktie. Es zeigt, wie viele Jahresgewinne der Preis kostet. Spiele mit den Reglern und beobachte das KGV.",
			diagram: <KgvCalculator />,
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Eine Aktie kostet 60 €, der Gewinn je Aktie liegt bei 4 €. Wie hoch ist das KGV?",
				min: 0,
				max: 40,
				step: 1,
				correct: 15,
				tolerance: 1,
				explanation: "60 € : 4 € = 15. Du zahlst 15 Jahresgewinne.",
			},
		},
		{
			type: "card",
			title: "Was ist teuer?",
			body: "Es gibt keine feste Grenze. Als grobe Orientierung gilt: unter 12 eher günstig, 12 bis 25 üblich, darüber teuer. Ein hohes KGV kann gerechtfertigt sein, wenn der Gewinn schnell wächst.",
		},
		{
			type: "card",
			title: "Branchen unterscheiden sich",
			body: "Banken und Versorger haben oft ein niedriges KGV, Technologiefirmen ein hohes. Vergleiche das KGV deshalb nur innerhalb derselben Branche, den Sektor siehst du auf der Aktienseite.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Eine Aktie mit besonders niedrigem KGV ist immer ein Schnäppchen.",
				correct: false,
				explanation:
					"Ein niedriges KGV kann auch bedeuten, dass der Gewinn bald einbricht. Es ist ein Hinweis, kein Beweis.",
			},
		},
		{
			type: "card",
			title: "Stolperfallen beim KGV",
			body: "Ist der Gewinn negativ, gibt es kein sinnvolles KGV. Auch einmalige Sondereffekte verzerren den Gewinn. Schau deshalb zusätzlich auf Umsatzwachstum und Gewinnmarge.",
		},
		{
			type: "card",
			title: "KBV: Preis zum Eigenkapital",
			body: "Das Kurs-Buchwert-Verhältnis (KBV) vergleicht den Preis mit dem Eigenkapital in der Bilanz. Ein KBV von 1 heißt: Du zahlst genau den Buchwert. Es ist vor allem bei Banken und Versicherungen aussagekräftig.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Ein KBV von 3 bedeutet, dass …",
				options: [
					"die Aktie dreimal so viel Dividende zahlt",
					"der Börsenwert das Dreifache des Eigenkapitals beträgt",
					"der Gewinn sich verdreifacht hat",
					"die Aktie dreimal so riskant ist",
				],
				correct: 1,
				explanation:
					"Das KBV setzt Preis und bilanzielles Eigenkapital ins Verhältnis. Bei 3 zahlst du das Dreifache.",
			},
		},
		{
			type: "card",
			title: "Dividendenrendite",
			body: "Viele Firmen zahlen einen Teil ihres Gewinns als Dividende aus. Die Dividendenrendite ist die Jahresdividende geteilt durch den Kurs. Die Ausschüttungsquote zeigt, welcher Anteil des Gewinns ausgezahlt wird.",
		},
		{
			type: "card",
			title: "Vorsicht bei hohen Renditen",
			body: "Eine sehr hohe Dividendenrendite kann ein Warnsignal sein: Oft ist der Kurs gefallen, und die Dividende wird bald gekürzt. Eine Ausschüttungsquote über 100 % ist auf Dauer nicht haltbar.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Die Dividende beträgt 3 € je Aktie, der Kurs liegt bei 75 €. Wie hoch ist die Dividendenrendite?",
				min: 0,
				max: 10,
				step: 0.5,
				correct: 4,
				tolerance: 0.5,
				unit: "%",
				explanation: "3 : 75 = 0,04, also 4 %.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "order",
				question: "Sortiere vom niedrigsten zum höchsten KGV.",
				items: [
					"Kurs 40 €, Gewinn 5 € (KGV 8)",
					"Kurs 60 €, Gewinn 4 € (KGV 15)",
					"Kurs 90 €, Gewinn 3 € (KGV 30)",
					"Kurs 120 €, Gewinn 2 € (KGV 60)",
				],
				explanation: "KGV = Kurs : Gewinn: 8, 15, 30 und 60.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question: "Welche Kennzahl beschreibt was?",
				pairs: [
					{ left: "KGV", right: "Kurs im Verhältnis zum Gewinn" },
					{ left: "KBV", right: "Kurs im Verhältnis zum Eigenkapital" },
					{
						left: "Dividendenrendite",
						right: "Jahresdividende im Verhältnis zum Kurs",
					},
					{
						left: "Ausschüttungsquote",
						right: "Anteil des Gewinns als Dividende",
					},
				],
				explanation:
					"Alle vier findest du in der App unter den Kennzahlen einer Aktie.",
			},
		},
	],
}
