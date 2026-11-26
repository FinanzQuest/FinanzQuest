import type { LessonDef } from "../../_engine/types"
import { SpreadBars } from "./diagrams"

export const bonitaet: LessonDef = {
	id: "anleihen.bonitaet",
	title: "Bonität",
	steps: [
		{
			type: "card",
			title: "Zahlt der Schuldner?",
			body: "Bonität bedeutet: Wie sicher kann der Emittent Zinsen und Rückzahlung leisten? Das Risiko, dass er nicht zahlt, heißt Ausfallrisiko. Ratingagenturen wie S&P, Moody's und Fitch bewerten es mit Buchstabennoten.",
		},
		{
			type: "card",
			title: "Von AAA bis D",
			body: "AAA ist die Bestnote, danach folgen AA, A und BBB. Bis BBB spricht man von Investment Grade. Darunter (BB, B, CCC) beginnt High Yield, auch Ramsch- oder Junk-Anleihen genannt. D bedeutet: Der Zahlungsausfall ist eingetreten.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "order",
				question: "Sortiere die Ratings von sicher nach riskant.",
				items: ["AAA", "A", "BBB", "BB", "CCC"],
				explanation:
					"AAA ist am sichersten. Ab BB beginnt High Yield mit deutlich höherem Ausfallrisiko.",
			},
		},
		{
			type: "card",
			title: "Risiko kostet Aufschlag",
			body: "Riskantere Schuldner müssen höhere Zinsen bieten, den Risikoaufschlag (Spread). Du wirst also für das Ausfallrisiko bezahlt. Aber: Hohe Rendite ist oft nur ein Zeichen für hohes Risiko, nicht für ein Geschenk.",
			diagram: <SpreadBars />,
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question:
					"Eine Unternehmensanleihe bietet 9 % Rendite, vergleichbare Staatsanleihen 3 %. Was ist die wahrscheinlichste Erklärung?",
				options: [
					"Das Unternehmen ist besonders sicher",
					"Der Markt verlangt Aufschlag für ein hohes Ausfallrisiko",
					"Der Nennwert ist höher",
					"Die Laufzeit ist unendlich",
				],
				correct: 1,
				explanation:
					"Hohe Rendite bei Anleihen ist meist die Gegenleistung für ein höheres Ausfallrisiko.",
			},
		},
		{
			type: "card",
			title: "Staat oder Unternehmen",
			body: "Staatsanleihen aus Ländern wie Deutschland gelten als sehr sicher, weil der Staat Steuern erheben kann. Unternehmensanleihen zahlen mehr, haben aber ein höheres Ausfallrisiko. Auch Staaten können pleitegehen, wie Griechenland 2012 zeigte.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Alle Staatsanleihen sind ähnlich sicher wie deutsche Bundesanleihen.",
				correct: false,
				explanation:
					"Die Bonität schwankt stark von Land zu Land. Deutschland ist AAA, andere Staaten haben deutlich schlechtere Noten oder sind schon ausgefallen.",
			},
		},
		{
			type: "card",
			title: "Schutz vor Inflation",
			body: "Eine feste Verzinsung verliert an Kaufkraft, wenn die Preise steigen. Inflationsgeschützte Anleihen koppeln Nennwert und Zinsen an die Teuerung. Sie schützen vor unerwartet hoher Inflation, haben aber eigene Kursschwankungen.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question: "Welche Anleihe passt zu welcher Beschreibung?",
				pairs: [
					{ left: "Bundesanleihe", right: "Sehr sicher, niedrige Rendite" },
					{
						left: "High-Yield-Anleihe",
						right: "Hohe Rendite, hohes Ausfallrisiko",
					},
					{
						left: "Inflationsgeschützte Anleihe",
						right: "Nennwert wird an die Teuerung angepasst",
					},
				],
				explanation:
					"Sicherheit, Risikoaufschlag und Inflationsschutz sind drei verschiedene Eigenschaften, die sich kombinieren lassen.",
			},
		},
	],
}
