import type { LessonDef } from "../../_engine/types"
import { CompareBars, HBars } from "./diagrams"

const STAND = "Stand: Anfang 2025, gerundet. Die Werte ändern sich laufend."

export const indizesVergleich: LessonDef = {
	id: "etfs.indizes-vergleich",
	title: "Indizes im Vergleich",
	steps: [
		{
			type: "card",
			title: "Vier bekannte Indizes",
			body: "S&P 500: 500 große US-Firmen. MSCI World: Industrieländer. FTSE All-World: Industrie- und Schwellenländer. MSCI Emerging Markets: nur Schwellenländer. Sie unterscheiden sich in Ländern und Firmenzahl.",
		},
		{
			type: "card",
			title: "Anzahl Firmen und Länder",
			body: "Der S&P 500 hat rund 500 Firmen aus einem Land. Der MSCI World hat etwa 1.400 aus 23 Ländern. Der FTSE All-World kommt auf grob 4.000 Firmen aus knapp 50 Ländern. Der MSCI EM hat etwa 1.200 aus 24 Ländern.",
			diagram: (
				<HBars
					height={150}
					unit=""
					data={[
						{ name: "S&P 500", value: 500 },
						{ name: "MSCI World", value: 1400 },
						{ name: "FTSE All-World", value: 4000 },
						{ name: "MSCI EM", value: 1200 },
					]}
					note={`Anzahl Firmen. ${STAND}`}
				/>
			),
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question: "Ordne den Index seiner Region zu.",
				pairs: [
					{ left: "S&P 500", right: "Große US-Firmen" },
					{ left: "MSCI World", right: "Industrieländer" },
					{ left: "FTSE All-World", right: "Industrie- und Schwellenländer" },
					{ left: "MSCI Emerging Markets", right: "Schwellenländer" },
				],
				explanation: "Je weiter der Index, desto mehr Regionen sind enthalten.",
			},
		},
		{
			type: "card",
			title: "Was im MSCI World fehlt",
			body: "Im MSCI World stecken keine Schwellenländer wie China, Indien oder Brasilien. Auch sehr kleine Firmen (Small Caps) sind kaum dabei. Rund 70 % des Index sind US-Aktien.",
			diagram: (
				<HBars
					data={[
						{ name: "USA", value: 70 },
						{ name: "Japan", value: 5 },
						{ name: "Großbritannien", value: 4 },
						{ name: "Frankreich", value: 3 },
						{ name: "Kanada", value: 3 },
						{ name: "Rest", value: 15 },
					]}
					note={`Ländergewichte MSCI World in %. ${STAND}`}
				/>
			),
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement: "Der MSCI World enthält auch China und Indien.",
				correct: false,
				explanation:
					"Der MSCI World umfasst nur Industrieländer. China und Indien zählen zu den Schwellenländern.",
			},
		},
		{
			type: "card",
			title: "Mehr Länder, ähnliches Bild",
			body: "Der FTSE All-World ergänzt den MSCI World um Schwellenländer, die zusammen etwa 10 % ausmachen. Der USA-Anteil sinkt dadurch leicht auf grob 60 %. Die Welt bleibt also stark US-lastig.",
			diagram: (
				<CompareBars
					a="MSCI World"
					b="FTSE All-World"
					data={[
						{ name: "USA", a: 70, b: 62 },
						{ name: "Schwellenl.", a: 0, b: 10 },
						{ name: "Übrige", a: 30, b: 28 },
					]}
					note={`Anteile in %. ${STAND}`}
				/>
			),
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Welcher Index enthält die meisten Firmen?",
				options: [
					"S&P 500",
					"MSCI World",
					"FTSE All-World",
					"MSCI Emerging Markets",
				],
				correct: 2,
				explanation:
					"Der FTSE All-World hat grob 4.000 Firmen, die anderen deutlich weniger.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Schätze: Wie groß ist der USA-Anteil im MSCI World ungefähr?",
				min: 20,
				max: 100,
				step: 5,
				correct: 70,
				tolerance: 10,
				unit: "%",
				explanation:
					"Es sind etwa 70 %. Der genaue Wert schwankt mit den Kursen.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "order",
				question:
					"Sortiere nach Anzahl der Firmen, die wenigsten zuerst (ungefähr).",
				items: [
					"S&P 500",
					"MSCI Emerging Markets",
					"MSCI World",
					"FTSE All-World",
				],
				explanation: "Etwa 500, 1.200, 1.400 und 4.000 Firmen.",
			},
		},
	],
}
