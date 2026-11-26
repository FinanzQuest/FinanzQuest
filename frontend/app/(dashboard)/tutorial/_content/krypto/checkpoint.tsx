import type { LessonDef } from "../../_engine/types"

export const checkpoint: LessonDef = {
	id: "krypto.checkpoint",
	title: "Checkpoint Krypto",
	steps: [
		{
			type: "card",
			title: "Zeig, was Du gelernt hast",
			body: "Acht Fragen zu Grundlagen, Schwankungen und Risiken. Dies ist Bildung, keine Anlageberatung.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Was ist die Blockchain?",
				options: [
					"Eine Bank für Kryptowährungen",
					"Eine gemeinsam geführte, verkettete Liste von Transaktionen",
					"Ein Passwort für Wallets",
					"Eine Börse",
				],
				correct: 1,
				explanation:
					"Viele Computer führen dieselbe Kette aus Blöcken, in denen Transaktionen stehen.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement: "Kryptowährungen werden nur an Werktagen gehandelt.",
				correct: false,
				explanation: "Der Handel läuft rund um die Uhr an jedem Tag.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Ein Coin fällt von 200 € auf 50 €. Wie viel Prozent beträgt der Verlust?",
				min: 0,
				max: 100,
				step: 5,
				correct: 75,
				tolerance: 0,
				unit: "%",
				explanation: "150 € von 200 € sind 75 %.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question:
					"Du verlierst 75 %. Wie viel Gewinn brauchst Du, um wieder bei null zu sein?",
				options: ["75 %", "100 %", "200 %", "300 %"],
				correct: 3,
				explanation:
					"Aus 25 musst Du wieder 100 machen, also vervierfachen: 300 % Gewinn.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question: "Welche Anlage hat welche Ertragsquelle?",
				pairs: [
					{ left: "Aktie", right: "Dividenden und Gewinne" },
					{ left: "Anleihe", right: "Zinsen" },
					{ left: "Bitcoin", right: "Nur Kursänderung" },
				],
				explanation:
					"Kryptowährungen zahlen keine laufenden Erträge. Rendite entsteht nur durch Kursänderung.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Was ist ein Rug Pull?",
				options: [
					"Ein Kursanstieg durch gute Nachrichten",
					"Die Macher eines Coins verkaufen ihre Bestände und verschwinden",
					"Eine Steuer auf Kryptogewinne",
					"Ein Wallet-Update",
				],
				correct: 1,
				explanation:
					"Beim Rug Pull brechen Kurs und Projekt zusammen, weil die Macher aussteigen.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Kryptoguthaben sind in der Regel durch eine gesetzliche Einlagensicherung geschützt.",
				correct: false,
				explanation:
					"Anders als Bankguthaben gibt es dafür in der Regel keine gesetzliche Einlagensicherung.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Wann ist ein Krypto-Investment überhaupt vertretbar?",
				options: [
					"Wenn man dafür einen Kredit aufnimmt",
					"Wenn ein Totalverlust verkraftbar wäre",
					"Wenn der Kurs gerade stark gestiegen ist",
					"Wenn Freunde es empfehlen",
				],
				correct: 1,
				explanation:
					"Nur Geld, dessen Verlust Deine Lebensplanung nicht gefährdet, kommt infrage.",
			},
		},
	],
}
