const PRINCIPLES = [
	{
		number: "01",
		title: "Frühzeitig beginnen",
		desc: "Zeit ist der entscheidende Faktor: Der Zinseszinseffekt braucht Jahrzehnte, um seine volle Wirkung zu entfalten.",
	},
	{
		number: "02",
		title: "Regelmäßig investieren",
		desc: "Ein Sparplan macht Vermögensaufbau alltagstauglich und nutzt den Cost-Average-Effekt.",
	},
	{
		number: "03",
		title: "Breit diversifizieren",
		desc: "ETFs streuen das Risiko automatisch über hunderte oder tausende Unternehmen.",
	},
	{
		number: "04",
		title: "Kosten niedrig halten",
		desc: "Eine hohe TER frisst über Jahrzehnte einen erheblichen Teil der Rendite auf.",
	},
	{
		number: "05",
		title: "Langfristig denken",
		desc: "Kursschwankungen gehören dazu - wer nicht voreilig verkauft, profitiert langfristig.",
	},
]

export function Prinzipien({ from, to }: { from: number; to: number }) {
	return (
		<div className="flex flex-col gap-2">
			{PRINCIPLES.slice(from, to).map(p => (
				<div
					key={p.number}
					className="flex items-start gap-4 rounded-xl border bg-muted/40 p-4"
				>
					<span className="w-8 shrink-0 font-mono text-lg font-bold text-emerald-500">
						{p.number}
					</span>
					<div>
						<span className="text-sm font-semibold text-foreground">
							{p.title}
						</span>
						<p className="mt-0.5 text-xs leading-relaxed text-foreground/60">
							{p.desc}
						</p>
					</div>
				</div>
			))}
		</div>
	)
}
