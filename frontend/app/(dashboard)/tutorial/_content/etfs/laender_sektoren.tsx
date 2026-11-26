import type { LessonDef } from "../../_engine/types"
import { HBars } from "./diagrams"

const STAND = "Stand: Anfang 2025, gerundet."

export const laenderSektoren: LessonDef = {
	id: "etfs.laender-sektoren",
	title: "Länder & Sektoren",
	steps: [
		{
			type: "card",
			title: "Wo steckt Dein Geld?",
			body: "Ein Welt-ETF hält Firmen aus vielen Ländern. Jedes Land hat ein Gewicht, das sich nach dem Börsenwert seiner Firmen richtet. So sieht ein echter MSCI-World-ETF aus unserer Datenbank auf der Weltkarte.",
			slot: "map",
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question:
					"Wonach richtet sich das Länderverhältnis in einem MSCI-World-ETF?",
				options: [
					"Nach der Einwohnerzahl",
					"Nach dem Börsenwert der Firmen",
					"Nach der Fläche des Landes",
					"Alle Länder gleich",
				],
				correct: 1,
				explanation:
					"Der Index gewichtet nach Marktkapitalisierung. Deshalb ist die große US-Börse so dominant.",
			},
		},
		{
			type: "card",
			title: "Sektoren",
			body: "Firmen gehören zu Branchen, den Sektoren. Im MSCI World ist die Informationstechnologie mit gut einem Viertel der größte Sektor, gefolgt von Finanzen. Auch das ist eine Folge der Marktkapitalisierung.",
			diagram: (
				<HBars
					data={[
						{ name: "IT", value: 26 },
						{ name: "Finanzen", value: 15 },
						{ name: "Industrie", value: 11 },
						{ name: "Gesundheit", value: 10 },
						{ name: "Zykl. Konsum", value: 10 },
						{ name: "Komm.", value: 8 },
						{ name: "Basiskonsum", value: 6 },
						{ name: "Übrige", value: 14 },
					]}
					note={`Sektorgewichte MSCI World in %. ${STAND}`}
				/>
			),
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question: "Ordne die Firmenart dem Sektor zu.",
				pairs: [
					{ left: "Softwarefirma", right: "Informationstechnologie" },
					{ left: "Bank", right: "Finanzen" },
					{ left: "Pharmakonzern", right: "Gesundheit" },
					{ left: "Ölkonzern", right: "Energie" },
				],
				explanation: "Sektoren fassen Firmen mit ähnlichem Geschäft zusammen.",
			},
		},
		{
			type: "card",
			title: "Konzentration: die Top 10",
			body: "Viele Firmen heißt nicht gleichmäßig verteilt. Die zehn größten Positionen machen im MSCI World grob 20 % aus, im S&P 500 über 30 %. Wenige Konzerne bewegen den Index stark.",
			diagram: (
				<HBars
					height={110}
					data={[
						{ name: "MSCI World", value: 22 },
						{ name: "S&P 500", value: 34 },
						{ name: "Gleichgew. 1.400", value: 0.7 },
					]}
					note={`Anteil der 10 größten Positionen in %. Gleichgewichtet wären es nur 10 von 1.400 Firmen, also rund 0,7 %. ${STAND}`}
				/>
			),
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Schätze: Welchen Anteil haben die zehn größten Firmen im MSCI World ungefähr?",
				min: 0,
				max: 60,
				step: 1,
				correct: 22,
				tolerance: 6,
				unit: "%",
				explanation:
					"Es sind etwa ein Fünftel. Die Werte schwanken mit den Kursen.",
			},
		},
		{
			type: "card",
			title: "Home Bias",
			body: "Viele Anleger kaufen überproportional Firmen aus dem eigenen Land. Das nennt man Home Bias. Deutschland macht im MSCI World nur gut 2 % aus. Wer vor allem DAX-Aktien hält, ist stark auf ein kleines Land konzentriert.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Ein reines Deutschland-Depot bildet die Weltwirtschaft gut ab.",
				correct: false,
				explanation:
					"Deutschland ist nur ein kleiner Teil des Weltmarkts. Streuung über Länder senkt das Klumpenrisiko.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "order",
				question:
					"Sortiere die Länder nach ihrem Gewicht im MSCI World, das größte zuerst (ungefähr).",
				items: ["USA", "Japan", "Großbritannien", "Deutschland"],
				explanation:
					"Die USA liegen weit vorn, dann folgen Japan, Großbritannien und Deutschland mit jeweils wenigen Prozent.",
			},
		},
	],
}
