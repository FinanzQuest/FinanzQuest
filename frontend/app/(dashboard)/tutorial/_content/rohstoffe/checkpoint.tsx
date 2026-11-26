import type { LessonDef } from "../../_engine/types"

export const checkpoint: LessonDef = {
	id: "rohstoffe.checkpoint",
	title: "Checkpoint Rohstoffe",
	steps: [
		{
			type: "card",
			title: "Zeig, was Du gelernt hast",
			body: "Acht Fragen zu Rohstoffarten, Gold und Preistreibern. Dies ist Bildung, keine Anlageberatung.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question: "Ordne den Rohstoff seiner Gruppe zu.",
				pairs: [
					{ left: "Erdgas", right: "Energie" },
					{ left: "Silber", right: "Metalle" },
					{ left: "Kaffee", right: "Agrar" },
				],
				explanation:
					"Energie, Metalle und Agrarrohstoffe sind die drei großen Gruppen.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Was ist der Spotpreis?",
				options: [
					"Preis für Lieferung zu einem späteren Termin",
					"Preis für sofortige Lieferung",
					"Der Preis einer Aktie",
					"Ein garantierter Mindestpreis",
				],
				correct: 1,
				explanation: "Spot bedeutet sofort, im Gegensatz zum Termingeschäft.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement: "Gold zahlt regelmäßige Zinsen.",
				correct: false,
				explanation:
					"Gold bringt keine laufenden Erträge, nur Preisänderungen.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Welche Aussage über Gold in Krisen stimmt?",
				options: [
					"Es steigt in jeder Krise",
					"Es hat in manchen Krisen geholfen, ist aber keine Garantie",
					"Es fällt in jeder Krise",
					"Es ist komplett schwankungsfrei",
				],
				correct: 1,
				explanation: "Die Wirkung ist von Krise zu Krise verschieden.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Ein Rohstoff fällt von 80 € auf 60 €. Wie viel Prozent beträgt der Verlust?",
				min: 0,
				max: 100,
				step: 5,
				correct: 25,
				tolerance: 0,
				unit: "%",
				explanation: "20 € von 80 € sind 25 %.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question:
					"Welcher Einfluss ist bei welchem Rohstoff besonders wichtig?",
				pairs: [
					{ left: "Weizen", right: "Wetter und Ernte" },
					{ left: "Rohöl", right: "Fördermengen, etwa der OPEC" },
					{ left: "Kupfer", right: "Industrienachfrage" },
				],
				explanation: "Die Haupttreiber unterscheiden sich je nach Rohstoff.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "order",
				question: "Bringe einen typischen Rohstoffzyklus in Reihenfolge.",
				items: [
					"Preis steigt durch Knappheit",
					"Neue Förderung lohnt sich",
					"Angebot wächst",
					"Preis fällt",
				],
				explanation:
					"Hohe Preise locken Angebot an, was später den Preis wieder drückt.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement: "Rohstoffpreise lassen sich zuverlässig vorhersagen.",
				correct: false,
				explanation:
					"Wetter, Politik und Konjunktur wirken zusammen und sind schwer vorherzusagen.",
			},
		},
	],
}
