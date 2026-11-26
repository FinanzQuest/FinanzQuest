import type { LessonDef } from "../../_engine/types"

export const goldSafeHaven: LessonDef = {
	id: "rohstoffe.gold-safe-haven",
	title: "Gold & Safe Haven",
	steps: [
		{
			type: "card",
			title: "Gold seit Jahrtausenden",
			body: "Gold gilt seit Jahrtausenden als Wertspeicher. Es ist selten, haltbar und überall anerkannt. Anders als Papiergeld kann keine Zentralbank neues Gold drucken, die Fördermenge wächst nur langsam.",
		},
		{
			type: "card",
			title: "Sicherer Hafen",
			body: "In Krisen suchen viele Anleger Schutz in Gold, man spricht vom Safe Haven (sicherer Hafen). In manchen Krisen stieg Gold, als Aktien fielen. Das ist aber keine Regel: Auch Gold fiel in Krisen zeitweise, etwa im März 2020 kurz.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement: "Gold steigt immer, wenn Aktien fallen.",
				correct: false,
				explanation:
					"Gold hat in manchen Krisen geholfen, in anderen nicht. Eine feste Regel gibt es nicht.",
			},
		},
		{
			type: "card",
			title: "Keine Rendite",
			body: "Gold zahlt keine Zinsen und keine Dividenden. Zusätzlich kostet Lagerung oder Fondsgebühr etwas. Wenn andere Anlagen Zinsen zahlen, ist Gold im Vergleich weniger attraktiv. Bei sehr niedrigen Zinsen fällt dieser Nachteil kaum ins Gewicht.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Welcher Nachteil gilt für Gold?",
				options: [
					"Es zahlt keine laufenden Erträge",
					"Es ist zu häufig verfügbar",
					"Es verliert durch Zinsen an Wert",
					"Es wird nur in Deutschland gehandelt",
				],
				correct: 0,
				explanation:
					"Gold bringt nur über Preissteigerung Ertrag, laufende Zahlungen gibt es nicht.",
			},
		},
		{
			type: "card",
			title: "Inflationsschutz?",
			body: "Gold wird oft als Schutz vor Inflation gesehen. Langfristig hat es Kaufkraft gehalten, aber über Jahre hinweg gab es lange Phasen ohne Gewinn. In den 1980ern bis 2000er verlor Gold real stark. Als zuverlässiger kurzfristiger Schutz taugt es nicht.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question:
					"Welche Aussage über Gold als Inflationsschutz ist am zutreffendsten?",
				options: [
					"Es schützt zuverlässig in jedem Jahr",
					"Langfristig oft kaufkrafterhaltend, aber mit langen schwachen Phasen",
					"Es verliert immer an Wert",
					"Es steigt automatisch mit dem Verbraucherpreisindex",
				],
				correct: 1,
				explanation:
					"Der Zusammenhang ist locker. Gold kann Jahrzehnte seitwärts laufen.",
			},
		},
		{
			type: "card",
			title: "Gold schwankt auch",
			body: "Auch Gold hat deutliche Schwankungen. Nach dem Hoch 2011 fiel der Preis in den folgenden Jahren um rund 40 %. Es ist weniger riskant als manche Coins, aber kein sicherer Wert im Sinne eines Sparbuchs.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question: "Ordne die Eigenschaften zu.",
				pairs: [
					{
						left: "Gold",
						right: "Kein laufender Ertrag, gilt als Krisenanker",
					},
					{ left: "Aktie", right: "Beteiligung an Unternehmensgewinnen" },
					{ left: "Anleihe", right: "Feste Zinszahlungen" },
				],
				explanation:
					"Jede Anlageklasse hat eine eigene Ertragsquelle. Gold hat keine, wird aber wegen seiner Rolle in Krisen gehalten.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Gold fällt von 2.000 $ auf 1.200 $ je Unze. Um wie viel Prozent ist der Preis gefallen?",
				min: 0,
				max: 100,
				step: 5,
				correct: 40,
				tolerance: 0,
				unit: "%",
				explanation: "800 $ von 2.000 $ sind 40 %.",
			},
		},
	],
}
