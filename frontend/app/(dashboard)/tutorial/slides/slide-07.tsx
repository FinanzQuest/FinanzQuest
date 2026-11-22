import { cn } from "@/lib/utils"
import { Callout, Em, SlideHeader, SlideLayout, Text } from "./slide-layout"

const riskItems = [
	{
		label: "Tagesgeld",
		risk: 1,
		rendite: "1-2 %",
		desc: "Keine Schwankungen, aber oft unter der Inflation.",
	},
	{
		label: "Staatsanleihen",
		risk: 2,
		rendite: "2-3 %",
		desc: "Geringe Schwankungen, stabile Zinszahlungen.",
	},
	{
		label: "ETFs (z. B. MSCI World)",
		risk: 3,
		rendite: "7-9 %",
		desc: "Spürbare Schwankungen - der MSCI World hat 2008 knapp 40 % verloren. Durch Streuung über hunderte Unternehmen aber deutlich stabiler als Einzelaktien, und historisch immer erholt.",
	},
	{
		label: "Einzelaktien",
		risk: 4,
		rendite: "sehr unterschiedlich",
		desc: "Hängt komplett am Schicksal eines einzigen Unternehmens. Kann sehr gut laufen - oder alles verloren gehen.",
	},
	{
		label: "Kryptowährungen",
		risk: 5,
		rendite: "unvorhersehbar",
		desc: "Extrem hohe Volatilität, stark spekulativ.",
	},
]

const riskLabel: Record<number, string> = {
	1: "sehr gering",
	2: "gering",
	3: "mittel-hoch",
	4: "hoch",
	5: "sehr hoch",
}

/** Five rising bars, filled up to the risk level. */
function RiskMeter({ level }: { level: number }) {
	return (
		<span
			role="img"
			aria-label={`Risiko ${level} von 5: ${riskLabel[level]}`}
			className="flex items-end gap-0.5 h-4"
		>
			{[1, 2, 3, 4, 5].map(i => (
				<span
					key={i}
					className={cn(
						"w-1.5 rounded-[1px]",
						i <= level ? "bg-foreground" : "bg-border"
					)}
					style={{ height: `${i * 20}%` }}
				/>
			))}
		</span>
	)
}

export function Slide07() {
	return (
		<SlideLayout>
			<SlideHeader
				title="Mehr Rendite - aber zu welchem Preis?"
				subtitle="Rendite und Risiko sind untrennbar verbunden. Wer mehr Rendite möchte, muss größere Schwankungen in Kauf nehmen."
			/>

			<Text>
				<Em>Volatilität</Em> beschreibt, wie stark der Kurs eines Wertpapiers
				schwankt. Ein Aktienkurs kann innerhalb eines Jahres um 30 % steigen -
				aber auch um 40 % fallen. Wer 2008 während der Finanzkrise Aktien hatte,
				sah seinen Depotwert zeitweise halbiert.
			</Text>

			<ul className="rounded-xl border divide-y">
				{riskItems.map(item => (
					<li
						key={item.label}
						className="grid gap-x-6 gap-y-2 p-4 sm:grid-cols-[11rem_1fr]"
					>
						<div className="flex flex-col gap-0.5">
							<span className="font-semibold">{item.label}</span>
							<span className="text-sm text-muted-foreground">
								Rendite:{" "}
								<span
									className={cn(
										/\d/.test(item.rendite) && "number tabular-nums"
									)}
								>
									{item.rendite}
								</span>
							</span>
						</div>
						<div className="flex flex-col gap-1.5">
							<span className="flex items-center gap-2 text-sm">
								<RiskMeter level={item.risk} />
								<span className="text-muted-foreground">
									Risiko {riskLabel[item.risk]}
								</span>
							</span>
							<p className="text-sm text-muted-foreground leading-relaxed text-pretty">
								{item.desc}
							</p>
						</div>
					</li>
				))}
			</ul>

			<Callout title="Wichtig">
				Wer kurzfristig auf sein Geld angewiesen ist, kann sich starke
				Schwankungen nicht leisten. Wer aber einen langen Anlagehorizont hat -
				z. B. 30 Jahre bis zur Rente - kann Kursschwankungen aussitzen.
				Historisch haben sich Aktienmärkte nach jedem Einbruch erholt und sind
				langfristig gestiegen.
			</Callout>
		</SlideLayout>
	)
}
