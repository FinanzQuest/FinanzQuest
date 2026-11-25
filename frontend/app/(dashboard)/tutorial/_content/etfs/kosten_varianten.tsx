import type { LessonDef } from "../../_engine/types"
import { FeeDrag } from "./diagrams"

export const kostenVarianten: LessonDef = {
	id: "etfs.kosten-varianten",
	title: "Kosten & Varianten",
	steps: [
		{
			type: "card",
			title: "Die TER",
			body: "Die Total Expense Ratio (TER) sind die laufenden jährlichen Kosten eines ETFs in Prozent. Sie wird automatisch im Kurs verrechnet. Bei großen Welt-ETFs liegt sie meist bei etwa 0,1 bis 0,3 % pro Jahr (Stand: 2025).",
		},
		{
			type: "card",
			title: "Kleine Zahl, großer Effekt",
			body: "Kosten wirken jedes Jahr auf das gesamte Vermögen und damit auch auf die Zinseszinsen. Teste, wie viel nach 30 Jahren fehlt.",
			diagram: <FeeDrag />,
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Ein Fonds kostet 1,5 % TER pro Jahr. Wie viel Prozent des Endwerts gehen bei 6 % Rendite nach 30 Jahren ungefähr verloren?",
				min: 0,
				max: 60,
				step: 1,
				correct: 35,
				tolerance: 5,
				unit: "%",
				explanation:
					"Mit 4,5 statt 6 % wächst das Geld auf etwa 3,7- statt 5,7-faches. Das sind gut ein Drittel weniger.",
			},
		},
		{
			type: "card",
			title: "Tracking Difference",
			body: "Die Tracking Difference zeigt, wie stark ein ETF vom Index abweicht. Sie umfasst alle Effekte, auch die TER. Sie ist die ehrlichere Kennzahl für die echten Kosten. Manchmal ist sie sogar besser als die TER.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question:
					"Der Index macht 8,0 %, der ETF 7,8 %. Wie groß ist die Tracking Difference?",
				options: [
					"0,2 Prozentpunkte",
					"7,8 Prozentpunkte",
					"8,0 Prozentpunkte",
					"15,8 Prozentpunkte",
				],
				correct: 0,
				explanation: "8,0 % minus 7,8 % ergibt 0,2 Prozentpunkte Abweichung.",
			},
		},
		{
			type: "card",
			title: "Thesaurierend oder ausschüttend",
			body: "Ein ausschüttender ETF zahlt Dividenden an Dich aus. Ein thesaurierender legt sie automatisch wieder an. Auf lange Sicht ist Thesaurierung bequem, weil Zinseszinsen sofort wirken. Steuerlich gibt es Unterschiede.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Ein thesaurierender ETF legt Dividenden automatisch wieder an.",
				correct: true,
				explanation:
					"Thesaurieren bedeutet, dass Erträge im Fonds verbleiben und reinvestiert werden.",
			},
		},
		{
			type: "card",
			title: "Physisch oder synthetisch",
			body: "Ein physischer ETF kauft die Aktien des Index (ganz oder eine Auswahl). Ein synthetischer ETF nutzt einen Tauschvertrag (Swap) mit einer Bank. Dabei kommt ein Gegenpartei-Risiko dazu. Für den Einstieg sind physische ETFs gut verständlich.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question: "Ordne den Begriff der Beschreibung zu.",
				pairs: [
					{ left: "TER", right: "Laufende jährliche Kosten" },
					{ left: "Thesaurierend", right: "Erträge werden reinvestiert" },
					{ left: "Ausschüttend", right: "Erträge werden ausgezahlt" },
					{ left: "Synthetisch", right: "Nachbildung per Swap" },
				],
				explanation:
					"Diese vier Begriffe begegnen Dir bei jedem ETF-Vergleich.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "order",
				question:
					"Sortiere die Fonds nach ihren Kosten, die niedrigsten zuerst (typisch).",
				items: [
					"Welt-ETF (0,2 %)",
					"Themen-ETF (0,5 %)",
					"Aktiv gemanagter Fonds (1,5 %)",
					"Fonds mit Ausgabeaufschlag (1,5 % + 5 %)",
				],
				explanation:
					"Passive Standard-ETFs sind meist am günstigsten. Aktive Fonds und Aufschläge kosten deutlich mehr.",
			},
		},
	],
}
