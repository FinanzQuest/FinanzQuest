import type { LessonDef } from "../../_engine/types"
import { RebalanceDemo } from "./diagrams"

export const rebalancing: LessonDef = {
	id: "psychologie.rebalancing",
	title: "Rebalancing",
	steps: [
		{
			type: "card",
			title: "Der Anteil driftet",
			body: "Du startest mit 70 Prozent Aktien und 30 Prozent Anleihen. Steigen die Aktien stärker, wächst ihr Anteil von allein, und damit auch Dein Risiko. Das nennt man Drift.",
		},
		{
			type: "card",
			title: "Probiere es aus",
			body: "Verschiebe die Aktien-Rendite und beobachte den Anteil. Dann gleiche mit einem Klick wieder auf 70/30 aus.",
			diagram: <RebalanceDemo />,
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question:
					"Aktien steigen stark, Anleihen kaum. Was passiert mit Deinem Aktienanteil?",
				options: [
					"Er sinkt",
					"Er bleibt gleich",
					"Er steigt",
					"Er wird zufällig",
				],
				correct: 2,
				explanation:
					"Der Anteil der stärker gewachsenen Anlage wird größer, das Depot wird riskanter.",
			},
		},
		{
			type: "card",
			title: "Wie rebalancen?",
			body: "Du verkaufst, was zu groß wurde, und kaufst, was zu klein ist. Oder Du lenkst neue Sparraten in den untergewichteten Teil. Das ist günstiger, weil es meist keine Verkäufe und keine Steuern auslöst.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "order",
				question:
					"Bringe die Schritte des Rebalancings in die richtige Reihenfolge.",
				items: [
					"Zielanteile festlegen (z. B. 70/30)",
					"Aktuelle Anteile prüfen",
					"Abweichung feststellen",
					"Übergewichtetes verkaufen, Untergewichtetes kaufen",
				],
				explanation:
					"Erst das Ziel, dann messen, dann angleichen. Einmal im Jahr genügt meist.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Ein 70/30-Depot mit 10.000 €: Aktien wachsen auf 9.100 €, Anleihen bleiben bei 3.000 €. Wie hoch ist der Aktienanteil jetzt (ca.)?",
				min: 50,
				max: 90,
				step: 1,
				correct: 75,
				tolerance: 2,
				unit: "%",
				explanation: "9.100 / 12.100 sind ca. 75 Prozent, das Ziel waren 70.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Rebalancing zwingt Dich dazu, Gewinner teilweise zu verkaufen und Verlierer nachzukaufen.",
				correct: true,
				explanation:
					"Das fühlt sich unnatürlich an, hält aber Dein Risiko konstant.",
			},
		},
	],
}
