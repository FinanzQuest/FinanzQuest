import type { LessonDef } from "../../_engine/types"

export const kryptoImPortfolio: LessonDef = {
	id: "krypto-vertiefung.krypto-im-portfolio",
	title: "Krypto im Portfolio",
	steps: [
		{
			type: "card",
			title: "Kern und Satellit",
			body: "Ein häufiges Modell: Der Kern besteht aus breit gestreuten, günstigen Anlagen wie Welt-ETFs. Risikoreichere Ideen kommen höchstens als kleiner Satellit dazu. Kryptowährungen gehören, wenn überhaupt, in diesen Satelliten.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question:
					"Welche Rolle passt zu Kryptowährungen im Kern-Satelliten-Modell?",
				options: [
					"Der Kern des Portfolios",
					"Ein kleiner Satellit, falls überhaupt",
					"Der sichere Notgroschen",
					"Ersatz für Anleihen",
				],
				correct: 1,
				explanation:
					"Wegen der extremen Schwankungen passen sie, wenn überhaupt, nur als kleiner Satellit.",
			},
		},
		{
			type: "card",
			title: "Warum klein?",
			body: "Fällt eine Position um 80 %, hängt der Schaden davon ab, wie groß sie war. Bei 5 % Anteil sinkt das Gesamtportfolio durch den Totalausfall dieser Position um 5 %. Bei 50 % Anteil wären es 50 %.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Dein Portfolio hat 10.000 €, davon 5 % in einem Coin, der um 80 % fällt. Wie viel Euro verlierst Du?",
				min: 0,
				max: 1000,
				step: 20,
				correct: 400,
				tolerance: 0,
				unit: "€",
				explanation: "5 % von 10.000 € sind 500 €. 80 % davon sind 400 €.",
			},
		},
		{
			type: "card",
			title: "Streuung auch hier",
			body: "Wer Krypto beimischt, setzt besser nicht alles auf einen Coin. Auch innerhalb des Satelliten hilft Streuung. Beachte aber: Viele Kryptowährungen fallen oft gleichzeitig, der Diversifikationseffekt ist begrenzt.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Wer viele verschiedene Coins kauft, ist dadurch vor Kryptokrisen geschützt.",
				correct: false,
				explanation:
					"Kryptowerte bewegen sich oft gemeinsam. Streuung über viele Coins reduziert das Gesamtrisiko der Anlageklasse kaum.",
			},
		},
		{
			type: "card",
			title: "Nur Geld, das Du verlieren kannst",
			body: "Setze nie Geld ein, das Du bald brauchst, etwa Miete, Notgroschen oder Ausbildungskosten. Ein Totalverlust muss verkraftbar sein, ohne dass Dein Leben ins Wanken gerät. Und: Nimm nie Kredit auf, um zu investieren.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "order",
				question:
					"Sortiere sinnvoll, was zuerst kommt, wenn Du Geld anlegen willst.",
				items: [
					"Notgroschen aufbauen",
					"Breit gestreute Basis-ETFs",
					"Einzelne Aktien oder Rohstoffe",
					"Kleiner Anteil riskanter Ideen",
				],
				explanation:
					"Erst Sicherheit und breite Basis, riskante Beimischungen kommen zuletzt und nur klein.",
			},
		},
		{
			type: "card",
			title: "Dein eigenes Urteil",
			body: "Dieser Kurs gibt keine Anlageempfehlung. Es gilt: Verstehe, was Du kaufst, kenne Dein Risiko und entscheide für Dich. Hier in FinanzQuest kannst Du mit virtuellem Geld gefahrlos üben, auch das Erleben von Schwankungen.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Was ist die vernünftigste Haltung beim Thema Krypto?",
				options: [
					"Alles Ersparte investieren, solange der Kurs steigt",
					"Nur investieren, wenn Totalverlust verkraftbar ist",
					"Kredit aufnehmen für höhere Gewinne",
					"Nur in einen einzigen Coin gehen",
				],
				correct: 1,
				explanation:
					"Das Risiko muss zur eigenen Situation passen. Ein Totalverlust darf Dich nicht ruinieren.",
			},
		},
	],
}
