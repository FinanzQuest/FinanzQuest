import type { LessonDef } from "../../_engine/types"
import { LumpVsSparplan } from "./diagrams"

export const einmalVsSparplan: LessonDef = {
	id: "psychologie.einmal-vs-sparplan",
	title: "Einmalanlage vs. Sparplan",
	steps: [
		{
			type: "card",
			title: "Zwei Wege",
			body: "Einmalanlage: Du investierst eine Summe sofort. Sparplan: Du investierst jeden Monat einen festen Betrag. Meist entscheidet das Einkommen, denn wer nur monatlich spart, hat gar keine andere Wahl.",
		},
		{
			type: "card",
			title: "Vergleiche die Szenarien",
			body: "Wechsle den Kursverlauf. Beide investieren insgesamt 12.000 €, aber zu verschiedenen Zeitpunkten.",
			diagram: <LumpVsSparplan />,
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question:
					"In welchem Szenario schnitt der Sparplan im Vergleich besser ab?",
				options: [
					"Kurse steigen gleichmäßig",
					"Crash, dann Erholung",
					"Es gibt keinen Unterschied",
					"Nur wenn der Index nie fällt",
				],
				correct: 1,
				explanation:
					"Beim Crash kauft der Sparplan viele Anteile billig. Die Einmalanlage trifft das Hoch voll.",
			},
		},
		{
			type: "card",
			title: "Mythos Cost-Average",
			body: "Der Cost-Average-Effekt heißt: Du kaufst bei niedrigen Kursen mehr Anteile. Das stimmt, ist aber kein Gratis-Vorteil. Der Durchschnittspreis ist nur ein Rechenergebnis, kein Rabatt auf die Rendite.",
		},
		{
			type: "card",
			title: "Ehrlich betrachtet",
			body: "Weil Märkte im Schnitt steigen, liegt die Einmalanlage historisch in rund zwei von drei Fällen vorn (z. B. Vanguard-Studie). Der Sparplan senkt aber das Risiko, im ungünstigsten Moment alles zu investieren, und beruhigt das Gemüt.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Der Cost-Average-Effekt garantiert, dass ein Sparplan besser als eine Einmalanlage ist.",
				correct: false,
				explanation:
					"Er garantiert nichts. In steigenden Märkten gewinnt die Einmalanlage meist, weil das Geld früher arbeitet.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Wie oft lag die Einmalanlage historisch grob vor dem gestreckten Einstieg (ca.)?",
				min: 0,
				max: 100,
				step: 5,
				correct: 67,
				tolerance: 10,
				unit: "%",
				explanation:
					"Etwa in zwei Dritteln der Zeiträume, je nach Markt und Studie.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question: "Ordne den Vorteil dem Vorgehen zu.",
				pairs: [
					{ left: "Einmalanlage", right: "Geld ist sofort voll investiert" },
					{ left: "Sparplan", right: "Weniger Risiko, ein Hoch zu treffen" },
					{ left: "Sparplan", right: "Passt zum monatlichen Einkommen" },
				],
				explanation:
					"Beide Wege sind sinnvoll. Wichtig ist, überhaupt und dauerhaft zu investieren.",
			},
		},
	],
}
