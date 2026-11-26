import type { LessonDef } from "../../_engine/types"

export const checkpoint: LessonDef = {
	id: "etfs.checkpoint",
	title: "Checkpoint ETFs",
	steps: [
		{
			type: "card",
			title: "Checkpoint ETFs",
			body: "Zehn Fragen zu Indizes, Ländern, Sektoren und Kosten. Du brauchst eine gute Quote, um den Checkpoint zu bestehen. Nimm Dir Zeit.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Was bildet ein ETF ab?",
				options: [
					"Die Meinung eines Fondsmanagers",
					"Einen Index",
					"Nur eine einzelne Aktie",
					"Den Goldpreis",
				],
				correct: 1,
				explanation: "Ein Index-ETF bildet einen Index möglichst genau nach.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"In einem marktkapitalisierten Index haben große Firmen mehr Gewicht als kleine.",
				correct: true,
				explanation: "Das Gewicht richtet sich nach dem Börsenwert.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Eine Firma hat 20 % Gewicht im Index und fällt um 10 %. Um wie viel Prozent fällt der Index dadurch?",
				min: 0,
				max: 10,
				step: 0.5,
				correct: 2,
				tolerance: 0.5,
				unit: "%",
				explanation: "20 % mal 10 % ergibt 2 %.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question: "Ordne den Index seiner Beschreibung zu.",
				pairs: [
					{ left: "S&P 500", right: "Etwa 500 große US-Firmen" },
					{ left: "MSCI World", right: "Industrieländer weltweit" },
					{ left: "MSCI EM", right: "Schwellenländer" },
					{ left: "FTSE All-World", right: "Industrie- und Schwellenländer" },
				],
				explanation:
					"Die Indizes unterscheiden sich vor allem in Regionen und Firmenzahl.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question:
					"Welches Land hat im MSCI World mit Abstand das größte Gewicht?",
				options: ["Deutschland", "Japan", "USA", "Frankreich"],
				correct: 2,
				explanation: "Die USA machen etwa 70 % aus (Stand: Anfang 2025).",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Wer viel in Aktien des eigenen Landes investiert, zeigt einen Home Bias.",
				correct: true,
				explanation:
					"Home Bias heißt: überproportional viele heimische Werte im Depot.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "order",
				question: "Sortiere nach Länderzahl im Index, die wenigsten zuerst.",
				items: [
					"S&P 500",
					"MSCI World",
					"MSCI Emerging Markets",
					"FTSE All-World",
				],
				explanation: "Ein Land, 23, 24 und knapp 50 Länder.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Was beschreibt die Tracking Difference?",
				options: [
					"Die Abweichung der ETF-Rendite vom Index",
					"Den Unterschied zwischen zwei Börsenplätzen",
					"Die Höhe der Dividende",
					"Die Zahl der Positionen",
				],
				correct: 0,
				explanation:
					"Sie zeigt, wie nah der ETF seinem Index tatsächlich kommt.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Ein thesaurierender ETF zahlt die Dividenden auf Dein Konto aus.",
				correct: false,
				explanation:
					"Das macht ein ausschüttender ETF. Ein thesaurierender legt sie wieder an.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Ein Welt-ETF kostet 0,2 % TER. Wie viel Euro Kosten sind das pro Jahr bei 10.000 € Anlage?",
				min: 0,
				max: 100,
				step: 1,
				correct: 20,
				tolerance: 2,
				unit: "€",
				explanation: "0,2 % von 10.000 € sind 20 €.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question: "Ordne die Nachbildungsart zu.",
				pairs: [
					{ left: "Physisch", right: "ETF kauft die Aktien" },
					{ left: "Synthetisch", right: "ETF nutzt einen Swap" },
				],
				explanation:
					"Bei synthetischen ETFs kommt ein Gegenpartei-Risiko hinzu.",
			},
		},
	],
}
