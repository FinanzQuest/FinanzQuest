import { InfoCard } from "../../_engine/blocks"
import type { LessonDef } from "../../_engine/types"
import { Kaufkraft } from "./diagrams/kaufkraft"
import { Rentensystem } from "./diagrams/rentensystem"

export const warumVorsorgen: LessonDef = {
	id: "grundlagen.warum-vorsorgen",
	title: "Warum vorsorgen?",
	steps: [
		{
			type: "card",
			title: "Warum private Altersvorsorge?",
			body: (
				<>
					<p>
						Die gesetzliche Rente allein wird für die meisten Menschen nicht
						ausreichen, um den gewohnten Lebensstandard im Alter zu halten.
					</p>
					<p>Warum das so ist, siehst du in den nächsten Karten.</p>
				</>
			),
		},
		{
			type: "card",
			title: "Das Rentensystem im Wandel",
			body: (
				<p>
					Wenn du in Rente gehst, erhältst du monatlich Geld vom Staat - die
					gesetzliche Rente. Sie wird von den Menschen finanziert, die zu diesem
					Zeitpunkt noch arbeiten. Das funktioniert solange gut, wie genug
					Erwerbstätige genug Rentner finanzieren können.
				</p>
			),
		},
		{
			type: "card",
			title: "Die Balance verschiebt sich",
			body: (
				<>
					<p>
						Das Problem: Die Geburtenrate ist gesunken und Menschen werden
						älter. Immer weniger Arbeitende finanzieren immer mehr Rentner.
					</p>
					<p className="text-sm text-muted-foreground">
						Richtwerte nach Angaben der Deutschen Rentenversicherung: Anfang der
						1960er kamen rund 6 Beitragszahler auf einen Rentner, heute etwa 2.
					</p>
				</>
			),
			diagram: <Rentensystem />,
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Wer bezahlt die heutigen gesetzlichen Renten hauptsächlich?",
				options: [
					"Die Menschen, die heute arbeiten",
					"Das Geld, das jeder Rentner früher selbst angespart hat",
					"Die Banken",
					"Die Börse",
				],
				correct: 0,
				explanation:
					"Die gesetzliche Rente funktioniert als Umlage: Was heute eingezahlt wird, bekommen die heutigen Rentner. Deshalb ist das Verhältnis von Arbeitenden zu Rentnern so wichtig.",
			},
		},
		{
			type: "card",
			title: "Die Rentenlücke",
			body: (
				<>
					<p>
						Als Rentenlücke bezeichnet man die Differenz zwischen dem letzten
						Gehalt und der zu erwartenden gesetzlichen Rente. Sie beträgt heute
						häufig <strong>30-40 %</strong>.
					</p>
					<InfoCard>
						<strong>Beispiel:</strong> Wer zuletzt 3.000 € netto verdient hat,
						bekommt im Alter womöglich nur 1.800-2.100 € - obwohl die
						Lebenshaltungskosten kaum sinken.
					</InfoCard>
				</>
			),
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Du verdienst zuletzt 3.000 € netto und die Rentenlücke beträgt 35 %. Wie viel Euro bekommst du ungefähr als Rente?",
				min: 1000,
				max: 3000,
				step: 50,
				correct: 1950,
				tolerance: 100,
				unit: "€",
				explanation:
					"35 % von 3.000 € sind 1.050 €. Es bleiben also etwa 1.950 € übrig - 1.050 € fehlen jeden Monat.",
			},
		},
		{
			type: "card",
			title: "Vorsorge schließt die Lücke",
			body: (
				<InfoCard accent>
					Wer frühzeitig privat vorsorgt, kann diese Lücke durch eigenes
					Vermögen schließen. Wie das funktioniert, zeigen die nächsten
					Lektionen.
				</InfoCard>
			),
		},
		{
			type: "card",
			title: "Inflation und Kaufkraft",
			body: (
				<>
					<p>
						Inflation bedeutet: Preise steigen - und dein Geld wird dadurch Jahr
						für Jahr weniger wert.
					</p>
					<p>
						Ein Beispiel aus dem Alltag: Eine Kinokarte hat vor 20 Jahren ca. 5
						€ gekostet, heute oft 15 €. Der Betrag auf deinem Konto bleibt
						gleich - aber du kannst damit weniger kaufen als früher. Diesen
						Effekt nennt man <strong>Kaufkraftverlust</strong>.
					</p>
				</>
			),
		},
		{
			type: "card",
			title: "Was 100 € in Zukunft wert sind",
			body: (
				<>
					<p>
						Probiere es aus: Verändere die Inflationsrate und den Zeitraum und
						schau, wie viel Kaufkraft von 100 € übrig bleibt.
					</p>
					<p className="text-sm text-muted-foreground">
						Das Inflationsziel der EZB liegt bei 2 %. In Deutschland lag die
						Inflation 2024 bei etwa 2,2 % (Statistisches Bundesamt).
					</p>
				</>
			),
			diagram: <Kaufkraft />,
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Du lässt 100 € zehn Jahre bei 2 % Inflation auf dem Konto liegen. Wie viel Kaufkraft haben sie dann noch (in €)?",
				min: 50,
				max: 100,
				step: 1,
				correct: 82,
				tolerance: 3,
				unit: "€",
				explanation:
					"Jedes Jahr verlieren die 100 € etwa 2 % ihrer Kaufkraft. Nach 10 Jahren bleiben ca. 82 € - der Kontostand ist gleich, aber du kannst weniger kaufen.",
			},
		},
		{
			type: "card",
			title: "Nichtstun ist nicht neutral",
			body: (
				<InfoCard accent>
					Geld auf einem niedrig verzinsten Konto zu lassen ist keine neutrale
					Entscheidung - real bedeutet es einen schleichenden Wertverlust von
					Jahr zu Jahr. Die Lösung: Geld so anlegen, dass es mehr wächst als die
					Inflation steigt.
				</InfoCard>
			),
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Wenn du 1.000 € 20 Jahre lang unter dem Kopfkissen lässt, kannst du dir danach genauso viel davon kaufen wie heute.",
				correct: false,
				explanation:
					"Die Zahl bleibt 1.000 €, aber die Preise steigen. Mit dem gleichen Betrag bekommst du später weniger - das ist der Kaufkraftverlust durch Inflation.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question: "Ordne den Begriff der passenden Erklärung zu.",
				pairs: [
					{
						left: "Rentenlücke",
						right: "Differenz zwischen letztem Gehalt und Rente",
					},
					{ left: "Inflation", right: "Preise steigen allgemein" },
					{
						left: "Kaufkraftverlust",
						right: "Mit dem gleichen Geld kaufst du weniger",
					},
				],
				explanation:
					"Die Rentenlücke beschreibt, was im Alter an Einkommen fehlt. Inflation lässt die Preise steigen - und das führt zu Kaufkraftverlust bei Geld, das nicht mitwächst.",
			},
		},
	],
}
