import type { LessonDef } from "../../_engine/types"

export const blockchainTechnik: LessonDef = {
	id: "krypto-vertiefung.blockchain-technik",
	title: "Blockchain-Technik",
	steps: [
		{
			type: "card",
			title: "Was steckt in einem Block?",
			body: "Ein Block enthält eine Liste von Transaktionen, einen Zeitstempel und den Hash des vorherigen Blocks. Ein Hash ist ein digitaler Fingerabdruck: Ändert sich auch nur ein Zeichen der Daten, ändert sich der Hash komplett.",
		},
		{
			type: "card",
			title: "Warum die Kette hält",
			body: "Weil jeder Block den Hash seines Vorgängers enthält, würde das Ändern eines alten Blocks alle späteren Hashes ungültig machen. Um zu fälschen, müsste man die gesamte Folgekette neu berechnen und das Netzwerk überzeugen.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Ändert man eine alte Transaktion, bleiben die Hashes der späteren Blöcke gültig.",
				correct: false,
				explanation:
					"Der Hash des geänderten Blocks ändert sich, damit passt der Verweis im Folgeblock nicht mehr.",
			},
		},
		{
			type: "card",
			title: "Konsens ohne Chef",
			body: "Wer darf den nächsten Block anhängen? Bei Bitcoin lösen Rechner (Miner) dafür Rechenaufgaben, das heißt Proof of Work. Das kostet viel Strom. Andere Netzwerke nutzen Proof of Stake: Teilnehmer hinterlegen Coins als Pfand und werden zufällig ausgewählt.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question: "Ordne das Verfahren zu.",
				pairs: [
					{
						left: "Proof of Work",
						right: "Rechenaufwand sichert das Netzwerk",
					},
					{
						left: "Proof of Stake",
						right: "Hinterlegte Coins dienen als Pfand",
					},
					{ left: "Hash", right: "Digitaler Fingerabdruck von Daten" },
				],
				explanation:
					"Beide Verfahren sollen Betrug teuer machen, nur auf verschiedenen Wegen.",
			},
		},
		{
			type: "card",
			title: "Wallet und Schlüssel",
			body: "Eine Wallet speichert nicht die Coins selbst, sondern Schlüssel. Der öffentliche Schlüssel (bzw. die daraus abgeleitete Adresse) ist wie eine Kontonummer, die Du teilen kannst. Der private Schlüssel ist wie die Unterschrift, mit der Du Coins ausgibst. Er darf niemals weitergegeben werden.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Wer den privaten Schlüssel kennt, kann was tun?",
				options: [
					"Nur Guthaben ansehen",
					"Über die zugehörigen Coins verfügen",
					"Nichts, er ist nur Dekoration",
					"Transaktionen rückgängig machen",
				],
				correct: 1,
				explanation:
					"Der private Schlüssel gibt volle Kontrolle. Deshalb muss er geheim und sicher gesichert sein.",
			},
		},
		{
			type: "card",
			title: "Endgültig, auch bei Fehlern",
			body: "Bestätigte Transaktionen lassen sich nicht rückgängig machen. Eine falsch eingegebene Adresse oder ein Betrug mit einer Überweisung ist in der Regel nicht korrigierbar. Es gibt keine Bank, die Du anrufen kannst.",
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Eine Überweisung an eine falsche Adresse lässt sich meist einfach zurückbuchen.",
				correct: false,
				explanation:
					"Blockchain-Transaktionen sind endgültig. Es gibt keine zentrale Stelle für Rückbuchungen.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "order",
				question: "Bringe den Weg einer Transaktion in Reihenfolge.",
				items: [
					"Du signierst mit Deinem privaten Schlüssel",
					"Die Transaktion geht ins Netzwerk",
					"Teilnehmer prüfen Signatur und Guthaben",
					"Ein neuer Block mit ihr wird angehängt",
				],
				explanation:
					"Signatur, Verbreitung, Prüfung und Aufnahme in einen Block bilden den typischen Ablauf.",
			},
		},
	],
}
