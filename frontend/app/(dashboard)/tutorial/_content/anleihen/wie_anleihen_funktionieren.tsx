import type { LessonDef } from "../../_engine/types"
import { BondCashflow } from "./diagrams"

export const wieAnleihenFunktionieren: LessonDef = {
	id: "anleihen.wie-anleihen-funktionieren",
	title: "Wie Anleihen funktionieren",
	steps: [
		{
			type: "card",
			title: "Ein Kredit, den Du vergibst",
			body: "Mit einer Anleihe leihst Du einem Emittenten (Staat oder Unternehmen) Geld. Dafür bekommst Du regelmäßig Zinsen und am Ende Dein Geld zurück. Bei Aktien bist Du Miteigentümer, bei Anleihen bist Du Gläubiger.",
		},
		{
			type: "card",
			title: "Die vier Eckdaten",
			body: "Nennwert: die Summe, die am Ende zurückgezahlt wird (z. B. 1.000 €). Kupon: der jährliche Zins auf den Nennwert (z. B. 3 % = 30 €). Laufzeit: wie lange das Geld verliehen ist. Rückzahlung: meist komplett am Laufzeitende.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question: "Ordne die Begriffe zu.",
				pairs: [
					{ left: "Emittent", right: "Schuldner, der die Anleihe ausgibt" },
					{ left: "Nennwert", right: "Betrag, der am Ende zurückgezahlt wird" },
					{ left: "Kupon", right: "Jährlicher Zins auf den Nennwert" },
					{ left: "Laufzeit", right: "Zeitraum bis zur Rückzahlung" },
				],
				explanation:
					"Der Emittent leiht sich Geld, zahlt den Kupon und überweist am Ende den Nennwert.",
			},
		},
		{
			type: "card",
			title: "Der Zahlungsstrom",
			body: "Du kaufst für 1.000 €, erhältst fünf Jahre lang 30 € Zinsen und im fünften Jahr zusätzlich die 1.000 € zurück. Verschiebe den Kaufkurs und beobachte, wie sich Dein Gesamtgewinn und die Rendite ändern.",
			diagram: <BondCashflow />,
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Nennwert 1.000 €, Kupon 3 %, Laufzeit 5 Jahre. Wie viel Zinsen (Kupons) erhältst Du insgesamt?",
				min: 0,
				max: 300,
				step: 10,
				correct: 150,
				tolerance: 0,
				unit: "€",
				explanation: "5 Jahre mal 30 € Kupon ergeben 150 €.",
			},
		},
		{
			type: "card",
			title: "Kurs ist nicht Rendite",
			body: "Der Kurs gibt an, wie viel Prozent vom Nennwert Du beim Kauf zahlst. Kaufst Du für 95 %, bekommst Du am Ende trotzdem 100 %. Die Rendite fasst Kupon und Kursgewinn zusammen und liegt dann über dem Kupon.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question:
					"Eine Anleihe mit Kupon 3 % kostet 95 % vom Nennwert. Wie liegt die Rendite bis Laufzeitende?",
				options: [
					"Unter 3 %",
					"Genau 3 %",
					"Über 3 %",
					"Das lässt sich nicht sagen",
				],
				correct: 2,
				explanation:
					"Du zahlst weniger als den Nennwert, bekommst aber den vollen Nennwert zurück. Der Kursgewinn kommt zum Kupon dazu.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "order",
				question: "Bringe den Lebenslauf einer Anleihe in die richtige Reihenfolge.",
				items: [
					"Emittent gibt die Anleihe aus",
					"Du kaufst sie",
					"Du erhältst jedes Jahr den Kupon",
					"Am Laufzeitende wird der Nennwert zurückgezahlt",
				],
				explanation:
					"Ausgabe, Kauf, laufende Zinsen, Rückzahlung. Zwischendurch kannst Du die Anleihe an der Börse verkaufen.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Wer eine Anleihe bis zum Ende hält, bekommt (ohne Ausfall) den Nennwert zurück, egal wie der Kurs zwischendurch schwankte.",
				correct: true,
				explanation:
					"Kursschwankungen betreffen nur den Verkauf vor Laufzeitende. Zahlt der Emittent, erhältst Du Kupons und Nennwert.",
			},
		},
	],
}
