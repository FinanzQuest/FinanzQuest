import type { LessonDef } from "../../_engine/types"

export const checkpoint: LessonDef = {
	id: "portfolio.checkpoint",
	title: "Checkpoint Portfolio",
	steps: [
		{
			type: "card",
			title: "Zeig, was Du gelernt hast",
			body: "Zehn Aufgaben zu Renditen, Risiko, Korrelation, Kennzahlen, Efficient Frontier, CAPM und Optionen. Einige musst Du kurz rechnen. Die Formeln stehen in den Erklärungen der Lektionen. Ein Taschenrechner hilft.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Dein Depot steigt in Jahr 1 um 80 % und fällt in Jahr 2 um 50 %. Welche konstante Jahresrendite (geometrisches Mittel) entspricht das?",
				min: -20,
				max: 20,
				step: 0.1,
				correct: -5.1,
				tolerance: 0.5,
				unit: "%",
				explanation:
					"Faktor 1,8 × 0,5 = 0,9. Geometrisches Mittel: √0,9 - 1 ≈ -5,1 % pro Jahr, obwohl der arithmetische Durchschnitt +15 % beträgt.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Die monatliche Volatilität eines Fonds beträgt 3 %. Wie hoch ist sie annualisiert?",
				min: 0,
				max: 25,
				step: 0.1,
				correct: 10.4,
				tolerance: 0.4,
				unit: "%",
				explanation: "3 % × √12 ≈ 3 % × 3,464 ≈ 10,4 %.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Zwei Aktien haben eine Kovarianz von 48 und Volatilitäten von 8 % und 10 %. Wie hoch ist die Korrelation?",
				min: -1,
				max: 1,
				step: 0.05,
				correct: 0.6,
				tolerance: 0.03,
				explanation: "ρ = 48 / (8 · 10) = 0,6.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question:
					"Was passiert mit dem Risiko einer 50/50-Mischung zweier Anlagen mit gleicher Volatilität, wenn die Korrelation von +1 auf 0 sinkt?",
				options: [
					"Es steigt",
					"Es bleibt gleich",
					"Es sinkt, auf etwa 71 % des Ausgangswerts",
					"Es sinkt auf null",
				],
				correct: 2,
				explanation:
					"σp = σ · √((1+ρ)/2): bei ρ = 1 ist es σ, bei ρ = 0 ist es σ · √0,5 ≈ 0,71 σ. Null wird nur bei ρ = -1 erreicht.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Ein Fonds erzielt 11 % bei 15 % Volatilität. Der risikofreie Zins liegt bei 2 %. Wie hoch ist die Sharpe Ratio?",
				min: 0,
				max: 1.5,
				step: 0.05,
				correct: 0.6,
				tolerance: 0.03,
				explanation: "S = (11 - 2) / 15 = 0,6.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Die Kovarianz einer Aktie mit dem Markt beträgt 0,0045, die Varianz des Marktes 0,0050. Wie hoch ist Beta?",
				min: 0,
				max: 2,
				step: 0.05,
				correct: 0.9,
				tolerance: 0.05,
				explanation: "β = Cov / σm² = 0,0045 / 0,0050 = 0,9.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Risikofreier Zins 3 %, erwartete Marktrendite 9 %, Beta 0,8. Welche Rendite erwartet das CAPM?",
				min: 0,
				max: 15,
				step: 0.1,
				correct: 7.8,
				tolerance: 0.2,
				unit: "%",
				explanation: "3 + 0,8 × 6 = 7,8 %.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "order",
				question:
					"Sortiere diese Fonds nach Sharpe Ratio (risikofreier Zins 2 %), von niedrig nach hoch.",
				items: [
					"6 % Rendite, 10 % Vol.",
					"8 % Rendite, 12 % Vol.",
					"10 % Rendite, 10 % Vol.",
					"12 % Rendite, 10 % Vol.",
				],
				explanation: "Die Sharpe Ratios sind 0,4, 0,5, 0,8 und 1,0.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question: "Ordne Begriff und Aussage zu.",
				pairs: [
					{ left: "Delta", right: "Optionspreis-Änderung pro Kursänderung" },
					{ left: "Theta", right: "Zeitwertverlust" },
					{ left: "Beta", right: "Empfindlichkeit zum Markt" },
					{ left: "Tangentialportfolio", right: "Höchste Sharpe Ratio" },
				],
				explanation:
					"Delta und Theta sind Optionskennzahlen, Beta stammt aus dem CAPM und das Tangentialportfolio aus der Portfoliotheorie.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Optionen sind riskant: Wer sie kauft, kann die gesamte Prämie verlieren. Deshalb werden sie in FinanzQuest nicht gehandelt.",
				correct: true,
				explanation:
					"Optionen können komplett wertlos verfallen. FinanzQuest konzentriert sich auf langfristiges Investieren mit Aktien und ETFs.",
			},
		},
	],
}
