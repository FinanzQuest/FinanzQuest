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
	3: "mittel-hoch",
	4: "hoch",
	5: "sehr hoch",
}

export function RisikoSkala() {
	return (
		<div className="flex flex-col gap-3">
			{riskItems.map(item => (
				<div
					key={item.label}
					className="flex flex-col gap-2 rounded-xl border bg-muted/40 p-4"
				>
					<div className="flex flex-wrap items-baseline justify-between gap-x-3">
						<span className="text-sm font-semibold text-foreground">
							{item.label}
						</span>
						<span className="text-xs text-foreground/60">
							Rendite: {item.rendite}
						</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
							<div
								className={`h-full rounded-full transition-all ${riskColor[item.risk]}`}
								style={{ width: `${item.risk * 20}%` }}
							/>
						</div>
						<span className="w-20 text-right text-xs text-muted-foreground">
							{riskLabel[item.risk]}
						</span>
					</div>
					<p className="text-xs text-foreground/60">{item.desc}</p>
				</div>
			))}
		</div>
	)
}
