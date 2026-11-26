import { DataTable, InfoCard } from "../../_engine/blocks"
import type { LessonDef } from "../../_engine/types"
import { FaktorZeit } from "./diagrams/faktor_zeit"
import { Zinseszins } from "./diagrams/zinseszins"

export const renditeZinseszins: LessonDef = {
	id: "grundlagen.rendite-zinseszins",
	title: "Rendite & Zinseszins",
	steps: [
		{
			type: "card",
			title: "Rendite - Ertrag auf angelegtes Kapital",
			body: (
				<>
					<p>
						Wenn du jemandem Geld zur Verfügung stellst - einer Bank, einem
						Unternehmen oder dem Staat - erhältst du dafür eine Vergütung. Diese
						nennt sich <strong>Rendite</strong> und wird als jährlicher
						Prozentsatz angegeben.
					</p>
					<p>Aber nicht jede Rendite ist gleich viel wert.</p>
				</>
			),
		},
		{
			type: "card",
			title: "Typische Renditen im Vergleich",
			body: (
				<>
					<DataTable
						headers={["Anlageform", "Typische Rendite", "Bewertung"]}
						rows={[
							[
								"Tagesgeld",
								"1-2 %",
								<span key="tg" className="text-xs font-medium text-amber-500">
									oft unter Inflation
								</span>,
							],
							[
								"Staatsanleihen",
								"2-3 %",
								<span key="sa" className="text-xs font-medium text-amber-500">
									knapp über Inflation
								</span>,
							],
							[
								"Aktien / ETFs (MSCI World)",
								"7-9 % (historisch)",
								<span
									key="etf"
									className="text-xs font-medium text-emerald-500"
								>
									deutlich über Inflation
								</span>,
							],
						]}
					/>
					<p className="text-sm text-muted-foreground">
						Richtwerte, keine Garantie: Die Aktienrendite beschreibt den
						langjährigen Durchschnitt (MSCI World, langfristig), einzelne Jahre
						weichen stark ab.
					</p>
				</>
			),
		},
		{
			type: "exercise",
			exercise: {
				kind: "order",
				question:
					"Sortiere die Anlageformen nach ihrer typischen Rendite - von niedrig nach hoch.",
				items: ["Tagesgeld", "Staatsanleihen", "Aktien-ETF (MSCI World)"],
				explanation:
					"Tagesgeld bringt meist 1-2 %, Staatsanleihen 2-3 % und ein breiter Aktien-ETF historisch 7-9 % pro Jahr. Mehr Rendite geht aber mit mehr Schwankung einher.",
			},
		},
		{
			type: "card",
			title: "Realrendite - was wirklich zählt",
			body: (
				<p>
					Die entscheidende Frage ist: Liegt deine Rendite{" "}
					<strong>über der Inflationsrate</strong>? Nur dann wächst dein
					Vermögen real - also in echter Kaufkraft.
				</p>
			),
		},
		{
			type: "card",
			title: "Beispiel Tagesgeld",
			body: (
				<>
					<InfoCard>
						<strong>Beispiel:</strong> Bei 2 % Inflation und 1,5 %
						Tagesgeld-Zinsen verlierst du unterm Strich 0,5 % Kaufkraft pro
						Jahr. Dein Kontostand steigt zwar - aber du kannst dir davon weniger
						leisten als vorher.
					</InfoCard>
					<InfoCard accent>
						Wer sein Geld langfristig wachsen lassen möchte, muss eine
						Anlageform wählen, deren Rendite die Inflation dauerhaft übertrifft.
					</InfoCard>
				</>
			),
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question:
					"Ein Konto zahlt 3 % Zinsen, die Inflation beträgt 4 %. Was passiert mit deiner Kaufkraft?",
				options: [
					"Sie steigt um 1 % pro Jahr",
					"Sie bleibt gleich",
					"Sie sinkt um etwa 1 % pro Jahr",
					"Sie sinkt um 7 % pro Jahr",
				],
				correct: 2,
				explanation:
					"Realrendite = Rendite minus Inflation: 3 % - 4 % = -1 %. Dein Kontostand wächst, aber die Kaufkraft sinkt.",
			},
		},
		{
			type: "card",
			title: "Der Zinseszinseffekt",
			body: (
				<p>
					Stell dir vor, du legst 1.000 € bei 7 % Rendite an. Nach einem Jahr
					hast du 1.070 €. Im zweiten Jahr bekommst du nicht nochmal 70 € -
					sondern 7 % auf <strong>1.070 €</strong>, also 74,90 €.
				</p>
			),
		},
		{
			type: "card",
			title: "Zinsen auf Zinsen",
			body: (
				<p>
					Im dritten Jahr wieder 7 % auf den gewachsenen Betrag, und so weiter.
					Du bekommst also <strong>Zinsen auf deine Zinsen</strong>. Über
					Jahrzehnte führt das zu exponentiellem Wachstum.
				</p>
			),
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Du legst 1.000 € bei 7 % Zinsen an. Wie viel hast du nach 2 Jahren mit Zinseszins?",
				min: 1000,
				max: 1300,
				step: 5,
				correct: 1145,
				tolerance: 10,
				unit: "€",
				explanation:
					"Jahr 1: 1.000 € x 1,07 = 1.070 €. Jahr 2: 1.070 € x 1,07 = 1.144,90 €. Ohne Zinseszins wären es nur 1.140 €.",
			},
		},
		{
			type: "card",
			title: "Probiere den Zinseszins aus",
			body: (
				<p>
					Die grüne Linie zeigt das Wachstum mit Zinseszins, die gestrichelte
					ohne. Ändere Startkapital, Rendite und Zeitraum und beobachte, wie
					weit die Kurven auseinanderlaufen.
				</p>
			),
			diagram: <Zinseszins />,
		},
		{
			type: "card",
			title: "Je früher, desto besser",
			body: (
				<InfoCard accent>
					Je früher du anfängst, desto länger kann der Zinseszinseffekt wirken -
					und desto größer wird der Unterschied zwischen den beiden Kurven.
				</InfoCard>
			),
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Beim Zinseszins bekommst du jedes Jahr gleich viel Zinsen in Euro.",
				correct: false,
				explanation:
					"Das wäre einfache Verzinsung. Beim Zinseszins werden die Zinsen mitverzinst, deshalb steigt der Zinsbetrag jedes Jahr.",
			},
		},
		{
			type: "card",
			title: "Der Faktor Zeit",
			body: (
				<p>
					Der Zinseszinseffekt braucht eines vor allem: <strong>Zeit</strong>.
					Je früher du anfängst, desto länger kann dein Geld wachsen. Zehn Jahre
					früher zu beginnen kann das Endergebnis mehr als verdoppeln - bei
					gleicher monatlicher Rate.
				</p>
			),
		},
		{
			type: "card",
			title: "Früh gegen spät starten",
			body: (
				<p>
					Vergleiche zwei Personen, die gleich viel pro Monat sparen, aber zu
					unterschiedlichen Zeitpunkten beginnen. Rendite: 7 % pro Jahr
					(Annahme, keine Garantie), Rente mit 65.
				</p>
			),
			diagram: <FaktorZeit />,
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Du sparst ab 25 jeden Monat 100 € bei 7 % Rendite bis 65. Wie hoch ist dein Vermögen ungefähr (in 1.000 €)?",
				min: 50,
				max: 500,
				step: 10,
				correct: 264,
				tolerance: 30,
				unit: "Tsd. €",
				explanation:
					"Du zahlst nur 100 € x 12 x 40 = 48.000 € ein, am Ende sind es rund 264.000 €. Den Großteil machen die Zinsen auf Zinsen aus.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "order",
				question:
					"Drei Personen sparen gleich viel pro Monat, starten aber mit 25, 35 und 45. Sortiere nach Endvermögen mit 65 - höchstes zuerst.",
				items: ["Start mit 25", "Start mit 35", "Start mit 45"],
				explanation:
					"Je länger das Geld arbeitet, desto stärker wirkt der Zinseszins. Wer mit 25 startet, hat 40 Jahre Zeit, mit 45 nur 20.",
			},
		},
	],
}
