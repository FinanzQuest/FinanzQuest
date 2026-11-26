import type { LessonDef } from "../../_engine/types"

export const risikenFallen: LessonDef = {
	id: "krypto.risiken-fallen",
	title: "Risiken & Fallen",
	steps: [
		{
			type: "card",
			title: "Kein Cashflow, kein innerer Wert",
			body: "Eine Aktie gibt Dir Anteil an Gewinnen, eine Anleihe zahlt Zinsen. Die meisten Kryptowährungen zahlen nichts aus. Ein Gewinn entsteht nur, wenn jemand später mehr zahlt als Du. Das macht sie schwer zu bewerten.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question: "Welche Anlage hat welche Einnahmequelle?",
				pairs: [
					{ left: "Aktie", right: "Dividenden und Unternehmensgewinne" },
					{ left: "Anleihe", right: "Zinszahlungen" },
					{ left: "Bitcoin", right: "Keine laufenden Zahlungen" },
				],
				explanation:
					"Bitcoin erzeugt keinen laufenden Ertrag. Rendite entsteht nur durch Kursänderungen.",
			},
		},
		{
			type: "card",
			title: "Betrug und Rug Pulls",
			body: "Beim Rug Pull verkaufen die Macher eines neuen Coins ihre Bestände und verschwinden, der Kurs bricht zusammen. Dazu kommen gefälschte Webseiten, Fake-Gewinnversprechen und Nachrichten von angeblichen Beratern. Schnelle, sichere Gewinne gibt es nicht.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Was ist ein typisches Warnsignal für Betrug?",
				options: [
					"Eine ausführliche Risikoaufklärung",
					"Garantierte hohe Renditen in kurzer Zeit",
					"Eine unabhängige Prüfung",
					"Ein lange bestehendes Projekt",
				],
				correct: 1,
				explanation:
					"Garantierte hohe Gewinne sind unseriös, denn jede Rendite ist mit Risiko verbunden.",
			},
		},
		{
			type: "card",
			title: "Verwahrung: Du bist Dein eigener Tresor",
			body: "Coins liegen entweder bei einer Börse oder in einer eigenen Wallet. Bei der Börse trägst Du deren Ausfallrisiko, wie bei der Pleite von FTX 2022. In der eigenen Wallet bist Du allein verantwortlich: Geht der Zugangsschlüssel verloren, ist das Geld meist unwiederbringlich weg.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Wenn Du den privaten Schlüssel Deiner Wallet verlierst, kann Dir eine Bank das Guthaben zurückholen.",
				correct: false,
				explanation:
					"Es gibt keine zentrale Stelle, die Zugriff wiederherstellt. Ohne Schlüssel sind die Coins in der Regel verloren.",
			},
		},
		{
			type: "card",
			title: "Regulierung und Einlagensicherung",
			body: "Die Regeln für Kryptowerte ändern sich in vielen Ländern noch. In der EU gilt zum Beispiel die MiCA-Verordnung. Anders als bei Bankguthaben gibt es für Coins in der Regel keine gesetzliche Einlagensicherung.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Welche Aussage über Kryptoguthaben ist zutreffend?",
				options: [
					"Sie sind wie Bankeinlagen gesetzlich bis 100.000 € gesichert",
					"Sie haben in der Regel keine staatliche Einlagensicherung",
					"Sie sind immer steuerfrei",
					"Sie sind gegen Kursverluste versichert",
				],
				correct: 1,
				explanation:
					"Eine gesetzliche Einlagensicherung wie bei Bankkonten gibt es für Kryptowerte in der Regel nicht.",
			},
		},
		{
			type: "card",
			title: "Nur Geld, das Du verlieren kannst",
			body: "Wegen der extremen Risiken gilt: Setze nur Geld ein, dessen Totalverlust Du verkraften kannst. Nie Notgroschen, nie Geld, das Du bald brauchst, nie Kredit. Wenn überhaupt, bleibt der Anteil klein neben einer breit gestreuten Basis.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question:
					"Welches Geld darf höchstens in riskante Krypto-Anlagen fließen?",
				options: [
					"Der Notgroschen",
					"Geld aus einem Kredit",
					"Geld, dessen Totalverlust verkraftbar wäre",
					"Die Miete des nächsten Monats",
				],
				correct: 2,
				explanation:
					"Ein Totalverlust ist möglich. Er darf Deine Lebensplanung nicht gefährden.",
			},
		},
		{
			type: "card",
			title: "Prüfe vor jedem Schritt",
			body: "Hilfreiche Fragen: Verstehe ich, was ich kaufe? Wer verwahrt es? Wer verspricht mir hier etwas und warum? Wenn Du eine Frage nicht beantworten kannst, lass die Finger davon.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Ein hoher Kursanstieg in den letzten Wochen beweist, dass ein Coin sicher ist.",
				correct: false,
				explanation:
					"Vergangene Kursgewinne sagen nichts über die Sicherheit. Auch Betrugsprojekte können zeitweise stark steigen.",
			},
		},
	],
}
