"use client"

import { Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
	BENCHMARKS,
	MOVING_AVERAGES,
	OVERLAY_COLOR,
	type OverlayKey,
} from "@/lib/data/overlays"
import { cn } from "@/lib/utils"

interface Props {
	value: OverlayKey[]
	onValueChange: (value: OverlayKey[]) => void
	/** benchmarks need daily prices: off in intraday views */
	benchmarksAvailable: boolean
	loading?: boolean
}

function Swatch({ overlay }: { overlay: OverlayKey }) {
	return (
		<span
			aria-hidden
			className="h-0.5 w-4 rounded-full shrink-0"
			style={{ background: OVERLAY_COLOR[overlay] }}
		/>
	)
}

/** Toolbar menu: moving averages and market benchmarks over the chart. */
export function OverlayPicker({
	value,
	onValueChange,
	benchmarksAvailable,
	loading,
}: Props) {
	const toggle = (key: OverlayKey, on: boolean) =>
		onValueChange(on ? [...value, key] : value.filter(k => k !== key))

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button
						variant="ghost"
						size="sm"
						className={cn("gap-1.5 rounded-full", loading && "animate-pulse")}
					>
						<Layers className="size-4" />
						<span className="hidden sm:inline">Vergleich</span>
						{value.length > 0 && (
							<span className="tabular-nums text-xs rounded-full bg-primary text-primary-foreground px-1.5">
								{value.length}
							</span>
						)}
					</Button>
				}
			/>
			<DropdownMenuContent align="end" className="w-64">
				<DropdownMenuGroup>
					<DropdownMenuLabel>Gleitende Durchschnitte</DropdownMenuLabel>
					{MOVING_AVERAGES.map(m => (
						<DropdownMenuCheckboxItem
							key={m.key}
							checked={value.includes(m.key)}
							onCheckedChange={on => toggle(m.key, on)}
						>
							<Swatch overlay={m.key} />
							{m.label}
						</DropdownMenuCheckboxItem>
					))}
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuLabel>
						Mit dem Markt vergleichen
						{!benchmarksAvailable && (
							<span className="block text-xs font-normal text-muted-foreground">
								Ab 7 Tagen verfügbar (nicht für 1T und 5T)
							</span>
						)}
					</DropdownMenuLabel>
					{BENCHMARKS.map(b => (
						<DropdownMenuCheckboxItem
							key={b.key}
							disabled={!benchmarksAvailable}
							checked={value.includes(b.key)}
							onCheckedChange={on => toggle(b.key, on)}
						>
							<Swatch overlay={b.key} />
							{b.label}
						</DropdownMenuCheckboxItem>
					))}
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

/** Legend below the chart for the active overlays. */
export function OverlayLegend({ value }: { value: OverlayKey[] }) {
	if (value.length === 0) return null
	const label = (key: OverlayKey) =>
		MOVING_AVERAGES.find(m => m.key === key)?.label ??
		BENCHMARKS.find(b => b.key === key)?.label
	return (
		<ul className="flex flex-row flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground px-2">
			{value.map(key => (
				<li key={key} className="flex flex-row items-center gap-1.5">
					<Swatch overlay={key} />
					{label(key)}
				</li>
			))}
		</ul>
	)
}
