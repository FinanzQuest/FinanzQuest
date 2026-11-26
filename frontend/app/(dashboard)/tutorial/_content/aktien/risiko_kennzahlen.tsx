import type { LessonDef } from "../../_engine/types"
import { BetaExplorer, RangeBar, VolatilityCompare } from "./diagrams"

export const risikoKennzahlen: LessonDef = {
	id: "aktien.risiko-kennzahlen",
	title: "Risikokennzahlen",
	steps: [
		{
			type: "card",
			title: "Volatilität",
			body: "Die Volatilität misst, wie stark der Kurs schwankt, aufs Jahr gerechnet. Höher heißt riskanter, nicht automatisch schlechter. Beide Kurse unten starten gleich, die rote Linie springt aber viel mehr.",
			diagram: <VolatilityCompare />,
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Aktie A hat 15 % Volatilität, Aktie B 40 %. Was stimmt?",
				options: [
					"A schwankt stärker als B",
					"B schwankt stärker als A",
					"B bringt sicher mehr Rendite",
					"A kann nicht verlieren",
				],
				correct: 1,
				explanation:
					"Höhere Volatilität heißt stärkere Schwankungen, nach oben wie nach unten. Mehr Rendite folgt daraus nicht.",
			},
		},
		{
			type: "card",
			title: "Typische Größenordnungen",
			body: "Breite Welt-ETFs schwanken oft mit etwa 15 % pro Jahr, einzelne Aktien eher mit 25 bis 40 %, kleine Wachstumsfirmen auch mit mehr. Je weniger du streust, desto höher meist die Volatilität.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "order",
				question: "Sortiere nach typischer Volatilität, von niedrig zu hoch.",
				items: [
					"Staatsanleihen-ETF (ca. 5 %)",
					"Welt-ETF (ca. 15 %)",
					"Einzelaktie großer Konzern (ca. 25 %)",
					"Kleine Biotech-Aktie (ca. 60 %)",
				],
				explanation:
					"Mehr Streuung und stabilere Geschäfte dämpfen Schwankungen, Einzeltitel kleiner Firmen schwanken am meisten.",
			},
		},
		{
			type: "card",
			title: "Beta",
			body: "Beta zeigt, wie stark eine Aktie im Vergleich zum Gesamtmarkt schwankt. 1 heißt: so stark wie der Markt. Über 1 verstärkt Bewegungen, unter 1 dämpft sie. Probiere den Regler.",
			diagram: <BetaExplorer />,
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Eine Aktie hat Beta 1,5. Der Markt fällt um 10 %. Um wie viel Prozent fällt die Aktie ungefähr?",
				min: 0,
				max: 30,
				step: 1,
				correct: 15,
				tolerance: 1,
				unit: "%",
				explanation: "10 % × 1,5 = 15 %. Beta wirkt in beide Richtungen.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Eine Aktie mit Beta 0,5 bewegt sich gar nicht, wenn der Markt fällt.",
				correct: false,
				explanation:
					"Beta 0,5 heißt: etwa halb so starke Bewegungen wie der Markt. Fällt der Markt um 10 %, fällt die Aktie um rund 5 %.",
			},
		},
		{
			type: "card",
			title: "52-Wochen-Spanne",
			body: "Die 52-Wochen-Spanne nennt den niedrigsten und höchsten Kurs des letzten Jahres. Sie zeigt, wo der Kurs im Jahresverlauf steht. Nahe am Hoch heißt nicht teuer, nahe am Tief nicht billig.",
			diagram: <RangeBar />,
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question:
					"Eine Aktie steht knapp über ihrem 52-Wochen-Tief. Was folgt daraus sicher?",
				options: [
					"Sie ist ein Schnäppchen",
					"Sie fällt weiter",
					"Der Kurs ist im letzten Jahr stark gefallen",
					"Sie zahlt eine hohe Dividende",
				],
				correct: 2,
				explanation:
					"Mehr sagt die Spanne nicht aus. Ob der Kurs nun günstig ist, zeigen erst Kennzahlen wie KGV oder Gewinn.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question: "Ordne die Risikokennzahl zu.",
				pairs: [
					{
						left: "Volatilität",
						right: "Stärke der Kursschwankungen pro Jahr",
					},
					{ left: "Beta", right: "Schwankung relativ zum Gesamtmarkt" },
					{
						left: "52-Wochen-Spanne",
						right: "Tiefst- und Höchstkurs des Jahres",
					},
					{ left: "Max. Verlust", right: "Größter Rückgang von Hoch zu Tief" },
				],
				explanation: "Die Kennzahlen siehst du bei jeder Aktie in der App.",
			},
		},
	],
}
