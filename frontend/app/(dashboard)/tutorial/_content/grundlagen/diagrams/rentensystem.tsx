export function Rentensystem() {
	return (
		<div className="grid grid-cols-2 gap-3">
			<div className="flex flex-col gap-1 rounded-xl border bg-muted/40 p-4">
				<span className="text-3xl font-bold text-emerald-500">6 : 1</span>
				<span className="text-sm text-foreground/70">
					Arbeitnehmer pro Rentner
				</span>
				<span className="text-xs text-muted-foreground/70">früher</span>
			</div>
			<div className="flex flex-col gap-1 rounded-xl border bg-muted/40 p-4">
				<span className="text-3xl font-bold text-rose-500">2 : 1</span>
				<span className="text-sm text-foreground/70">
					Arbeitnehmer pro Rentner
				</span>
				<span className="text-xs text-muted-foreground/70">heute</span>
			</div>
		</div>
	)
}
