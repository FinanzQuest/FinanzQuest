import { InfoCard } from "../../_engine/blocks"
import type { LessonDef } from "../../_engine/types"
import { Anlageklassen } from "./diagrams/anlageklassen"
import { Diversifikation, EinzelVsViele } from "./diagrams/diversifikation"
import { RisikoSkala } from "./diagrams/risiko_skala"

export const risikoStreuung: LessonDef = {
	id: "grundlagen.risiko-streuung",
	title: "Risiko & Streuung",
	steps: [
		{
			type: "card",
			title: "Anlageklassen im Überblick",
			body: (
				<p>
					Es gibt verschiedene Arten, Geld anzulegen - von sicheren Konten bis
					zu spekulativen Investments. Wir schauen uns vier davon an.
				</p>
			),
		},
		{
			type: "card",
			title: "Tagesgeld",
			body: (
				<>
					<p>
						Ein Sparkonto bei einer Bank, auf das du täglich zugreifen kannst.
						Die Bank zahlt dir dafür Zinsen - den Tagesgeldzins, der sich am
						Leitzins der EZB orientiert. Kein Verlustrisiko, aber die Rendite
						liegt oft unter der Inflation.
					</p>
					<p className="text-sm text-muted-foreground">
						z. B. bei DKB, ING, Consorsbank
					</p>
				</>
			),
		},
		{
			type: "card",
			title: "Anleihen",
			body: (
				<>
					<p>
						Du leihst einem Staat oder Unternehmen Geld und erhältst dafür
						regelmäßige Zinszahlungen. Geringeres Risiko als Aktien, aber auch
						deutlich geringere Rendite.
					</p>
					<p className="text-sm text-muted-foreground">
						z. B. Bundesanleihe, US Treasury
					</p>
				</>
			),
		},
		{
			type: "card",
			title: "Aktien & ETFs",
			body: (
				<>
					<p>
						Eine Aktie ist ein Anteil an einem Unternehmen. Ein ETF bündelt
						viele Aktien automatisch - z. B. den MSCI World mit rund 1.400
						Unternehmen weltweit (Stand 2024). Historisch hohe Rendite, aber mit
						Kursschwankungen.
					</p>
					<p className="text-sm text-muted-foreground">
						z. B. iShares MSCI World, S&P 500 ETF
					</p>
				</>
			),
		},
		{
			type: "card",
			title: "Kryptowährungen",
			body: (
				<>
					<p>
						Digitale Währungen wie Bitcoin. Extrem hohe Volatilität, kein
						innerer Wert im klassischen Sinne, stark spekulativ.
					</p>
					<p className="text-sm text-muted-foreground">
						z. B. Bitcoin, Ethereum
					</p>
				</>
			),
		},
		{
			type: "exercise",
			exercise: {
				kind: "match",
				question: "Welche Beschreibung passt zu welcher Anlageklasse?",
				pairs: [
					{ left: "Tagesgeld", right: "Sparkonto mit täglichem Zugriff" },
					{ left: "Anleihe", right: "Geld an Staat oder Firma verliehen" },
					{ left: "Aktie", right: "Anteil an einem Unternehmen" },
					{ left: "ETF", right: "Bündelt viele Aktien in einem Produkt" },
				],
				explanation:
					"Bei Tagesgeld und Anleihen leihst du Geld aus und bekommst Zinsen. Mit einer Aktie gehört dir ein kleiner Teil eines Unternehmens, ein ETF bündelt viele davon.",
			},
		},
		{
			type: "card",
			title: "Wertentwicklung seit 2004",
			body: (
				<>
					<p>
						Tippe auf die Anlageklassen, um sie ein- oder auszublenden. Alle
						starten bei 100.
					</p>
					<p className="text-sm text-muted-foreground">
						Quellen: MSCI World (Jahresendwerte), Tagesgeld (EONIA/€STR,
						kumuliert), Anleihen (Bloomberg Global Aggregate), Bitcoin
						(Jahresdurchschnitt). Vergangene Entwicklung garantiert keine
						zukünftige.
					</p>
				</>
			),
			diagram: <Anlageklassen />,
		},
		{
			type: "card",
			title: "Mehr Rendite - aber zu welchem Preis?",
			body: (
				<p>
					Rendite und Risiko sind untrennbar verbunden. Wer mehr Rendite möchte,
					muss größere Schwankungen in Kauf nehmen.
				</p>
			),
		},
		{
			type: "card",
			title: "Was ist Volatilität?",
			body: (
				<p>
					<strong>Volatilität</strong> beschreibt, wie stark der Kurs eines
					Wertpapiers schwankt. Ein Aktienkurs kann innerhalb eines Jahres um 30
					% steigen - aber auch um 40 % fallen. Wer 2008 während der Finanzkrise
					Aktien hatte, sah seinen Depotwert zeitweise halbiert.
				</p>
			),
		},
		{
			type: "card",
			title: "Risiko und Rendite im Vergleich",
			body: (
				<p>
					Je länger der Balken, desto stärker die Schwankungen. Beachte, wie die
					erwartete Rendite mitwächst.
				</p>
			),
			diagram: <RisikoSkala />,
		},
		{
			type: "exercise",
			exercise: {
				kind: "order",
				question:
					"Sortiere nach Schwankungsrisiko - vom geringsten zum höchsten.",
				items: [
					"Tagesgeld",
					"Staatsanleihen",
					"Aktien-ETF",
					"Einzelaktie",
					"Kryptowährung",
				],
				explanation:
					"Tagesgeld schwankt gar nicht, Staatsanleihen wenig. Ein ETF streut über viele Firmen, eine Einzelaktie hängt an einer einzigen. Krypto schwankt am stärksten.",
			},
		},
		{
			type: "card",
			title: "Wichtig: der Anlagehorizont",
			body: (
				<InfoCard>
					Wer kurzfristig auf sein Geld angewiesen ist, kann sich starke
					Schwankungen nicht leisten. Wer aber einen langen Anlagehorizont hat -
					z. B. 30 Jahre bis zur Rente - kann Kursschwankungen aussitzen.
					Historisch haben sich Aktienmärkte nach jedem Einbruch erholt und sind
					langfristig gestiegen.
				</InfoCard>
			),
		},
		{
			type: "exercise",
			exercise: {
				kind: "true_false",
				statement:
					"Wer in 2 Jahren eine Anzahlung für ein Auto braucht, sollte das Geld lieber nicht komplett in Aktien stecken.",
				correct: true,
				explanation:
					"Aktien können kurzfristig stark fallen. Bei kurzem Horizont bleibt keine Zeit zur Erholung - dafür sind sichere Anlagen wie Tagesgeld besser.",
			},
		},
		{
			type: "card",
			title: "Diversifikation - Risikostreuung",
			body: (
				<p>
					Nicht alles auf eine Karte setzen: Das Verteilen von Kapital auf viele
					Anlagen senkt das Risiko erheblich.
				</p>
			),
		},
		{
			type: "card",
			title: "Eine Aktie oder viele?",
			body: (
				<p>
					Angenommen, du investierst dein gesamtes Geld in die Aktie eines
					einzigen Unternehmens. Geht dieses Unternehmen pleite, ist dein
					gesamtes Kapital verloren. Diversifikation löst dieses Problem: Statt
					auf ein Unternehmen zu setzen, verteilst du dein Kapital auf viele
					verschiedene Anlagen.
				</p>
			),
			diagram: <EinzelVsViele />,
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question:
					"Du hast 1.000 € in 1.000 verschiedene Aktien gleich verteilt. Eine Firma geht pleite. Wie viel verlierst du ungefähr?",
				options: ["1.000 €", "500 €", "Etwa 1 €", "100 €"],
				correct: 2,
				explanation:
					"Jede Aktie macht nur 1/1.000 deines Geldes aus - also ca. 1 €. Genau das ist der Vorteil von Streuung.",
			},
		},
		{
			type: "card",
			title: "Simulation: Einzelaktie vs. Portfolio",
			body: (
				<p>
					Die rote Linie ist eine einzelne Aktie, die grüne ein Portfolio aus 20
					Aktien. Starte mehrmals eine neue Simulation und beobachte, welche
					Linie ruhiger verläuft.
				</p>
			),
			diagram: <Diversifikation />,
		},
		{
			type: "exercise",
			exercise: {
				kind: "mc",
				question: "Was bewirkt Diversifikation hauptsächlich?",
				options: [
					"Sie garantiert höhere Gewinne",
					"Sie verringert das Risiko durch einzelne Verlierer",
					"Sie senkt die Steuern",
					"Sie verhindert jeden Kursrückgang",
				],
				correct: 1,
				explanation:
					"Streuung glättet die Schwankungen, weil einzelne Verlierer durch andere Anlagen ausgeglichen werden. Gewinne garantiert sie nicht, und auch breit gestreute Märkte können insgesamt fallen.",
			},
		},
	],
}
