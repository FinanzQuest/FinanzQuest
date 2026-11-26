import type { LessonDef } from "../../_engine/types"
import { Crash2022, DurationBars, RatePriceCurve } from "./diagrams"

export const zinsenUndKurse: LessonDef = {
	id: "anleihen.zinsen-und-kurse",
	title: "Zinsen & Kurse",
	steps: [
		{
			type: "card",
			title: "Die Wippe",
			body: "Steigen die Marktzinsen, fallen die Kurse bestehender Anleihen, und umgekehrt. Der Grund: Neue Anleihen zahlen dann mehr Kupon. Deine alte, niedrig verzinste Anleihe ist weniger wert, bis ihre Rendite wieder zum Markt passt.",
		},
		{
			type: "card",
			title: "Probier es aus",
			body: "Diese Anleihe hat 10 Jahre Laufzeit und 3 % Kupon. Ziehe den Marktzins hoch und runter. Bei 3 % kostet sie genau 100. Beachte, dass die Kurve gekrümmt ist: Zinssenkungen helfen etwas mehr, als Zinserhöhungen schaden.",
			diagram: <RatePriceCurve />,
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question:
					"Die Marktzinsen steigen von 3 % auf 5 %. Was passiert mit Deiner 3-%-Anleihe?",
				options: [
					"Ihr Kurs steigt",
					"Ihr Kurs fällt",
					"Ihr Kurs bleibt gleich",
					"Der Kupon steigt mit",
				],
				correct: 1,
				explanation:
					"Der Kupon ist fest. Neue Anleihen bieten 5 %, also muss Deine alte billiger werden, damit ihre Rendite wieder stimmt.",
			},
		},
		{
			type: "card",
			title: "Der Laufzeit-Hebel",
			body: "Duration misst grob, wie stark ein Kurs auf 1 Prozentpunkt Zinsänderung reagiert. Faustregel: Duration 8 bedeutet ca. 8 % Kursverlust bei +1 Prozentpunkt. Je länger die Laufzeit, desto größer der Hebel, denn Du bist länger an den alten Kupon gebunden.",
			diagram: <DurationBars />,
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Eine Anleihe hat eine Duration von ca. 7. Die Zinsen steigen um 1 Prozentpunkt. Wie ändert sich ihr Kurs ungefähr?",
				min: -15,
				max: 5,
				step: 1,
				correct: -7,
				tolerance: 1,
				unit: "%",
				explanation:
					"Kursänderung ≈ -Duration × Zinsänderung, also -7 × 1 = ca. -7 %.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Bei steigenden Zinsen verliert eine 30-jährige Anleihe meist mehr an Kurs als eine 2-jährige.",
				correct: true,
				explanation:
					"Die lange Anleihe hat die höhere Duration und reagiert deshalb deutlich stärker.",
			},
		},
		{
			type: "card",
			title: "Das Jahr 2022",
			body: "Nach Jahren niedriger Zinsen hob die EZB 2022 die Leitzinsen stark an. Die Rendite zehnjähriger Bundesanleihen sprang von ca. -0,2 % auf ca. 2,5 %. Anleihen verloren ca. 17 % und mehr, ähnlich viel wie Aktien. Sicher heißt nicht schwankungsfrei.",
			diagram: <Crash2022 />,
		},
		{
			type: "exercise",
			exercise: {
				kind: "order",
				question:
					"Sortiere diese Anleihen nach Zinsrisiko, vom niedrigsten zum höchsten.",
				items: [
					"Tagesgeld-nahe Anleihe, 6 Monate",
					"Anleihe, 2 Jahre",
					"Anleihe, 10 Jahre",
					"Anleihe, 30 Jahre",
				],
				explanation:
					"Je länger die Restlaufzeit (und je niedriger der Kupon), desto höher die Duration und das Zinsrisiko.",
			},
		},
	],
}
