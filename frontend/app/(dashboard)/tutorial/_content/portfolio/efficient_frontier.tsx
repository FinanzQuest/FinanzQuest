import type { LessonDef } from "../../_engine/types"
import { FrontierExplorer } from "./diagrams_b"
import { Tex, tex } from "./math"

export const efficientFrontier: LessonDef = {
	id: "portfolio.efficient-frontier",
	title: "Efficient Frontier",
	steps: [
		{
			type: "card",
			title: "Mischen verändert das Risiko",
			body: "Die Rendite eines Portfolios ist einfach der gewichtete Durchschnitt der Einzelrenditen. Beim Risiko ist das anders: Es hängt davon ab, wie die Anlagen zusammen schwanken. Das ist der mathematische Kern der Diversifikation, die Harry Markowitz 1952 beschrieb.",
		},
		{
			type: "card",
			title: "Portfolio aus zwei Anlagen",
			body: (
				<>
					<p>
						Anteil <Tex>{tex`w`}</Tex> in Anlage 1, <Tex>{tex`1-w`}</Tex> in
						Anlage 2:
					</p>
					<Tex block>{tex`\mu_p = w\,\mu_1 + (1-w)\,\mu_2`}</Tex>
					<Tex
						block
					>{tex`\sigma_p^2 = w^2\sigma_1^2 + (1-w)^2\sigma_2^2 + 2\,w(1-w)\,\rho\,\sigma_1\sigma_2`}</Tex>
					<p>
						Der letzte Term enthält die Korrelation. Bei{" "}
						<Tex>{tex`\rho = 1`}</Tex> wird daraus{" "}
						<Tex>{tex`\sigma_p = w\sigma_1+(1-w)\sigma_2`}</Tex>: kein
						Diversifikationseffekt. Je kleiner <Tex>{tex`\rho`}</Tex>, desto
						kleiner <Tex>{tex`\sigma_p`}</Tex>. Beispiel: zwei Anlagen mit je 10
						% Vol., 50/50, <Tex>{tex`\rho = 0`}</Tex>:{" "}
						<Tex>{tex`\sigma_p = \sqrt{0{,}25\cdot100 + 0{,}25\cdot100} \approx 7{,}07\,\%`}</Tex>
						.
					</p>
				</>
			),
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Zwei Anlagen haben je 10 % Volatilität und sind unkorreliert (ρ = 0). Du mischst 50/50. Wie hoch ist die Portfolio-Volatilität?",
				min: 0,
				max: 12,
				step: 0.1,
				correct: 7.07,
				tolerance: 0.3,
				unit: "%",
				explanation:
					"σp² = 0,25 · 100 + 0,25 · 100 + 0 = 50, also σp = √50 ≈ 7,07 %.",
			},
		},
		{
			type: "card",
			title: "Erkunde die Frontier",
			body: "Die Kurve zeigt alle Mischungen aus Aktien und Anleihen. Der Anteil-Regler setzt den roten Punkt. Der grüne Punkt hat das geringste Risiko, das Minimum-Varianz-Portfolio. Alles darunter ist ineffizient, denn auf dem oberen Ast gibt es bei gleichem Risiko mehr Rendite: das ist die Efficient Frontier. Ändere die Korrelation und beobachte, wie die Kurve nach links wandert.",
			diagram: <FrontierExplorer />,
		},
		{
			type: "exercise",
			exercise: {
				kind: "order",
				question:
					"Zwei gleich riskante Anlagen (je 10 % Vol.), 50/50 gemischt. Sortiere nach Portfolio-Risiko, vom kleinsten zum größten.",
				items: ["ρ = -1", "ρ = 0", "ρ = 0,5", "ρ = 1"],
				explanation:
					"σp = 10 % · √((1+ρ)/2). Je niedriger die Korrelation, desto stärker der Diversifikationseffekt.",
			},
		},
		{
			type: "card",
			title: "Mit risikofreiem Zins: Tangentialportfolio",
			body: (
				<>
					<p>
						Kannst Du auch zum risikofreien Zins <Tex>{tex`r_f`}</Tex> anlegen,
						mischst Du ein riskantes Portfolio mit risikofreiem Geld. Die
						Mischungen liegen auf einer Geraden, der Kapitalmarktlinie. Am
						besten ist die Gerade mit der größten Steigung, also der höchsten
						Sharpe Ratio. Sie berührt die Frontier im Tangentialportfolio
						(gelb):
					</p>
					<Tex block>{tex`\max_w \; \frac{\mu_p - r_f}{\sigma_p}`}</Tex>
					<p>
						Wer mehr Risiko will, mischt nicht andere Aktien bei, sondern hält
						mehr vom Tangentialportfolio. Wer weniger will, hält mehr
						risikofreies Geld. In der Praxis ist der breite Weltmarkt eine gute
						Annäherung an dieses Portfolio.
					</p>
				</>
			),
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Was zeichnet das Tangentialportfolio aus?",
				options: [
					"Es hat das geringste Risiko aller Portfolios",
					"Es hat die höchste Sharpe Ratio aller riskanten Portfolios",
					"Es enthält nur eine einzige Aktie",
					"Es hat die höchste Rendite überhaupt",
				],
				correct: 1,
				explanation:
					"Das Minimum-Varianz-Portfolio hat das geringste Risiko, das Tangentialportfolio die beste Rendite pro Risiko.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Sind zwei Anlagen perfekt korreliert (ρ = 1), senkt Mischen das Risiko unter den gewichteten Durchschnitt der Einzelrisiken.",
				correct: false,
				explanation:
					"Bei ρ = 1 ist σp genau der gewichtete Durchschnitt der Volatilitäten. Diversifikation wirkt erst bei ρ < 1.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question: "Ordne Begriff und Bedeutung zu.",
				pairs: [
					{
						left: "Minimum-Varianz-Portfolio",
						right: "Geringstes Risiko aller Mischungen",
					},
					{
						left: "Tangentialportfolio",
						right: "Höchste Sharpe Ratio",
					},
					{
						left: "Kapitalmarktlinie",
						right: "Mischungen mit risikofreiem Zins",
					},
					{
						left: "Efficient Frontier",
						right: "Maximale Rendite bei gegebenem Risiko",
					},
				],
				explanation:
					"Die Frontier ist der obere Rand der erreichbaren Portfolios. Mit risikofreiem Zins wird daraus die Kapitalmarktlinie durch das Tangentialportfolio.",
			},
		},
	],
}
