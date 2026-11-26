import type { LessonDef } from "../../_engine/types"

export const schwankungen: LessonDef = {
	id: "krypto.schwankungen",
	title: "Extreme Schwankungen",
	steps: [
		{
			type: "card",
			title: "Volatilität",
			body: "Volatilität misst, wie stark ein Preis schwankt. Kryptowährungen schwanken deutlich stärker als breit gestreute Aktien-ETFs. Tägliche Bewegungen von mehreren Prozent sind nicht ungewöhnlich.",
		},
		{
			type: "card",
			title: "Rückgänge von 70 bis 80 %",
			body: "Bitcoin ist mehrfach um 70 bis über 80 % vom Höchststand gefallen, zum Beispiel 2018 und 2022. Viele kleinere Coins verloren noch mehr oder verschwanden ganz. Vergangene Erholungen sind keine Garantie für die Zukunft.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Ein Coin fällt von 100 € auf 25 €. Um wie viel Prozent ist er gefallen?",
				min: 0,
				max: 100,
				step: 5,
				correct: 75,
				tolerance: 0,
				unit: "%",
				explanation: "Von 100 auf 25 sind es 75 Euro Verlust, also 75 %.",
			},
		},
		{
			type: "card",
			title: "Erholung braucht mehr",
			body: "Nach einem Verlust von 75 % musst Du Dein Geld vervierfachen, also 300 % gewinnen, um wieder bei null zu sein. Je tiefer der Fall, desto größer die nötige Erholung. Das ist reine Rechnung, keine Prognose.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question:
					"Du verlierst 50 %. Welcher Gewinn bringt Dich zurück auf den Ausgangswert?",
				options: ["25 %", "50 %", "100 %", "150 %"],
				correct: 2,
				explanation:
					"Aus 50 musst Du wieder 100 machen, also verdoppeln. Das sind 100 % Gewinn.",
			},
		},
		{
			type: "card",
			title: "Rund um die Uhr",
			body: "Kryptomärkte handeln 24 Stunden an 7 Tagen. Es gibt keine Börsenschließung und keine Handelspausen. Preise können nachts oder am Wochenende stark springen. Das kann zu ständigem Nachschauen und impulsiven Entscheidungen verleiten.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Kryptowährungen werden wie Aktien nur zu festen Börsenzeiten gehandelt.",
				correct: false,
				explanation: "Der Handel läuft durchgehend, an jedem Tag des Jahres.",
			},
		},
		{
			type: "card",
			title: "Was treibt die Kurse?",
			body: "Anders als bei Aktien gibt es keine Gewinne, die man bewerten kann. Kurse reagieren stark auf Stimmung, Nachrichten, Regulierung und Medienhype. Dadurch entstehen schnell Überhitzung und Panik.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Welcher Punkt erklärt die starken Schwankungen am besten?",
				options: [
					"Es gibt keine Unternehmensgewinne als feste Bewertungsbasis",
					"Kryptowährungen sind staatlich garantiert",
					"Der Handel ist stark begrenzt",
					"Alle Kurse bewegen sich gleich",
				],
				correct: 0,
				explanation:
					"Ohne Gewinne oder Zinsen als Anker hängt der Preis stark von Erwartungen und Stimmung ab.",
			},
		},
	],
}
