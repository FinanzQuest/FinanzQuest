"use client"

import {
	InfoCard,
	SlideHeader,
	SlideLayout,
	SlideSection,
} from "./slide-layout"

const riskItems = [
	{
		label: "Tagesgeld",
		risk: 1,
		rendite: "1–2 %",
		desc: "Keine Schwankungen, aber oft unter der Inflation.",
	},
	{
		label: "Staatsanleihen",
		risk: 2,
		rendite: "2–3 %",
		desc: "Geringe Schwankungen, stabile Zinszahlungen.",
	},
	{
		label: "ETFs (z. B. MSCI World)",
		risk: 3,
		rendite: "7–9 %",
		desc: "Spürbare Schwankungen – der MSCI World hat 2008 knapp 40 % verloren. Durch Streuung über hunderte Unternehmen aber deutlich stabiler als Einzelaktien, und historisch immer erholt.",
	},
	{
		label: "Einzelaktien",
		risk: 4,
		rendite: "sehr unterschiedlich",
		desc: "Hängt komplett am Schicksal eines einzigen Unternehmens. Kann sehr gut laufen – oder alles verloren gehen.",
	},
	{
		label: "Kryptowährungen",
		risk: 5,
		rendite: "unvorhersehbar",
		desc: "Extrem hohe Volatilität, stark spekulativ.",
	},
]

const riskColor: Record<number, string> = {
	1: "bg-emerald-500",
	2: "bg-yellow-300",
	3: "bg-amber-500",
	4: "bg-orange-600",
	5: "bg-rose-500",
}

const riskLabel: Record<number, string> = {
	1: "sehr gering",
	2: "gering",
	3: "mittel–hoch",
	4: "hoch",
	5: "sehr hoch",
}

export function Slide07() {
	return (
		<SlideLayout>
			<SlideHeader
				eyebrow="Risiko & Rendite"
				title="Mehr Rendite – aber zu welchem Preis?"
				subtitle="Rendite und Risiko sind untrennbar verbunden. Wer mehr Rendite möchte, muss größere Schwankungen in Kauf nehmen."
			/>

			<SlideSection>
				<p className="text-foreground/75 text-sm leading-relaxed">
					<span className="text-foreground font-medium">Volatilität</span>{" "}
					beschreibt, wie stark der Kurs eines Wertpapiers schwankt. Ein
					Aktienkurs kann innerhalb eines Jahres um 30 % steigen – aber auch um
					40 % fallen. Wer 2008 während der Finanzkrise Aktien hatte, sah seinen
					Depotwert zeitweise halbiert.
				</p>
			</SlideSection>

			<div className="flex flex-col gap-3">
				{riskItems.map(item => (
					<div
						key={item.label}
						className="rounded-xl border bg-muted/40 p-4 flex items-center gap-4"
					>
						<div className="flex flex-col gap-1 w-36 shrink-0">
							<span className="text-foreground font-semibold text-sm">
								{item.label}
							</span>
							<span className="text-foreground/60 text-xs">
								Rendite: {item.rendite}
							</span>
						</div>
						<div className="flex-1 flex flex-col gap-1">
							<div className="flex items-center gap-2">
								<div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
									<div
										className={`h-full rounded-full transition-all ${riskColor[item.risk]}`}
										style={{ width: `${item.risk * 20}%` }}
									/>
								</div>
								<span className="text-xs text-muted-foreground w-20 text-right">
									{riskLabel[item.risk]}
								</span>
							</div>
							<p className="text-foreground/60 text-xs">{item.desc}</p>
						</div>
					</div>
				))}
			</div>

			<InfoCard>
				<span className="font-medium text-foreground">Wichtig:</span> Wer
				kurzfristig auf sein Geld angewiesen ist, kann sich starke Schwankungen
				nicht leisten. Wer aber einen langen Anlagehorizont hat – z. B. 30 Jahre
				bis zur Rente – kann Kursschwankungen aussitzen. Historisch haben sich
				Aktienmärkte nach jedem Einbruch erholt und sind langfristig gestiegen.
			</InfoCard>
		</SlideLayout>
	)
}
