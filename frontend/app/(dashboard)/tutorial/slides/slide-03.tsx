import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import {
	Callout,
	DataTable,
	Em,
	SlideHeader,
	SlideLayout,
	SlideSection,
	Text,
	type Tone,
} from "./slide-layout"

function Verdict({ tone, children }: { tone: Tone; children: ReactNode }) {
	return (
		<span className={cn(tone === "win" ? "text-win" : "text-muted-foreground")}>
			{children}
		</span>
	)
}

export function Slide03() {
	return (
		<SlideLayout>
			<SlideHeader
				title="Rendite - Ertrag auf angelegtes Kapital"
				subtitle="Wer Geld anlegt, erhält dafür eine Vergütung - die Rendite. Aber nicht jede Rendite ist gleich viel wert."
			/>

			<Text>
				Wenn du jemandem Geld zur Verfügung stellst - einer Bank, einem
				Unternehmen oder dem Staat - erhältst du dafür eine Vergütung. Diese
				nennt sich <Em>Rendite</Em> und wird als jährlicher Prozentsatz
				angegeben.
			</Text>

			<SlideSection title="Typische Renditen im Vergleich">
				<DataTable
					headers={["Anlageform", "Typische Rendite", "Bewertung"]}
					rows={[
						[
							"Tagesgeld",
							<span key="r" className="number tabular-nums">
								1-2 %
							</span>,
							<Verdict key="v" tone="muted">
								oft unter Inflation
							</Verdict>,
						],
						[
							"Staatsanleihen",
							<span key="r" className="number tabular-nums">
								2-3 %
							</span>,
							<Verdict key="v" tone="muted">
								knapp über Inflation
							</Verdict>,
						],
						[
							"Aktien / ETFs (MSCI World)",
							<span key="r" className="number tabular-nums">
								7-9 % (historisch)
							</span>,
							<Verdict key="v" tone="win">
								deutlich über Inflation
							</Verdict>,
						],
					]}
				/>
			</SlideSection>

			<SlideSection title="Realrendite - was wirklich zählt">
				<Text>
					Die entscheidende Frage ist: Liegt deine Rendite{" "}
					<Em>über der Inflationsrate</Em>? Nur dann wächst dein Vermögen real -
					also in echter Kaufkraft.
				</Text>
				<Callout title="Beispiel">
					Bei 2 % Inflation und 1,5 % Tagesgeld-Zinsen verlierst du unterm
					Strich 0,5 % Kaufkraft pro Jahr. Dein Kontostand steigt zwar - aber du
					kannst dir davon weniger leisten als vorher.
				</Callout>
				<Callout variant="takeaway">
					Wer sein Geld langfristig wachsen lassen möchte, muss eine Anlageform
					wählen, deren Rendite die Inflation dauerhaft übertrifft.
				</Callout>
			</SlideSection>
		</SlideLayout>
	)
}
