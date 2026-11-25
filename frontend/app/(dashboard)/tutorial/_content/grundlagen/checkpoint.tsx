import type { LessonDef } from "../../_engine/types"
import { Prinzipien } from "./diagrams/prinzipien"

export const checkpoint: LessonDef = {
	id: "grundlagen.checkpoint",
	title: "Checkpoint Grundlagen",
	steps: [
		{
			type: "card",
			title: "Die fünf Grundprinzipien",
			body: (
				<p>
					Zum Abschluss die wichtigsten Regeln aus dieser Einheit. Danach
					testest du, was du dir gemerkt hast.
				</p>
			),
			diagram: <Prinzipien from={0} to={5} />,
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Was beschreibt die Rentenlücke?",
				options: [
					"Den Unterschied zwischen Aktien- und Anleiherendite",
					"Die Differenz zwischen letztem Gehalt und gesetzlicher Rente",
					"Den Verlust durch Inflation",
					"Die jährlichen Kosten eines ETFs",
				],
				correct: 1,
				explanation:
					"Die Rentenlücke ist das, was im Alter zwischen deinem letzten Gehalt und der gesetzlichen Rente fehlt - oft 30-40 %.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Was bedeutet Zinseszins?",
				options: [
					"Man zahlt Zinsen an die Bank",
					"Zinsen werden nur auf das Startkapital berechnet",
					"Man bekommt Zinsen auf bereits erzielte Zinsen",
					"Der Zinssatz steigt jährlich",
				],
				correct: 2,
				explanation:
					"Beim Zinseszins werden schon erhaltene Zinsen mitverzinst. Dadurch wächst das Vermögen immer schneller.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Was ist die TER eines ETFs?",
				options: [
					"Die Steuer auf Kursgewinne",
					"Die jährliche Verwaltungsgebühr des Fonds",
					"Die Mindestanlagesumme",
					"Der aktuelle Börsenkurs",
				],
				correct: 1,
				explanation:
					"Die TER (Total Expense Ratio) sind die jährlichen Kosten in Prozent, die automatisch vom Fondsvermögen abgezogen werden.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Was bedeutet Diversifikation?",
				options: [
					"In ein einziges Unternehmen investieren",
					"Kapital auf viele verschiedene Anlagen verteilen",
					"Aktien kurzfristig kaufen und verkaufen",
					"Nur in sichere Staatsanleihen investieren",
				],
				correct: 1,
				explanation:
					"Diversifikation heißt Streuung: Wer sein Geld auf viele Anlagen verteilt, ist nicht vom Schicksal eines einzelnen Unternehmens abhängig.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Was ist ein thesaurierender ETF?",
				options: [
					"Ein ETF der nur in Schwellenländer investiert",
					"Ein ETF der Gewinne regelmäßig auszahlt",
					"Ein ETF der Erträge automatisch reinvestiert",
					"Ein ETF mit besonders hohen Kosten",
				],
				correct: 2,
				explanation:
					"Thesaurierende ETFs legen Erträge automatisch wieder an. So nutzt du den Zinseszinseffekt ohne Zutun.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Ein Konto mit 1 % Zinsen und 2 % Inflation lässt deine Kaufkraft real schrumpfen.",
				correct: true,
				explanation:
					"Realrendite = Zins minus Inflation = -1 %. Der Kontostand wächst, aber du kannst dir davon weniger kaufen.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Du legst 1.000 € bei 7 % Zinsen an. Wie viel hast du nach 2 Jahren (mit Zinseszins)?",
				min: 1000,
				max: 1300,
				step: 5,
				correct: 1145,
				tolerance: 10,
				unit: "€",
				explanation:
					"1.000 € x 1,07 x 1,07 = 1.144,90 €. Im zweiten Jahr gibt es Zinsen auch auf die Zinsen des ersten Jahres.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "order",
				question:
					"Sortiere nach Schwankungsrisiko - vom geringsten zum höchsten.",
				items: ["Tagesgeld", "Staatsanleihen", "Aktien-ETF", "Einzelaktie"],
				explanation:
					"Je höher die erwartete Rendite, desto stärker die Schwankungen. Ein ETF streut über viele Firmen und ist daher weniger riskant als eine einzelne Aktie.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question: "Ordne jedes Prinzip der richtigen Aussage zu.",
				pairs: [
					{
						left: "Frühzeitig beginnen",
						right: "Zinseszins hat mehr Zeit zu wirken",
					},
					{
						left: "Regelmäßig investieren",
						right: "Sparplan mit festem Monatsbetrag",
					},
					{
						left: "Breit diversifizieren",
						right: "Risiko über viele Firmen verteilen",
					},
					{
						left: "Kosten niedrig halten",
						right: "Niedrige TER spart langfristig viel",
					},
				],
				explanation:
					"Diese vier Prinzipien hängen zusammen: Zeit, Regelmäßigkeit, Streuung und niedrige Kosten sind die Basis für langfristigen Vermögensaufbau. Das fünfte ist Geduld.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Wer langfristig investiert, sollte bei jedem Kurseinbruch sofort verkaufen.",
				correct: false,
				explanation:
					"Kursschwankungen gehören dazu. Historisch haben sich Aktienmärkte nach Einbrüchen erholt. Wer voreilig verkauft, macht Verluste fest.",
			},
		},
	],
}
