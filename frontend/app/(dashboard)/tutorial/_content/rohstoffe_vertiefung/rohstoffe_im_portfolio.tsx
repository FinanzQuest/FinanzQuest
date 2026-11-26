import type { LessonDef } from "../../_engine/types"

export const rohstoffeImPortfolio: LessonDef = {
	id: "rohstoffe-vertiefung.rohstoffe-im-portfolio",
	title: "Rohstoffe im Portfolio",
	steps: [
		{
			type: "card",
			title: "Streuung durch andere Treiber",
			body: "Rohstoffe werden von anderen Faktoren getrieben als Aktien und Anleihen: Wetter, Förderung, Weltlage. Deshalb laufen sie nicht immer parallel zu Aktien. Das kann ein Portfolio stabilisieren, ist aber nicht garantiert. In Krisen können auch Rohstoffe gleichzeitig fallen.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Warum werden Rohstoffe manchmal beigemischt?",
				options: [
					"Weil sie garantiert Gewinne bringen",
					"Weil sie oft anderen Einflüssen folgen als Aktien",
					"Weil sie Dividenden zahlen",
					"Weil sie gesetzlich vorgeschrieben sind",
				],
				correct: 1,
				explanation:
					"Der mögliche Vorteil liegt in der anderen Kursentwicklung, nicht in garantierten Erträgen.",
			},
		},
		{
			type: "card",
			title: "Keine Dividenden, kein Zinseszins",
			body: "Rohstoffe zahlen nichts aus. Bei Aktien und Anleihen arbeiten Erträge im Zinseszins mit. Bei Rohstoffen kommt die Rendite nur aus Preisänderungen. Langfristig liegt der Ertrag breit gestreuter Aktien in der Vergangenheit meist höher, Garantien gibt es nicht.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Rohstoffe zahlen wie Aktien regelmäßig Dividenden an Anleger.",
				correct: false,
				explanation: "Rohstoffe selbst erzeugen keine laufenden Zahlungen.",
			},
		},
		{
			type: "card",
			title: "Kosten und Futures",
			body: "Rohstoffprodukte haben Gebühren. Bildet ein Produkt über Futures nach, kann der Rollvorgang zusätzlich Rendite kosten: Läuft ein Future aus, wird in den nächsten getauscht, bei höheren Terminpreisen entsteht ein Rollverlust. Schau daher in die Kostenangaben.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Was bedeutet Rollverlust bei Rohstoff-Futures?",
				options: [
					"Der Anbieter verliert Daten",
					"Beim Wechsel in den nächsten Future kann ein höherer Preis Rendite kosten",
					"Eine Steuer auf Gold",
					"Der Rohstoff verdirbt",
				],
				correct: 1,
				explanation:
					"Wird der Folgekontrakt teurer als der auslaufende, fließt ein Teil der Rendite beim Wechsel ab.",
			},
		},
		{
			type: "card",
			title: "Kleine Beimischung",
			body: "Wenn überhaupt, werden Rohstoffe meist als kleiner Anteil neben einer breiten Basis gehalten. Anteile zwischen 0 und etwa 10 % sind verbreitet, aber nur als Orientierung. Eine richtige Menge für alle gibt es nicht.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Dein Portfolio hat 8.000 €, davon 10 % in Rohstoffen. Wie viel Euro sind das?",
				min: 0,
				max: 2000,
				step: 50,
				correct: 800,
				tolerance: 0,
				unit: "€",
				explanation: "10 % von 8.000 € sind 800 €.",
			},
		},
		{
			type: "card",
			title: "Dein Fazit",
			body: "Rohstoffe können ein Portfolio ergänzen, brauchst Du aber nicht. Ein breit gestreuter Welt-ETF deckt viele Rohstoffunternehmen bereits indirekt ab. Dies ist keine Anlageempfehlung. Hier kannst Du mit virtuellem Geld ausprobieren, wie sich Beimischungen anfühlen.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question: "Ordne Vor- und Nachteile zu.",
				pairs: [
					{
						left: "Möglicher Vorteil",
						right: "Andere Preistreiber als Aktien",
					},
					{ left: "Nachteil", right: "Keine laufenden Erträge" },
					{ left: "Kostenfaktor", right: "Gebühren und Rollverluste" },
				],
				explanation:
					"Rohstoffe können streuen, bieten aber keinen Ertrag und können Kosten haben.",
			},
		},
	],
}
