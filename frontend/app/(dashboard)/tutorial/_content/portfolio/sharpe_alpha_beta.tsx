import type { LessonDef } from "../../_engine/types"
import { BetaLine, SharpeBars } from "./diagrams_a"
import { Tex, tex } from "./math"

export const sharpeAlphaBeta: LessonDef = {
	id: "portfolio.sharpe-alpha-beta",
	title: "Sharpe, Alpha & Beta",
	steps: [
		{
			type: "card",
			title: "Rendite pro Risiko",
			body: "Ein Fonds mit 12 % Rendite klingt besser als einer mit 8 %. Aber wenn er dafür viel stärker schwankt? Kennzahlen setzen Rendite und Risiko ins Verhältnis, damit Du fair vergleichen kannst.",
		},
		{
			type: "card",
			title: "Sharpe Ratio",
			body: (
				<>
					<p>
						Die Sharpe Ratio misst die Überrendite gegenüber dem risikofreien
						Zins (<Tex>{tex`r_f`}</Tex>, z. B. Tagesgeld oder Bundesanleihen)
						pro Einheit Volatilität:
					</p>
					<Tex block>{tex`S = \frac{\bar r_p - r_f}{\sigma_p}`}</Tex>
					<p>
						Beispiel mit <Tex>{tex`r_f = 2\,\%`}</Tex>: Fonds A (8 % Rendite, 12
						% Vol.) hat <Tex>{tex`S = 6/12 = 0{,}5`}</Tex>. Fonds B (12 %, 20 %)
						hat <Tex>{tex`S = 10/20 = 0{,}5`}</Tex>. Fonds C (10 %, 10 %) hat{" "}
						<Tex>{tex`S = 8/10 = 0{,}8`}</Tex>. B hat zwar die höchste Rendite,
						aber C die beste Rendite pro Risiko.
					</p>
				</>
			),
			diagram: <SharpeBars />,
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question:
					"Risikofreier Zins 2 %. Welcher Fonds hat die beste Sharpe Ratio? X: 7 % Rendite / 10 % Vol. Y: 9 % / 14 %. Z: 5 % / 4 %.",
				options: ["X", "Y", "Z", "Alle gleich"],
				correct: 2,
				explanation:
					"X: 5/10 = 0,5. Y: 7/14 = 0,5. Z: 3/4 = 0,75. Z liefert die meiste Überrendite pro Risikoeinheit.",
			},
		},
		{
			type: "card",
			title: "Beta: Empfindlichkeit zum Markt",
			body: (
				<>
					<p>
						Beta sagt, wie stark eine Aktie im Mittel auf Bewegungen des
						Gesamtmarkts (<Tex>{tex`m`}</Tex>) reagiert. Es ist die Steigung der
						Regressionsgeraden:
					</p>
					<Tex
						block
					>{tex`\beta_i = \frac{\operatorname{Cov}(r_i, r_m)}{\sigma_m^{2}} = \rho_{im}\,\frac{\sigma_i}{\sigma_m}`}</Tex>
					<p>
						Beispiel: <Tex>{tex`\operatorname{Cov}=0{,}0054`}</Tex> und{" "}
						<Tex>{tex`\sigma_m^2 = 0{,}0036`}</Tex> ergibt{" "}
						<Tex>{tex`\beta = 1{,}5`}</Tex>. Beta 1 heißt: wie der Markt. Beta
						über 1: aggressiver. Beta unter 1: defensiver.
					</p>
				</>
			),
			diagram: <BetaLine />,
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Eine Aktie mit Beta 1,5 fällt bei einem Marktrückgang von 10 % im Mittel um etwa 15 %.",
				correct: true,
				explanation:
					"Erwartete Reaktion: β × Marktbewegung = 1,5 × (-10 %) = -15 %.",
			},
		},
		{
			type: "card",
			title: "Alpha nach Jensen",
			body: (
				<>
					<p>
						Alpha ist die Rendite, die über das hinausgeht, was das Beta
						erklärt:
					</p>
					<Tex
						block
					>{tex`\alpha = \bar r_i - \left[r_f + \beta\,(\bar r_m - r_f)\right]`}</Tex>
					<p>
						Beispiel: <Tex>{tex`r_f = 2\,\%`}</Tex>,{" "}
						<Tex>{tex`\bar r_m = 8\,\%`}</Tex>, <Tex>{tex`\beta = 1{,}5`}</Tex>.
						Erwartet wären <Tex>{tex`2 + 1{,}5\cdot 6 = 11\,\%`}</Tex>. Hat der
						Fonds 13 % erzielt, ist <Tex>{tex`\alpha = +2\,\%`}</Tex>. Positives
						Alpha spricht für gutes Management, wird aber selten dauerhaft
						erreicht und ist statistisch schwer von Glück zu trennen.
					</p>
				</>
			),
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Ein Fonds mit Beta 1,5 erzielte 13 %. Risikofreier Zins 2 %, Marktrendite 8 %. Wie hoch ist Alpha?",
				min: -5,
				max: 5,
				step: 0.5,
				correct: 2,
				tolerance: 0.25,
				unit: "%",
				explanation:
					"Erwartet: 2 + 1,5 × (8 - 2) = 11 %. Alpha = 13 - 11 = +2 %.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "order",
				question: "Sortiere diese Aktien nach Beta, vom kleinsten zum größten.",
				items: [
					"Gold-Aktie, die bei Marktstress steigt (Beta -0,2)",
					"Versorger (Beta 0,5)",
					"Marktindex-ETF (Beta 1,0)",
					"Technologie-Wachstumswert (Beta 1,6)",
				],
				explanation:
					"Defensive Werte reagieren schwächer auf den Markt, zyklische und Wachstumswerte stärker. Ein negatives Beta bewegt sich gegen den Markt.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question: "Welche Kennzahl beantwortet welche Frage?",
				pairs: [
					{
						left: "Sharpe Ratio",
						right: "Wie viel Überrendite pro Risiko?",
					},
					{ left: "Beta", right: "Wie stark folgt die Anlage dem Markt?" },
					{
						left: "Alpha",
						right: "Wie viel Rendite über der Erwartung laut Beta?",
					},
					{ left: "Volatilität", right: "Wie stark schwanken die Renditen?" },
				],
				explanation:
					"Sharpe bewertet das Gesamtrisiko, Beta nur das Marktrisiko, Alpha die Leistung jenseits davon.",
			},
		},
	],
}
