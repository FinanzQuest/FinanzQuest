import type { LessonDef } from "../../_engine/types"
import { CrashTimeline } from "./crash_timeline"

export const crashs: LessonDef = {
	id: "psychologie.crashs",
	title: "Crashs verstehen",
	steps: [
		{
			type: "card",
			title: "Crashs gehören dazu",
			body: "Aktienmärkte fallen immer wieder kräftig. Das ist kein Fehler im System, sondern der Preis für die höhere Rendite. Wer Aktien kauft, muss Schwankungen aushalten können.",
		},
		{
			type: "card",
			title: "Fünf Crashs im Überblick",
			body: "Tippe die Krisen an. Du siehst, wie tief ein Welt-Index fiel und wie lange es dauerte, bis das alte Hoch wieder erreicht war.",
			diagram: <CrashTimeline />,
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Wie stark fiel ein Welt-Aktienindex in der Finanzkrise 2007 bis 2009 vom Hoch bis zum Tief (ca.)?",
				min: 0,
				max: 80,
				step: 5,
				correct: 55,
				tolerance: 10,
				unit: "%",
				explanation:
					"Ca. 57 Prozent. Aus 10.000 € wurden zeitweise rund 4.300 €.",
			},
		},
		{
			type: "card",
			title: "Erholung braucht Zeit",
			body: "Ein Crash von 50 Prozent braucht danach +100 Prozent, um auszugleichen. Daher dauerte die Erholung nach Dotcom und Finanzkrise Jahre. Der Covid-Crash war dagegen nach wenigen Monaten aufgeholt.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question:
					"Ein Index fällt um 50 Prozent. Wie viel muss er steigen, um wieder beim alten Stand zu sein?",
				options: ["+50 Prozent", "+75 Prozent", "+100 Prozent", "+150 Prozent"],
				correct: 2,
				explanation:
					"Aus 100 werden 50. Von 50 auf 100 ist eine Verdopplung, also +100 Prozent.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "order",
				question:
					"Sortiere die Krisen nach der Tiefe des Rückgangs (ca.), von der stärksten zur schwächsten.",
				items: [
					"Finanzkrise 2008",
					"Dotcom 2000",
					"Covid 2020",
					"Zinswende 2022",
					"Euro-Krise 2011",
				],
				explanation:
					"Ca. -57, -49, -34, -26 und -19 Prozent. Es sind gerundete Näherungswerte.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Nach jedem Crash war der Index später wieder auf einem neuen Höchststand.",
				correct: true,
				explanation:
					"Bisher ja, bei breit gestreuten Welt-Indizes. Es kann aber Jahre dauern. Eine Garantie für die Zukunft ist das nicht.",
			},
		},
	],
}
