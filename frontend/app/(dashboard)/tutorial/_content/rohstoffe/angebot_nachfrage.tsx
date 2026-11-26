import type { LessonDef } from "../../_engine/types"

export const angebotNachfrage: LessonDef = {
	id: "rohstoffe.angebot-nachfrage",
	title: "Angebot, Nachfrage & Preise",
	steps: [
		{
			type: "card",
			title: "Preis aus Angebot und Nachfrage",
			body: "Rohstoffpreise entstehen aus Angebot und Nachfrage. Gibt es weniger als gebraucht wird, steigt der Preis. Gibt es mehr als gebraucht wird, fällt er. Da Förderung nicht von heute auf morgen angepasst werden kann, schwanken Preise oft stark.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question:
					"Was passiert tendenziell, wenn das Angebot sinkt und die Nachfrage gleich bleibt?",
				options: [
					"Der Preis steigt",
					"Der Preis sinkt",
					"Der Preis bleibt gleich",
					"Der Handel endet",
				],
				correct: 0,
				explanation:
					"Bei knapperem Angebot steigt der Preis, sonst bekommen nicht alle Käufer etwas.",
			},
		},
		{
			type: "card",
			title: "Öl und die OPEC",
			body: "Die OPEC ist ein Zusammenschluss großer Ölförderländer. Mit abgestimmten Fördermengen versucht sie, den Preis zu beeinflussen. Weitere Einflüsse sind Konjunktur, neue Fördertechniken und politische Konflikte in Förderregionen.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Förderländer können durch gemeinsame Fördermengen den Ölpreis beeinflussen.",
				correct: true,
				explanation:
					"Wer einen großen Teil des Angebots kontrolliert, kann durch Kürzen oder Ausweiten der Menge Preise mitbestimmen, aber nicht allein festlegen.",
			},
		},
		{
			type: "card",
			title: "Wetter und Ernten",
			body: "Bei Agrarrohstoffen spielen Wetter und Ernten die Hauptrolle. Dürren, Überschwemmungen oder Schädlinge verkleinern die Ernte, Preise steigen oft. Eine Rekordernte lässt sie dagegen fallen. Das lässt sich kaum vorhersagen.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question: "Welcher Einfluss wirkt bei welchem Rohstoff stark?",
				pairs: [
					{ left: "Weizen", right: "Ernte und Wetter" },
					{ left: "Rohöl", right: "Fördermengen und Konjunktur" },
					{ left: "Kupfer", right: "Bedarf der Industrie, etwa im Bau" },
				],
				explanation:
					"Jede Rohstoffgruppe hat eigene Haupttreiber, daher laufen Preise nicht im Gleichschritt.",
			},
		},
		{
			type: "card",
			title: "Zyklen",
			body: "Rohstoffmärkte laufen oft in Zyklen. Hohe Preise lohnen neue Förderung. Wenn sie ans Netz geht, steigt das Angebot und die Preise fallen. Niedrige Preise bremsen Investitionen, was später wieder Knappheit schaffen kann. Der Zeitpunkt des Wechsels ist schwer vorherzusagen.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "order",
				question:
					"Bringe einen typischen Rohstoffzyklus in eine sinnvolle Reihenfolge.",
				items: [
					"Preis steigt durch Knappheit",
					"Neue Förderung lohnt sich",
					"Angebot wächst",
					"Preis fällt",
				],
				explanation:
					"Hohe Preise sorgen für mehr Förderung, mehr Angebot drückt den Preis wieder nach unten.",
			},
		},
		{
			type: "card",
			title: "Unsicher bleibt es",
			body: "Politik, Wetter und Konjunktur sind schwer vorherzusagen. Auch Profis liegen bei Rohstoffpreisen oft daneben. Verstehe die Treiber, aber vertraue nicht auf Prognosen.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Warum sind Rohstoffpreise kaum verlässlich vorhersagbar?",
				options: [
					"Weil es nur einen Käufer gibt",
					"Weil viele unvorhersehbare Faktoren wie Wetter und Politik zusammenwirken",
					"Weil sie nie schwanken",
					"Weil sie staatlich festgelegt werden",
				],
				correct: 1,
				explanation:
					"Viele Einflüsse treffen zusammen, die sich schwer vorhersagen lassen.",
			},
		},
	],
}
