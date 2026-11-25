import { DataTable, InfoCard } from "../../_engine/blocks"
import type { LessonDef } from "../../_engine/types"
import { Sparplan } from "./diagrams/sparplan"
import { TerVergleich } from "./diagrams/ter"

export const etfSparplan: LessonDef = {
	id: "grundlagen.etf-sparplan",
	title: "ETFs & Sparplan",
	steps: [
		{
			type: "card",
			title: "ETFs genauer betrachtet",
			body: (
				<p>
					ETFs kombinieren breite Risikostreuung mit sehr geringen Kosten - und
					genau das macht über Jahrzehnte einen enormen Unterschied.
				</p>
			),
		},
		{
			type: "card",
			title: "Was ist die TER?",
			body: (
				<p>
					Die <strong>TER (Total Expense Ratio)</strong> ist die jährliche
					Gebühr, die ein Fonds für seine Verwaltung erhebt. Sie wird
					automatisch vom Fondsvermögen abgezogen - du siehst sie nicht als
					separate Zahlung, aber sie schmälert deine Rendite jedes Jahr.
				</p>
			),
		},
		{
			type: "card",
			title: "Warum Kosten so wichtig sind",
			body: (
				<p>
					Warum ist eine hohe TER so problematisch? Weil sie jedes Jahr anfällt
					und damit durch den Zinseszinseffekt über lange Zeiträume{" "}
					<strong>enorme Auswirkungen</strong> hat.
				</p>
			),
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Was ist die TER eines Fonds?",
				options: [
					"Die Steuer auf Kursgewinne",
					"Die jährliche Verwaltungsgebühr des Fonds",
					"Die Mindestanlagesumme",
					"Der aktuelle Börsenkurs",
				],
				correct: 1,
				explanation:
					"TER steht für Total Expense Ratio: die laufenden jährlichen Kosten in Prozent des Fondsvermögens. Sie wird automatisch abgezogen.",
			},
		},
		{
			type: "card",
			title: "ETF gegen aktiven Fonds",
			body: (
				<p>
					Gleiche Rendite vor Kosten, aber unterschiedliche Gebühren: Ein ETF
					mit 0,2 % TER gegen einen aktiv gemanagten Fonds mit 1,5 % TER.
					Typische Größenordnungen, die Werte variieren je nach Produkt.
				</p>
			),
			diagram: <TerVergleich />,
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Ein Unterschied von 1,3 Prozentpunkten Kosten pro Jahr ist so klein, dass er nach 30 Jahren kaum auffällt.",
				correct: false,
				explanation:
					"Durch den Zinseszins wirkt sich der Kostenunterschied jedes Jahr aus. Im Beispiel sind nach 30 Jahren mehr als 22.000 € Unterschied bei 10.000 € Startkapital.",
			},
		},
		{
			type: "card",
			title: "Thesaurierend oder ausschüttend",
			body: (
				<DataTable
					headers={["Begriff", "Bedeutung"]}
					rows={[
						[
							"Thesaurierend",
							"Erträge werden automatisch reinvestiert → Zinseszinseffekt ohne Zutun",
						],
						[
							"Ausschüttend",
							"Erträge werden regelmäßig ausgezahlt - müssen selbst reinvestiert werden",
						],
					]}
				/>
			),
		},
		{
			type: "card",
			title: "Zwei bekannte Indizes",
			body: (
				<>
					<DataTable
						headers={["Begriff", "Bedeutung"]}
						rows={[
							[
								"MSCI World",
								"Index aus ca. 1.400 Unternehmen aus 23 Industrieländern",
							],
							[
								"S&P 500",
								"Index der 500 größten börsennotierten US-Unternehmen",
							],
						]}
					/>
					<p className="text-sm text-muted-foreground">
						Stand 2024, die Zusammensetzung ändert sich laufend.
					</p>
				</>
			),
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question: "Ordne den Begriff der richtigen Bedeutung zu.",
				pairs: [
					{ left: "Thesaurierend", right: "Erträge werden reinvestiert" },
					{ left: "Ausschüttend", right: "Erträge werden ausgezahlt" },
					{
						left: "MSCI World",
						right: "Ca. 1.400 Firmen aus Industrieländern",
					},
					{ left: "S&P 500", right: "500 große US-Unternehmen" },
				],
				explanation:
					"Thesaurierende ETFs lassen den Zinseszins automatisch laufen, ausschüttende zahlen aus. MSCI World und S&P 500 sind Indizes, die ETFs nachbilden.",
			},
		},
		{
			type: "card",
			title: "Der Sparplan - regelmäßig investieren",
			body: (
				<p>
					Vermögensaufbau beginnt nicht mit einem großen Einmalbetrag, sondern
					mit einem Teil des monatlichen Gehalts. Die wenigsten haben gleich zu
					Beginn mehrere Tausend Euro zur Verfügung.
				</p>
			),
		},
		{
			type: "card",
			title: "Was ist ein Sparplan?",
			body: (
				<p>
					Ein <strong>Sparplan</strong> legt automatisch jeden Monat einen
					festen Betrag in einen ETF an - z. B. 50 € oder 150 € aus dem Gehalt.
					Das Wichtigste dabei: Du musst nicht groß anfangen.
				</p>
			),
		},
		{
			type: "card",
			title: "Rechne deinen Sparplan",
			body: (
				<p>
					Stelle Rate, Rendite und Laufzeit ein. Die grauen Balken zeigen, was
					du selbst einzahlst, die grünen, was der Zinseszins dazu beiträgt. Die
					Rendite ist eine Annahme, keine Garantie.
				</p>
			),
			diagram: <Sparplan />,
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Du zahlst 30 Jahre lang jeden Monat 100 € in einen Sparplan. Wie viel hast du selbst eingezahlt (in Tsd. €)?",
				min: 0,
				max: 60,
				step: 1,
				correct: 36,
				tolerance: 2,
				unit: "Tsd. €",
				explanation:
					"100 € x 12 Monate x 30 Jahre = 36.000 €. Bei 7 % Rendite wären daraus rund 122.700 € geworden - der Rest sind Zinsen.",
			},
		},
		{
			type: "card",
			title: "Disziplin durch Automatisierung",
			body: (
				<InfoCard accent>
					Der Betrag wird monatlich abgebucht, bevor du ihn ausgeben kannst. So
					entsteht Vermögen ohne aktive Entscheidung jeden Monat.
				</InfoCard>
			),
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Was ist der größte Vorteil eines Sparplans?",
				options: [
					"Er garantiert eine feste Rendite",
					"Du investierst regelmäßig und automatisch, auch mit kleinen Beträgen",
					"Er ist steuerfrei",
					"Du brauchst keinen Anlagehorizont",
				],
				correct: 1,
				explanation:
					"Ein Sparplan macht Investieren alltagstauglich: Schon kleine Beträge, regelmäßig angelegt, können über Jahre stark wachsen. Eine Rendite garantiert er nicht.",
			},
		},
	],
}
