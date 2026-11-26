import type { LessonDef } from "../../_engine/types"
import { CorrelationScatter } from "./diagrams_a"
import { Tex, tex } from "./math"

export const kovarianzKorrelation: LessonDef = {
	id: "portfolio.kovarianz-korrelation",
	title: "Kovarianz & Korrelation",
	steps: [
		{
			type: "card",
			title: "Wie bewegen sich zwei Anlagen?",
			body: "Die Volatilität sagt nur, wie stark eine einzelne Anlage schwankt. Für ein Portfolio ist entscheidend, ob zwei Anlagen gleichzeitig steigen und fallen oder sich ausgleichen. Dafür brauchst Du ein Maß für den gemeinsamen Gang: die Kovarianz.",
		},
		{
			type: "card",
			title: "Kovarianz",
			body: (
				<>
					<p>
						Die Kovarianz multipliziert die Abweichungen zweier Renditereihen
						vom jeweiligen Mittelwert und mittelt das Ergebnis:
					</p>
					<Tex
						block
					>{tex`\operatorname{Cov}(X,Y) = \frac{1}{n-1}\sum_{i=1}^{n}(x_i-\bar x)(y_i-\bar y)`}</Tex>
					<p>
						Liegen beide Werte im selben Zeitraum über (oder unter) ihrem
						Mittel, ist das Produkt positiv. Gegenläufige Abweichungen ergeben
						ein negatives Produkt. Die Kovarianz einer Reihe mit sich selbst ist
						die Varianz: <Tex>{tex`\operatorname{Cov}(X,X)=\sigma_X^2`}</Tex>.
					</p>
				</>
			),
		},
		{
			type: "card",
			title: "Korrelation: normiert auf -1 bis +1",
			body: (
				<>
					<p>
						Die Zahl der Kovarianz hängt von den Einheiten ab und ist schwer zu
						deuten. Teilst Du durch beide Volatilitäten, erhältst Du den
						Korrelationskoeffizienten:
					</p>
					<Tex
						block
					>{tex`\rho_{XY} = \frac{\operatorname{Cov}(X,Y)}{\sigma_X\,\sigma_Y}, \qquad -1 \le \rho \le 1`}</Tex>
					<p>
						<Tex>{tex`\rho = 1`}</Tex>: perfekter Gleichlauf.{" "}
						<Tex>{tex`\rho = 0`}</Tex>: kein linearer Zusammenhang.{" "}
						<Tex>{tex`\rho = -1`}</Tex>: perfekt gegenläufig. Beispiel:{" "}
						<Tex>{tex`\operatorname{Cov}=60,\ \sigma_X=10,\ \sigma_Y=8`}</Tex>{" "}
						ergibt <Tex>{tex`\rho = 60/80 = 0{,}75`}</Tex>.
					</p>
				</>
			),
		},
		{
			type: "card",
			title: "Sieh die Korrelation",
			body: "Bei hoher positiver Korrelation liegen die Punkte nah an einer steigenden Geraden. Bei 0 bilden sie eine Wolke. Bei negativer Korrelation fällt die Gerade. Ziehe den Regler und achte auch darauf, wie die Kovarianz mitwandert.",
			diagram: <CorrelationScatter />,
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Zwei Fonds haben eine Kovarianz von 60 und Volatilitäten von 10 % und 8 %. Wie hoch ist die Korrelation?",
				min: -1,
				max: 1,
				step: 0.05,
				correct: 0.75,
				tolerance: 0.03,
				explanation: "ρ = Cov / (σ₁ · σ₂) = 60 / (10 · 8) = 0,75.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question:
					"Welche Korrelation zwischen zwei Anlagen ist für die Risikostreuung am wertvollsten?",
				options: ["+1", "+0,5", "0", "-0,5"],
				correct: 3,
				explanation:
					"Je kleiner die Korrelation, desto mehr gleichen sich Schwankungen aus. Bei -0,5 ist der Effekt von den genannten Werten am stärksten.",
			},
		},
		{
			type: "card",
			title: "Grenzen der Korrelation",
			body: (
				<>
					<p>
						Die Korrelation misst nur lineare Zusammenhänge. Zwei Größen können
						eng verbunden sein und trotzdem <Tex>{tex`\rho \approx 0`}</Tex>{" "}
						haben, etwa bei einem U-förmigen Zusammenhang. Außerdem ist sie
						nicht stabil: In Krisen steigen die Korrelationen zwischen
						Aktienmärkten oft deutlich. Genau dann, wenn Du die Streuung am
						meisten brauchst, wirkt sie schwächer. Und Korrelation ist keine
						Kausalität.
					</p>
				</>
			),
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Eine Korrelation von 0 beweist, dass zwei Anlagen überhaupt nichts miteinander zu tun haben.",
				correct: false,
				explanation:
					"Korrelation 0 heißt nur: kein linearer Zusammenhang. Nichtlineare Abhängigkeiten bleiben möglich.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "order",
				question:
					"Sortiere diese Korrelationskoeffizienten vom kleinsten (stärkste Streuung) zum größten.",
				items: ["-0,6", "-0,1", "0,3", "0,95"],
				explanation:
					"-0,6 gleicht Schwankungen stark aus, 0,95 fast gar nicht. Zwei Fonds auf denselben Index haben typischerweise eine Korrelation nahe 1.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question: "Ordne Korrelation und Beschreibung zu.",
				pairs: [
					{ left: "ρ = 1", right: "Perfekter Gleichlauf" },
					{ left: "ρ = 0", right: "Kein linearer Zusammenhang" },
					{ left: "ρ = -1", right: "Perfekt gegenläufig" },
					{ left: "Cov > 0", right: "Meist gleiche Richtung" },
				],
				explanation:
					"Das Vorzeichen der Kovarianz gibt die Richtung, die Korrelation zusätzlich die Stärke auf einer Skala von -1 bis +1.",
			},
		},
	],
}
