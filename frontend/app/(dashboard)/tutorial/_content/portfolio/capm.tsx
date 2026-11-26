import type { LessonDef } from "../../_engine/types"
import { DiversificationCurve, SecurityMarketLine } from "./diagrams_b"
import { Tex, tex } from "./math"

export const capm: LessonDef = {
	id: "portfolio.capm",
	title: "CAPM",
	steps: [
		{
			type: "card",
			title: "Zwei Arten von Risiko",
			body: "Das Risiko einer einzelnen Aktie lässt sich zerlegen. Unsystematisches Risiko betrifft nur ein Unternehmen: ein Skandal, ein Produktflop, ein Streik. Systematisches (Markt-)Risiko betrifft alle: Rezession, Zinsschock, Krise. Das erste kannst Du wegstreuen, das zweite nicht.",
		},
		{
			type: "card",
			title: "Diversifikation wirkt, aber nicht unendlich",
			body: (
				<>
					<p>
						Bei <Tex>{tex`n`}</Tex> gleich gewichteten Aktien mit Volatilität{" "}
						<Tex>{tex`\sigma`}</Tex> und durchschnittlicher Korrelation{" "}
						<Tex>{tex`\rho`}</Tex> gilt:
					</p>
					<Tex
						block
					>{tex`\sigma_p^2 = \frac{\sigma^2}{n} + \left(1-\frac1n\right)\rho\,\sigma^2 \;\xrightarrow{\,n\to\infty\,}\; \rho\,\sigma^2`}</Tex>
					<p>
						Der erste Term (unsystematisch) verschwindet mit wachsendem{" "}
						<Tex>{tex`n`}</Tex>. Der zweite (systematisch) bleibt.
					</p>
				</>
			),
			diagram: <DiversificationCurve />,
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question:
					"Welches Risiko lässt sich durch Streuung auf viele Aktien praktisch wegdiversifizieren?",
				options: [
					"Das systematische Marktrisiko",
					"Das unsystematische Einzelrisiko",
					"Das Zinsrisiko aller Anleihen",
					"Beides vollständig",
				],
				correct: 1,
				explanation:
					"Unternehmensspezifische Ereignisse gleichen sich im Portfolio aus. Das Marktrisiko trifft alle gleichzeitig.",
			},
		},
		{
			type: "card",
			title: "Das CAPM",
			body: (
				<>
					<p>
						Das Capital Asset Pricing Model (Sharpe, Lintner, Mossin) folgert:
						Märkte belohnen nur das Risiko, das man nicht wegstreuen kann. Die
						erwartete Rendite hängt allein vom Beta ab:
					</p>
					<Tex
						block
					>{tex`E(r_i) = r_f + \beta_i\,\bigl(E(r_m) - r_f\bigr)`}</Tex>
					<p>
						Der Klammerterm ist die Marktrisikoprämie. Beispiel:{" "}
						<Tex>{tex`r_f=2\,\%`}</Tex>, <Tex>{tex`E(r_m)=8\,\%`}</Tex>,{" "}
						<Tex>{tex`\beta=1{,}2`}</Tex> ergibt{" "}
						<Tex>{tex`2 + 1{,}2\cdot 6 = 9{,}2\,\%`}</Tex>.
					</p>
				</>
			),
			diagram: <SecurityMarketLine />,
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Risikofreier Zins 3 %, erwartete Marktrendite 9 %, Beta der Aktie 0,8. Welche Rendite erwartet das CAPM?",
				min: 0,
				max: 15,
				step: 0.1,
				correct: 7.8,
				tolerance: 0.2,
				unit: "%",
				explanation: "3 + 0,8 × (9 - 3) = 3 + 4,8 = 7,8 %.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "order",
				question:
					"Risikofreier Zins 2 %, Marktrendite 8 %. Sortiere nach erwarteter CAPM-Rendite, von niedrig nach hoch.",
				items: ["Beta 0", "Beta 0,5", "Beta 1", "Beta 1,5"],
				explanation:
					"Die Renditen sind 2 %, 5 %, 8 % und 11 %. Die Wertpapierlinie steigt linear mit dem Beta.",
			},
		},
		{
			type: "card",
			title: "Grenzen des Modells",
			body: (
				<>
					<p>
						Das CAPM ist elegant, aber die Annahmen sind streng: rationale
						Anleger, keine Kosten oder Steuern, alle teilen dieselben
						Erwartungen, Renditen sind normalverteilt, man kann unbegrenzt zum
						risikofreien Zins leihen. In der Realität erklärt das Beta nur einen
						Teil der Renditeunterschiede. Weitere Faktoren wie Größe,
						Substanzwert (Value) oder Momentum spielen mit (Fama-French).
						Außerdem ist das Marktportfolio nicht direkt beobachtbar und Beta
						schwankt im Zeitverlauf. Sieh das CAPM als nützliche Denkhilfe,
						nicht als exakte Vorhersage.
					</p>
				</>
			),
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Laut CAPM wird zusätzliches unsystematisches Risiko mit einer höheren erwarteten Rendite belohnt.",
				correct: false,
				explanation:
					"Unsystematisches Risiko lässt sich kostenlos wegstreuen und wird deshalb nicht belohnt. Nur das Beta zählt.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question: "Ordne die Begriffe zu.",
				pairs: [
					{
						left: "Systematisches Risiko",
						right: "Betrifft den ganzen Markt, nicht wegstreubar",
					},
					{
						left: "Unsystematisches Risiko",
						right: "Betrifft ein Unternehmen, wegstreubar",
					},
					{
						left: "Marktrisikoprämie",
						right: "Erwartete Marktrendite minus risikofreier Zins",
					},
					{
						left: "Wertpapierlinie",
						right: "Erwartete Rendite in Abhängigkeit vom Beta",
					},
				],
				explanation:
					"Die Wertpapierlinie (Security Market Line) ist die grafische Form der CAPM-Formel.",
			},
		},
	],
}
