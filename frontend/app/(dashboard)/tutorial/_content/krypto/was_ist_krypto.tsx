import type { LessonDef } from "../../_engine/types"

export const wasIstKrypto: LessonDef = {
	id: "krypto.was-ist-krypto",
	title: "Was sind Kryptowährungen?",
	steps: [
		{
			type: "card",
			title: "Digitales Geld ohne Zentrale",
			body: "Kryptowährungen sind digitale Einheiten, die nur als Einträge in einem Computernetzwerk existieren. Es gibt keine Zentralbank, die sie ausgibt. Das bekannteste Beispiel ist Bitcoin, gestartet 2009.",
		},
		{
			type: "card",
			title: "Die Blockchain",
			body: "Alle Transaktionen werden in Blöcken gesammelt und zu einer Kette verknüpft, der Blockchain. Viele Computer im Netzwerk speichern dieselbe Kette und prüfen neue Einträge gegeneinander. Nachträgliches Ändern alter Blöcke ist dadurch sehr schwer.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "order",
				question:
					"Bringe den vereinfachten Ablauf einer Überweisung in die richtige Reihenfolge.",
				items: [
					"Du startest eine Transaktion",
					"Das Netzwerk prüft sie",
					"Sie wird in einen Block aufgenommen",
					"Der Block wird an die Kette angehängt",
				],
				explanation:
					"Transaktionen werden gesammelt, geprüft, in einem Block gebündelt und dann dauerhaft an die Kette gehängt.",
			},
		},
		{
			type: "card",
			title: "Begrenzte Menge",
			body: "Bei Bitcoin ist die Gesamtmenge auf 21 Millionen Einheiten festgelegt. Neue Einheiten entstehen nach festen Regeln, nicht nach Entscheidung einer Institution. Viele sehen darin einen Schutz vor Geldentwertung. Ob das den Preis stützt, ist aber offen.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Bitcoin wird von einer Zentralbank ausgegeben und gesteuert.",
				correct: false,
				explanation:
					"Bitcoin läuft dezentral nach festen Software-Regeln. Keine Zentralbank und keine einzelne Firma steuert das Netzwerk.",
			},
		},
		{
			type: "card",
			title: "Mehr als Bitcoin",
			body: "Es gibt tausende weitere Kryptowährungen. Ethereum zum Beispiel erlaubt zusätzlich kleine Programme, sogenannte Smart Contracts. Viele andere Coins sind kaum genutzt und haben nur eine kleine Marktgröße.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question: "Ordne die Begriffe zu.",
				pairs: [
					{
						left: "Blockchain",
						right: "Gemeinsam geführte, verkettete Transaktionsliste",
					},
					{ left: "Bitcoin", right: "Erste und bekannteste Kryptowährung" },
					{
						left: "Smart Contract",
						right: "Programm, das auf der Blockchain läuft",
					},
				],
				explanation:
					"Die Blockchain ist die Technik, Bitcoin ein Anwendungsfall, Smart Contracts eine Erweiterung bei Netzwerken wie Ethereum.",
			},
		},
		{
			type: "card",
			title: "Kein gesetzliches Zahlungsmittel",
			body: "Der Euro ist gesetzliches Zahlungsmittel, Bitcoin nicht. Sein Wert entsteht allein dadurch, dass andere bereit sind, dafür zu zahlen. Das macht ihn anders als Aktien, die Anteile an einem Unternehmen mit Gewinnen sind.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Wodurch entsteht der Preis einer Kryptowährung vor allem?",
				options: [
					"Durch garantierte Zinsen",
					"Durch Angebot und Nachfrage am Markt",
					"Durch einen Kurs der Zentralbank",
					"Durch Gewinnausschüttungen",
				],
				correct: 1,
				explanation:
					"Kryptowährungen zahlen keine Zinsen oder Dividenden. Der Preis hängt davon ab, was Käufer bereit sind zu zahlen.",
			},
		},
	],
}
