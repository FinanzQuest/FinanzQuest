import { InfoCard } from "../../_engine/blocks"
import type { LessonDef } from "../../_engine/types"
import { DeltaCurve, OptionPayoff } from "./diagrams_b"
import { Tex, tex } from "./math"

export const optionenGriechen: LessonDef = {
	id: "portfolio.optionen-griechen",
	title: "Optionen & Griechen",
	steps: [
		{
			type: "card",
			title: "Was ist eine Option?",
			body: (
				<>
					<p>
						Eine Option ist ein Vertrag mit einem Recht, aber ohne Pflicht. Ein{" "}
						<strong>Call</strong> gibt Dir das Recht, eine Aktie zu einem festen
						Preis (Basispreis) zu kaufen. Ein <strong>Put</strong> gibt Dir das
						Recht, sie zum Basispreis zu verkaufen. Dafür zahlst Du vorab eine
						Prämie.
					</p>
					<div className="mt-3">
						<InfoCard accent>
							Optionen sind hochriskant und werden in FinanzQuest nicht
							gehandelt. Diese Lektion erklärt nur die Mathematik dahinter, so
							wie man sie im Studium trifft.
						</InfoCard>
					</div>
				</>
			),
		},
		{
			type: "card",
			title: "Auszahlungsdiagramm",
			body: (
				<>
					<p>
						Bei Fälligkeit mit Aktienkurs <Tex>{tex`S`}</Tex> und Basispreis{" "}
						<Tex>{tex`K`}</Tex> gilt für den Käufer, abzüglich der Prämie:
					</p>
					<Tex
						block
					>{tex`\text{Call} = \max(S-K,\,0), \qquad \text{Put} = \max(K-S,\,0)`}</Tex>
					<p>
						Der Käufer kann höchstens die Prämie verlieren. Der Call gewinnt bei
						steigenden, der Put bei fallenden Kursen. Wechsle zwischen beiden
						und ziehe den Kurs.
					</p>
				</>
			),
			diagram: <OptionPayoff />,
		},
		{
			type: "exercise",
			exercise: {
				kind: "slider",
				question:
					"Du kaufst einen Call mit Basispreis 100 für eine Prämie von 5. Bei Fälligkeit steht die Aktie bei 112. Wie hoch ist Dein Gewinn je Aktie?",
				min: -10,
				max: 20,
				step: 1,
				correct: 7,
				tolerance: 0.5,
				explanation: "Auszahlung 112 - 100 = 12, minus Prämie 5 = 7.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question:
					"Wie hoch ist der maximale Verlust beim Kauf (Long) eines Calls?",
				options: [
					"Unbegrenzt",
					"Die gezahlte Prämie",
					"Der Basispreis",
					"Der Aktienkurs",
				],
				correct: 1,
				explanation:
					"Das Recht kann verfallen, dann ist die Prämie weg. Mehr kannst Du als Käufer nicht verlieren. Wer Optionen verkauft, kann dagegen sehr viel verlieren.",
			},
		},
		{
			type: "card",
			title: "Die Griechen",
			body: (
				<>
					<p>
						Die Griechen zeigen, wie empfindlich der Optionspreis auf Einflüsse
						reagiert:
					</p>
					<ul className="mt-2 list-disc space-y-1 pl-5">
						<li>
							<strong>Delta</strong> <Tex>{tex`\Delta`}</Tex>: Preisänderung der
							Option, wenn die Aktie um 1 steigt. Beim Call 0 bis 1.
						</li>
						<li>
							<strong>Gamma</strong> <Tex>{tex`\Gamma`}</Tex>: wie schnell sich
							Delta ändert (Krümmung), am größten nahe am Basispreis.
						</li>
						<li>
							<strong>Theta</strong> <Tex>{tex`\Theta`}</Tex>: Zeitwertverlust
							pro Tag. Optionen werden mit der Zeit billiger.
						</li>
						<li>
							<strong>Vega</strong> <Tex>{tex`\mathcal{V}`}</Tex>: Reaktion auf
							die erwartete Volatilität. Mehr Unsicherheit macht Optionen
							teurer.
						</li>
					</ul>
				</>
			),
		},
		{
			type: "card",
			title: "Delta am Bild",
			body: "Die durchgezogene Kurve ist der Optionswert heute, die gestrichelte der Wert bei Fälligkeit. Der Abstand ist der Zeitwert. Delta ist die Steigung: Weit im Geld nähert sie sich 1, weit aus dem Geld 0. Ein Delta von 0,6 heißt: Steigt die Aktie um 2 €, steigt die Option um ca. 1,20 €.",
			diagram: <DeltaCurve />,
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question: "Ordne jeden griechischen Buchstaben zu.",
				pairs: [
					{ left: "Delta", right: "Reaktion auf den Aktienkurs" },
					{ left: "Gamma", right: "Änderungsrate des Deltas" },
					{ left: "Theta", right: "Wertverlust durch Zeitablauf" },
					{ left: "Vega", right: "Reaktion auf die Volatilität" },
				],
				explanation:
					"Delta ist die erste Ableitung des Preises nach dem Kurs, Gamma die zweite. Theta betrifft die Zeit, Vega die Volatilität.",
			},
		},
		{
			type: "card",
			title: "Black-Scholes und der Ausblick",
			body: (
				<>
					<p>
						Wie bepreist man Optionen? Black, Scholes und Merton fanden 1973
						eine geschlossene Formel für den Callpreis. Sie hängt von fünf
						Größen ab: Kurs, Basispreis, Restlaufzeit, Zins und Volatilität.
					</p>
					<Tex block>{tex`C = S\,N(d_1) - K e^{-rT} N(d_2)`}</Tex>
					<p>
						Hier ist <Tex>{tex`N`}</Tex> die Normalverteilungsfunktion, und{" "}
						<Tex>{tex`N(d_1)`}</Tex> ist genau das Delta des Calls. Die
						Herleitung braucht stochastische Analysis und liegt jenseits dieses
						Kurses. Wichtig ist die Idee: Der Preis steckt in der erwarteten
						Schwankung, nicht in der Kursrichtung.
					</p>
				</>
			),
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Bei sonst gleichen Bedingungen verliert eine Option durch Zeitablauf (Theta) an Wert.",
				correct: true,
				explanation:
					"Mit jedem Tag sinkt die Chance auf eine große Kursbewegung vor Fälligkeit, der Zeitwert schmilzt.",
			},
		},
		{
			type: "exercise",
			exercise: {
				kind: "order",
				question:
					"Basispreis 100, Prämie 5. Sortiere die Call-Gewinne je Aktie nach dem Kurs bei Fälligkeit, vom kleinsten zum größten Gewinn.",
				items: ["Kurs 90", "Kurs 103", "Kurs 110", "Kurs 125"],
				explanation:
					"Unter 100 verfällt der Call mit Verlust der Prämie. Bis 105 deckt die Auszahlung die Prämie nur teilweise (Break-even), danach ist es Gewinn.",
			},
		},
	],
}
