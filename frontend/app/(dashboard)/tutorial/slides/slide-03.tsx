"use client"

import { SlideLayout, SlideHeader, SlideSection, InfoCard, DataTable } from "./slide-layout"

export function Slide03() {
	return (
		<SlideLayout>
			<SlideHeader
				eyebrow="Grundlagen"
				title="Rendite – Ertrag auf angelegtes Kapital"
				subtitle="Wer Geld anlegt, erhält dafür eine Vergütung – die Rendite. Aber nicht jede Rendite ist gleich viel wert."
			/>

			<SlideSection>
				<p className="text-foreground/75 text-sm leading-relaxed">
					Wenn du jemandem Geld zur Verfügung stellst – einer Bank, einem
					Unternehmen oder dem Staat – erhältst du dafür eine Vergütung. Diese
					nennt sich{" "}
					<span className="text-foreground font-medium">Rendite</span> und wird
					als jährlicher Prozentsatz angegeben.
				</p>
			</SlideSection>

			<SlideSection>
				<h2 className="text-foreground font-semibold text-lg">
					Typische Renditen im Vergleich
				</h2>
				<DataTable
					headers={["Anlageform", "Typische Rendite", "Bewertung"]}
					rows={[
						[
							"Tagesgeld",
							"1–2 %",
							<span key="tg" className="text-amber-500 text-xs font-medium">
								oft unter Inflation
							</span>,
						],
						[
							"Staatsanleihen",
							"2–3 %",
							<span key="sa" className="text-amber-500 text-xs font-medium">
								knapp über Inflation
							</span>,
						],
						[
							"Aktien / ETFs (MSCI World)",
							"7–9 % (historisch)",
							<span key="etf" className="text-emerald-500 text-xs font-medium">
								deutlich über Inflation
							</span>,
						],
					]}
				/>
			</SlideSection>

			<SlideSection>
				<h2 className="text-foreground font-semibold text-lg">
					Realrendite – was wirklich zählt
				</h2>
				<p className="text-foreground/75 text-sm leading-relaxed">
					Die entscheidende Frage ist: Liegt deine Rendite{" "}
					<span className="text-foreground font-medium">
						über der Inflationsrate
					</span>
					? Nur dann wächst dein Vermögen real – also in echter Kaufkraft.
				</p>
				<InfoCard>
					<span className="font-medium text-foreground">Beispiel:</span> Bei 2 %
					Inflation und 1,5 % Tagesgeld-Zinsen verlierst du unterm Strich 0,5 %
					Kaufkraft pro Jahr. Dein Kontostand steigt zwar – aber du kannst dir
					davon weniger leisten als vorher.
				</InfoCard>
				<InfoCard accent>
					Wer sein Geld langfristig wachsen lassen möchte, muss eine Anlageform
					wählen, deren Rendite die Inflation dauerhaft übertrifft.
				</InfoCard>
			</SlideSection>
		</SlideLayout>
	)
}
