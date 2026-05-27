import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface SlideLayoutProps {
	children: ReactNode
	className?: string
}

export function SlideLayout({ children, className }: SlideLayoutProps) {
	return (
		<div
			className={cn(
				"min-h-full w-full max-w-4xl mx-auto px-8 py-12 flex flex-col gap-8",
				className
			)}
		>
			{children}
		</div>
	)
}

interface SlideHeaderProps {
	eyebrow?: string
	title: string
	subtitle?: string
}

export function SlideHeader({ eyebrow, title, subtitle }: SlideHeaderProps) {
	return (
		<div className="flex flex-col gap-2">
			{eyebrow && (
				<span className="text-emerald-500 text-xs font-semibold uppercase tracking-widest">
					{eyebrow}
				</span>
			)}
			<h1 className="text-3xl font-bold text-foreground leading-tight">
				{title}
			</h1>
			{subtitle && (
				<p className="text-foreground/70 text-base leading-relaxed">
					{subtitle}
				</p>
			)}
		</div>
	)
}

interface SlideSectionProps {
	children: ReactNode
	className?: string
}

export function SlideSection({ children, className }: SlideSectionProps) {
	return <div className={cn("flex flex-col gap-4", className)}>{children}</div>
}

interface InfoCardProps {
	children: ReactNode
	accent?: boolean
}

export function InfoCard({ children, accent }: InfoCardProps) {
	return (
		<div
			className={cn(
				"rounded-xl border p-5 text-sm leading-relaxed",
				accent
					? " dark:border-emerald-500/30 dark:bg-emerald-500/5 dark:text-emerald-200 bg-emerald-500/20 border-emerald-500/50 text-emerald-700"
					: "border border-border bg-card text-foreground/75"
			)}
		>
			{children}
		</div>
	)
}

interface DataTableProps {
	headers: string[]
	rows: (string | ReactNode)[][]
}

export function DataTable({ headers, rows }: DataTableProps) {
	return (
		<div className="rounded-xl border border-border overflow-hidden">
			<table className="w-full text-sm">
				<thead>
					<tr className="border-b border-border bg-card">
						{headers.map(h => (
							<th
								key={h}
								className="text-left px-4 py-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider"
							>
								{h}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((row, i) => (
						<tr
							// biome-ignore lint/suspicious/noArrayIndexKey: list is static and will not change
							key={i}
							className={cn(
								"border-b border-border last:border-0",
								i % 2 === 0 ? "bg-muted/50" : "bg-card"
							)}
						>
							{row.map((cell, j) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: list is static and will not change
								<td key={j} className="px-4 py-3 text-foreground/75">
									{cell}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}
export function NoSwipe({ children }: { children: React.ReactNode }) {
	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: needed to prevent carousel swipe
		<div
			role="presentation"
			onMouseDown={e => e.stopPropagation()}
			onTouchStart={e => e.stopPropagation()}
		>
			{children}
		</div>
	)
}
