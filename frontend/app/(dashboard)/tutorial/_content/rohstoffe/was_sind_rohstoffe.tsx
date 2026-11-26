import type { LessonDef } from "../../_engine/types"

export const wasSindRohstoffe: LessonDef = {
	id: "rohstoffe.was-sind-rohstoffe",
	title: "Was sind Rohstoffe?",
	steps: [
		{
			type: "card",
			title: "Grundstoffe der Wirtschaft",
			body: "Rohstoffe (englisch Commodities) sind Grundstoffe, die kaum verarbeitet gehandelt werden: Öl, Gold, Weizen, Kupfer. Eine Tonne Weizen einer Sorte ist weitgehend austauschbar mit einer anderen. Deshalb gibt es einen gemeinsamen Marktpreis.",
		},
		{
			type: "card",
			title: "Drei Gruppen",
			body: "Energie: Rohöl, Erdgas. Metalle: Edelmetalle wie Gold und Silber, Industriemetalle wie Kupfer. Agrarrohstoffe: Weizen, Mais, Kaffee, Zucker. Jede Gruppe hat eigene Preistreiber.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question: "Ordne den Rohstoff seiner Gruppe zu.",
				pairs: [
					{ left: "Rohöl", right: "Energie" },
					{ left: "Kupfer", right: "Metalle" },
					{ left: "Weizen", right: "Agrar" },
				],
				explanation:
					"Öl und Gas sind Energie, Kupfer und Gold sind Metalle, Weizen, Mais und Kaffee sind Agrarprodukte.",
			},
		},
		{
			type: "card",
			title: "Spotpreis",
			body: "Der Spotpreis ist der Preis für sofortige Lieferung. Wer heute eine Tonne Kupfer kauft und sofort liefern lässt, zahlt den Spotpreis.",
		},
		{
			type: "card",
			title: "Terminkontrakt (Future)",
			body: "Ein Future ist ein Vertrag, einen Rohstoff zu einem festen Preis zu einem späteren Termin zu kaufen oder zu verkaufen. Landwirte und Firmen sichern damit ihre Preise ab. Anleger nutzen Futures meist, ohne die Ware je zu erhalten.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Was beschreibt einen Future am besten?",
				options: [
					"Sofortiger Kauf zum aktuellen Preis",
					"Vertrag über Kauf oder Verkauf zu einem festen Preis zu einem späteren Termin",
					"Eine Aktie eines Rohstoffkonzerns",
					"Ein Zinspapier",
				],
				correct: 1,
				explanation:
					"Ein Future legt Preis und Termin fest, an dem später geliefert oder abgerechnet wird.",
			},
		},
		{
			type: "card",
			title: "Wie Anleger Zugang finden",
			body: "Wenige Privatanleger kaufen Fässer Öl. Üblich sind börsengehandelte Produkte, die Rohstoffpreise nachbilden, oder Aktien von Rohstoffunternehmen. Bei Gold gibt es Produkte, die durch physisches Metall gedeckt sind. Bei vielen anderen Rohstoffen wird über Futures nachgebildet.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Eine Aktie eines Ölkonzerns und der Ölpreis selbst sind dasselbe.",
				correct: false,
				explanation:
					"Die Aktie hängt auch von Management, Kosten und Gewinnen ab. Sie hängt oft mit dem Ölpreis zusammen, ist aber nicht identisch.",
			},
		},
		{
			type: "card",
			title: "Keine Erträge, nur Preis",
			body: "Ein Barrel Öl oder ein Barren Gold zahlt weder Zinsen noch Dividenden. Die Rendite entsteht nur durch Preisänderungen. Das unterscheidet Rohstoffe von Aktien und Anleihen.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Woher kommt die Rendite bei einem Rohstoff direkt gehalten?",
				options: [
					"Aus Dividenden",
					"Aus Zinsen",
					"Nur aus Preisänderungen",
					"Aus Gewinnbeteiligung",
				],
				correct: 2,
				explanation:
					"Rohstoffe selbst bringen keine laufenden Zahlungen, nur der Preis zählt.",
			},
		},
	],
}
