import type { LessonDef } from "../../_engine/types"
import { MixSlider } from "./diagrams"

export const anleihenImPortfolio: LessonDef = {
	id: "anleihen.anleihen-im-portfolio",
	title: "Anleihen im Portfolio",
	steps: [
		{
			type: "card",
			title: "Der Risikopuffer",
			body: "Anleihen schwanken meist weniger als Aktien und zahlen planbare Erträge. Sie dämpfen die Schwankungen Deines Depots. Dafür ist ihre erwartete Rendite langfristig niedriger. Du tauschst also Rendite gegen Ruhe.",
		},
		{
			type: "card",
			title: "Korrelation mit Haken",
			body: "In vielen Aktienkrisen (z. B. 2008) stiegen Staatsanleihen, weil Zinsen sanken. Die Korrelation war niedrig oder negativ. 2022 aber fielen beide gleichzeitig, weil Inflation und Zinsen stiegen. Der Puffer wirkt also nicht immer.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement: "Staatsanleihen steigen bei fallenden Aktienkursen immer.",
				correct: false,
				explanation:
					"2022 fielen Aktien und Anleihen zusammen. Ob Anleihen puffern, hängt davon ab, warum die Märkte fallen.",
			},
		},
		{
			type: "card",
			title: "Die richtige Mischung",
			body: "Der Aktienanteil hängt von Anlagehorizont und Risikobereitschaft ab. Brauchst Du das Geld in 2 Jahren, ist der Anleihenanteil hoch. Hast Du 30 Jahre Zeit und verkraftest Schwankungen, kann er niedrig sein. Teste verschiedene Mischungen.",
			diagram: <MixSlider />,
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Bei Aktien ca. 7 % und Anleihen ca. 3 % erwarteter Rendite pro Jahr: Welche Rendite erwartest Du bei 50 / 50?",
				min: 0,
				max: 10,
				step: 0.5,
				correct: 5,
				tolerance: 0.5,
				unit: "%",
				explanation: "Gewichteter Durchschnitt: 0,5 × 7 + 0,5 × 3 = 5 %.",
			},
		},
		{
			type: "card",
			title: "Kurz oder lang?",
			body: "Kurzlaufende Anleihen haben wenig Zinsrisiko, aber meist weniger Rendite. Langlaufende zahlen mehr, schwanken aber stark. Wer einen sicheren Puffer will, wählt eher kurze bis mittlere Laufzeiten. Wer Rendite sucht, nimmt mehr Zinsrisiko in Kauf.",
		},
		{
			type: "card",
			title: "Anleihen-ETFs und Tagesgeld",
			body: "Ein Anleihen-ETF bündelt viele Anleihen und bleibt dauerhaft bei einer Laufzeit, hat also keinen festen Rückzahlungstermin. Tagesgeld hat keine Kursschwankung und ist einlagengesichert, aber der Zins kann jederzeit sinken. Für die Notreserve ist Tagesgeld passender.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question:
					"Du brauchst in 18 Monaten sicher 10.000 € für ein Studium im Ausland. Was passt am besten?",
				options: [
					"Aktien-ETF",
					"30-jähriger Anleihen-ETF",
					"Tagesgeld oder kurzlaufende Anleihen",
					"Einzelne High-Yield-Anleihe",
				],
				correct: 2,
				explanation:
					"Bei kurzem Horizont zählt Planbarkeit. Aktien und lange Anleihen können gerade dann im Minus sein.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question: "Ordne Anlageziel und passende Tendenz zu.",
				pairs: [
					{
						left: "Ziel in 2 Jahren",
						right: "Hoher Anleihen- oder Tagesgeldanteil",
					},
					{
						left: "Altersvorsorge in 35 Jahren",
						right: "Hoher Aktienanteil möglich",
					},
					{
						left: "Schlechter Schlaf bei Verlusten",
						right: "Mehr Anleihen zur Beruhigung",
					},
				],
				explanation:
					"Horizont und Risikobereitschaft bestimmen die Mischung, nicht ein Standardrezept.",
			},
		},
	],
}
