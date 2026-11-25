import type { LessonDef } from "../../_engine/types"
import { SqrtTime, WealthPaths } from "./diagrams_a"
import { Tex, tex } from "./math"

export const renditeVolatilitaetMathe: LessonDef = {
	id: "portfolio.rendite-volatilitaet-mathe",
	title: "Rendite & Volatilität",
	steps: [
		{
			type: "card",
			title: "Rendite präzise",
			body: (
				<>
					<p>
						Die Rendite einer Periode ist die relative Wertänderung. Mit dem
						Kurs <Tex>{tex`P_t`}</Tex> am Ende und <Tex>{tex`P_{t-1}`}</Tex> am
						Anfang gilt:
					</p>
					<Tex
						block
					>{tex`r_t = \frac{P_t - P_{t-1}}{P_{t-1}} = \frac{P_t}{P_{t-1}} - 1`}</Tex>
					<p>
						Steigt eine Aktie von 100 auf 110, ist <Tex>{tex`r = 0{,}10`}</Tex>,
						also 10 %. Aus mehreren Perioden willst Du eine einzige typische
						Rendite machen. Dafür gibt es zwei Mittelwerte.
					</p>
				</>
			),
		},
		{
			type: "card",
			title: "Arithmetisch vs. geometrisch",
			body: (
				<>
					<p>Das arithmetische Mittel ist der normale Durchschnitt:</p>
					<Tex
						block
					>{tex`\bar r_{\text{arith}} = \frac{1}{n}\sum_{i=1}^{n} r_i`}</Tex>
					<p>
						Das geometrische Mittel fragt: Welche konstante Jahresrendite hätte
						Dich zum selben Endwert gebracht?
					</p>
					<Tex
						block
					>{tex`\bar r_{\text{geo}} = \left(\prod_{i=1}^{n}(1+r_i)\right)^{1/n} - 1`}</Tex>
					<p>
						Beispiel: +10 %, +20 %, -10 % ergibt einen Faktor{" "}
						<Tex>{tex`1{,}1 \cdot 1{,}2 \cdot 0{,}9 = 1{,}188`}</Tex>. Das
						geometrische Mittel ist{" "}
						<Tex>{tex`1{,}188^{1/3}-1 \approx 5{,}9\,\%`}</Tex>, das
						arithmetische <Tex>{tex`6{,}7\,\%`}</Tex>.
					</p>
				</>
			),
		},
		{
			type: "card",
			title: "Warum das so wichtig ist",
			body: "Verluste wirken stärker als gleich große Gewinne: Nach -50 % brauchst Du +100 %, um wieder bei null zu sein. Das arithmetische Mittel ist deshalb immer mindestens so groß wie das geometrische, und der Abstand wächst mit der Schwankung. Für Dein tatsächliches Vermögen zählt das geometrische Mittel. Probiere es aus.",
			diagram: <WealthPaths />,
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question:
					"Dein Depot (100 €) steigt um 50 % und fällt im Jahr darauf um 50 %. Wie viel ist es dann wert?",
				options: ["100 €", "75 €", "50 €", "125 €"],
				correct: 1,
				explanation:
					"100 × 1,5 = 150, danach 150 × 0,5 = 75. Der arithmetische Durchschnitt ist 0 %, das geometrische Mittel aber √(1,5 · 0,5) - 1 ≈ -13,4 % pro Jahr.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Das geometrische Mittel mehrerer Renditen ist nie größer als das arithmetische.",
				correct: true,
				explanation:
					"Das ist die Ungleichung vom arithmetischen und geometrischen Mittel. Gleichheit gibt es nur, wenn alle Renditen identisch sind.",
			},
		},
		{
			type: "card",
			title: "Volatilität als Standardabweichung",
			body: (
				<>
					<p>
						Risiko messen wir als Streuung der Renditen um ihren Mittelwert. Die
						(Stichproben-)Varianz und die Standardabweichung sind:
					</p>
					<Tex
						block
					>{tex`\sigma^2 = \frac{1}{n-1}\sum_{i=1}^{n}(r_i-\bar r)^2, \qquad \sigma = \sqrt{\sigma^2}`}</Tex>
					<p>
						Beispiel mit 4 %, 8 %, 12 %: Mittel 8 %, Abweichungen -4, 0, +4,
						Quadrate 16, 0, 16, Summe 32, geteilt durch <Tex>{tex`n-1=2`}</Tex>{" "}
						ergibt Varianz 16 und <Tex>{tex`\sigma = 4\,\%`}</Tex>. Die
						Standardabweichung der Renditen nennt man Volatilität. Bei ungefähr
						normalverteilten Renditen liegen etwa zwei Drittel der Perioden
						innerhalb von <Tex>{tex`\bar r \pm \sigma`}</Tex>.
					</p>
				</>
			),
		},
		{
			type: "exercise",
			exercise: {
				kind: "order",
				question:
					"Bringe die Schritte zur Berechnung der Volatilität in die richtige Reihenfolge.",
				items: [
					"Mittelwert der Renditen berechnen",
					"Abweichung jeder Rendite vom Mittelwert bilden",
					"Abweichungen quadrieren und summieren",
					"Durch n - 1 teilen (Varianz)",
					"Wurzel ziehen (Standardabweichung)",
				],
				explanation:
					"Mittel, Abweichungen, Quadrate, Summe durch n - 1 und zuletzt die Wurzel, damit die Einheit wieder Prozent ist.",
			},
		},
		{
			type: "card",
			title: "Hochrechnen auf ein Jahr",
			body: (
				<>
					<p>
						Tägliche, monatliche und jährliche Zahlen lassen sich nur
						vergleichen, wenn sie auf denselben Zeitraum gebracht werden. Sind
						die Renditen unabhängig, addieren sich die <em>Varianzen</em>, nicht
						die Standardabweichungen:
					</p>
					<Tex block>{tex`\sigma_{T} = \sigma_{1}\cdot\sqrt{T}`}</Tex>
					<p>
						Mit 252 Handelstagen gilt{" "}
						<Tex>{tex`\sigma_{\text{Jahr}} = \sigma_{\text{Tag}}\sqrt{252}`}</Tex>
						, mit Monatswerten <Tex>{tex`\sigma_{\text{Monat}}\sqrt{12}`}</Tex>.
						Die Rendite dagegen wächst linear mit der Zeit, die Volatilität nur
						mit der Wurzel.
					</p>
				</>
			),
			diagram: <SqrtTime />,
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Eine Aktie hat eine tägliche Volatilität von 1 %. Wie hoch ist die Volatilität pro Jahr (252 Handelstage)?",
				min: 0,
				max: 30,
				step: 0.1,
				correct: 15.9,
				tolerance: 0.5,
				unit: "%",
				explanation: "1 % × √252 ≈ 1 % × 15,87 ≈ 15,9 %.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question: "Ordne Begriff und Bedeutung zu.",
				pairs: [
					{
						left: "Arithmetisches Mittel",
						right: "Durchschnitt der Einzelrenditen",
					},
					{
						left: "Geometrisches Mittel",
						right: "Konstante Rendite mit gleichem Endwert",
					},
					{ left: "Varianz", right: "Mittlere quadrierte Abweichung" },
					{ left: "Volatilität", right: "Wurzel der Varianz, annualisiert" },
				],
				explanation:
					"Das arithmetische Mittel beschreibt eine typische Periode, das geometrische Dein Wachstum. Volatilität ist die auf ein Jahr gebrachte Standardabweichung.",
			},
		},
	],
}
