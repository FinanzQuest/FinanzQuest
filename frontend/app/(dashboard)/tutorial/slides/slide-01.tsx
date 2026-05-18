"use client"

import {
	SlideLayout,
	SlideHeader,
	SlideSection,
	InfoCard,
	DataTable,
} from "./slide-layout"

export function Slide01() {
	return (
		<SlideLayout>
			<SlideHeader
				eyebrow="Einführung"
				title="Warum private Altersvorsorge?"
				subtitle="Die gesetzliche Rente allein wird für die meisten Menschen nicht ausreichen, um den gewohnten Lebensstandard im Alter zu halten."
			/>

			<SlideSection>
				<h2 className="text-foreground font-semibold text-lg">
					Das gesetzliche Rentensystem im Wandel
				</h2>
				<p className="text-foreground/75 text-sm leading-relaxed">
					Wenn du in Rente gehst, erhältst du monatlich Geld vom Staat – die
					gesetzliche Rente. Sie wird von den Menschen finanziert, die zu diesem
					Zeitpunkt noch arbeiten. Das funktioniert solange gut, wie genug
					Erwerbstätige genug Rentner finanzieren können.
				</p>
				<p className="text-foreground/75 text-sm leading-relaxed">
					Das Problem: Diese Balance verschiebt sich. Die Geburtenrate ist
					gesunken und Menschen werden älter.
				</p>
			</SlideSection>

			<div className="grid grid-cols-2 gap-4">
				<div className="rounded-xl border bg-muted/40 p-5 flex flex-col gap-1">
					<span className="text-4xl font-bold text-emerald-500">6 : 1</span>
					<span className="text-foreground/70 text-sm">
						Arbeitnehmer pro Rentner
					</span>
					<span className="text-muted-foreground/50 text-xs">früher</span>
				</div>
				<div className="rounded-xl border bg-muted/40 p-5 flex flex-col gap-1">
					<span className="text-4xl font-bold text-rose-500">2 : 1</span>
					<span className="text-foreground/70 text-sm">
						Arbeitnehmer pro Rentner
					</span>
					<span className="text-muted-foreground/50 text-xs">heute</span>
				</div>
			</div>

			<SlideSection>
				<h2 className="text-foreground font-semibold text-lg">
					Die Rentenlücke
				</h2>
				<p className="text-foreground/75 text-sm leading-relaxed">
					Als Rentenlücke bezeichnet man die Differenz zwischen dem letzten
					Gehalt und der zu erwartenden gesetzlichen Rente. Sie beträgt heute
					häufig <span className="text-foreground font-medium">30–40 %</span>.
				</p>
				<InfoCard>
					<span className="font-medium text-foreground">Beispiel:</span> Wer
					zuletzt 3.000 € netto verdient hat, bekommt im Alter womöglich nur
					1.800–2.100 € – obwohl die Lebenshaltungskosten kaum sinken.
				</InfoCard>
				<InfoCard accent>
					Wer frühzeitig privat vorsorgt, kann diese Lücke durch eigenes
					Vermögen schließen. Wie das funktioniert, zeigen die nächsten Slides.
				</InfoCard>
			</SlideSection>
		</SlideLayout>
	)
}
