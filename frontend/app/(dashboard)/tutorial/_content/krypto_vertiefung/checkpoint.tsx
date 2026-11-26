import type { LessonDef } from "../../_engine/types"

export const checkpoint: LessonDef = {
	id: "krypto-vertiefung.checkpoint",
	title: "Checkpoint Krypto-Vertiefung",
	steps: [
		{
			type: "card",
			title: "Zeig, was Du gelernt hast",
			body: "Sechs Fragen zu Portfolio-Rolle und Blockchain-Technik. Dies ist Bildung, keine Anlageberatung.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Welche Rolle passt zu Krypto im Kern-Satelliten-Modell?",
				options: [
					"Der Kern",
					"Ein kleiner Satellit, falls überhaupt",
					"Der Notgroschen",
					"Ersatz für Anleihen",
				],
				correct: 1,
				explanation:
					"Wegen der Schwankungen passt, wenn überhaupt, nur ein kleiner Anteil.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Dein Portfolio hat 20.000 €, 5 % davon in einem Coin, der um 80 % fällt. Wie viel Euro verlierst Du?",
				min: 0,
				max: 1500,
				step: 50,
				correct: 800,
				tolerance: 0,
				unit: "€",
				explanation: "5 % von 20.000 € sind 1.000 €, davon 80 % sind 800 €.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement: "Viele verschiedene Coins schützen sicher vor Kryptokrisen.",
				correct: false,
				explanation:
					"Kryptowerte fallen oft gemeinsam, der Streueffekt ist begrenzt.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question:
					"Warum macht das Ändern eines alten Blocks die Kette ungültig?",
				options: [
					"Weil Blöcke gelöscht werden",
					"Weil jeder Block den Hash seines Vorgängers enthält",
					"Weil Miner das verbieten",
					"Weil Blöcke verschlüsselt sind",
				],
				correct: 1,
				explanation:
					"Der veränderte Hash passt nicht mehr zum Verweis im Folgeblock.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question: "Ordne zu.",
				pairs: [
					{
						left: "Privater Schlüssel",
						right: "Berechtigt zum Ausgeben, geheim halten",
					},
					{ left: "Adresse", right: "Kann man zum Empfangen teilen" },
					{
						left: "Proof of Work",
						right: "Rechenaufwand sichert das Netzwerk",
					},
				],
				explanation:
					"Schlüssel, Adresse und Konsensverfahren haben unterschiedliche Aufgaben.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Bestätigte Blockchain-Transaktionen lassen sich in der Regel nicht zurückholen.",
				correct: true,
				explanation: "Es gibt keine zentrale Instanz für Rückbuchungen.",
			},
		},
	],
}
