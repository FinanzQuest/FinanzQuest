import type { LessonDef } from "../../_engine/types"
import { MissingBestDays } from "./diagrams"

export const timeInMarket: LessonDef = {
	id: "psychologie.time-in-market",
	title: "Time in the Market",
	steps: [
		{
			type: "card",
			title: "Timing ist ein Mythos",
			body: "Den perfekten Ein- und Ausstieg vorherzusagen gelingt auch Profis nicht dauerhaft. Wichtiger als der richtige Zeitpunkt ist, wie lange Du investiert bleibst.",
		},
		{
			type: "card",
			title: "Die besten Tage verpassen",
			body: "Die besten Börsentage liegen oft direkt neben den schlechtesten, mitten in der Krise. Wer aus Angst aussteigt, verpasst sie leicht und verliert einen großen Teil der Rendite.",
			diagram: <MissingBestDays />,
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Die besten Börsentage kommen meist in ruhigen Aufschwungphasen.",
				correct: false,
				explanation:
					"Sie treten oft in turbulenten Zeiten auf, kurz nach den schlechtesten Tagen.",
			},
		},
		{
			type: "card",
			title: "FOMO und Herdenverhalten",
			body: "FOMO heißt Angst, etwas zu verpassen. Steigen Kurse, kaufen viele aus Neid mit. Fallen sie, verkaufen alle zugleich. Die Herde kauft oft teuer und verkauft billig.",
		},
		{
			type: "card",
			title: "Bestätigungsfehler",
			body: "Wir suchen Infos, die unsere Meinung stützen, und blenden Gegenteiliges aus. Wer eine Aktie liebt, liest nur gute Nachrichten. Frage Dich bewusst: Was spräche gegen meine Entscheidung?",
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question: "Ordne den Denkfehler der Beschreibung zu.",
				pairs: [
					{ left: "FOMO", right: "Angst, einen Anstieg zu verpassen" },
					{
						left: "Herdenverhalten",
						right: "Man macht, was alle anderen machen",
					},
					{
						left: "Bestätigungsfehler",
						right: "Nur passende Infos werden beachtet",
					},
					{
						left: "Verlustaversion",
						right: "Verluste schmerzen mehr als Gewinne",
					},
				],
				explanation:
					"Alle vier Effekte führen oft zu schlechten Anlageentscheidungen.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question:
					"Eine Aktie hat sich in drei Monaten verdoppelt, alle reden darüber. Was ist der sinnvollste Gedanke?",
				options: [
					"Schnell kaufen, sonst ist der Zug abgefahren",
					"Halte ich mich an meinen Plan und meine Streuung?",
					"Alles bisherige verkaufen und umschichten",
					"Auf Kredit nachkaufen",
				],
				correct: 1,
				explanation:
					"Ein Plan schützt vor FOMO. Spätes Einsteigen in Hypes endet oft mit Verlusten.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Wie viele Prozent pro Jahr brachte der Welt-Index grob langfristig im Schnitt, wenn man immer investiert blieb (ca.)?",
				min: 0,
				max: 15,
				step: 1,
				correct: 7,
				tolerance: 2,
				unit: "%",
				explanation:
					"Historisch grob 7 bis 8 Prozent vor Inflation. Das ist keine Garantie.",
			},
		},
	],
}
