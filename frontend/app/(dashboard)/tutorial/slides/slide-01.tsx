import {
	Callout,
	Em,
	SlideHeader,
	SlideLayout,
	SlideSection,
	Stat,
	StatRow,
	Text,
} from "./slide-layout"

export function Slide01() {
	return (
		<SlideLayout>
			<SlideHeader
				eyebrow="Einführung"
				title="Warum private Altersvorsorge?"
				subtitle="Die gesetzliche Rente allein wird für die meisten Menschen nicht ausreichen, um den gewohnten Lebensstandard im Alter zu halten."
			/>

			<SlideSection title="Das gesetzliche Rentensystem im Wandel">
				<Text>
					Wenn du in Rente gehst, erhältst du monatlich Geld vom Staat - die
					gesetzliche Rente. Sie wird von den Menschen finanziert, die zu diesem
					Zeitpunkt noch arbeiten. Das funktioniert so lange gut, wie genug
					Erwerbstätige genug Rentner finanzieren können.
				</Text>
				<Text>
					Das Problem: Diese Balance verschiebt sich. Die Geburtenrate ist
					gesunken und Menschen werden älter.
				</Text>
				<StatRow className="pt-2">
					<Stat
						size="lg"
						label="Früher"
						value="6 : 1"
						hint="Arbeitnehmer pro Rentner"
					/>
					<Stat
						size="lg"
						label="Heute"
						value="2 : 1"
						tone="loss"
						hint="Arbeitnehmer pro Rentner"
					/>
				</StatRow>
			</SlideSection>

			<SlideSection title="Die Rentenlücke">
				<Text>
					Als Rentenlücke bezeichnet man die Differenz zwischen dem letzten
					Gehalt und der zu erwartenden gesetzlichen Rente. Sie beträgt heute
					häufig <Em>30-40 %</Em>.
				</Text>
				<Callout title="Beispiel">
					Wer zuletzt 3.000 € netto verdient hat, bekommt im Alter womöglich nur
					1.800-2.100 € - obwohl die Lebenshaltungskosten kaum sinken.
				</Callout>
				<Callout variant="takeaway">
					Wer frühzeitig privat vorsorgt, kann diese Lücke durch eigenes
					Vermögen schließen. Wie das funktioniert, zeigen die nächsten Slides.
				</Callout>
			</SlideSection>
		</SlideLayout>
	)
}
