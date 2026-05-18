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
			<h1 className="text-3xl font-bold text-zinc-50 leading-tight">{title}</h1>
			{subtitle && (
				<p className="text-zinc-400 text-base leading-relaxed">{subtitle}</p>
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
					? "border-emerald-500/30 bg-emerald-500/5 text-emerald-200"
					: "border-zinc-800 bg-zinc-900 text-zinc-300"
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
		<div className="rounded-xl border border-zinc-800 overflow-hidden">
			<table className="w-full text-sm">
				<thead>
					<tr className="border-b border-zinc-800 bg-zinc-900">
						{headers.map(h => (
							<th
								key={h}
								className="text-left px-4 py-3 text-zinc-400 font-semibold text-xs uppercase tracking-wider"
							>
								{h}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((row, i) => (
						<tr
							// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
							key={i}
							className={cn(
								"border-b border-zinc-800/60 last:border-0",
								i % 2 === 0 ? "bg-zinc-950" : "bg-zinc-900/40"
							)}
						>
							{row.map((cell, j) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
								<td key={j} className="px-4 py-3 text-zinc-300">
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
