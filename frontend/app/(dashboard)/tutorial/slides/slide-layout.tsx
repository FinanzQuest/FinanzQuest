import { Info, Lightbulb } from "lucide-react"
import type { ReactNode } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

/* Building blocks of the tutorial slides. They follow the look of the other
 * dashboard pages: neutral surfaces, muted labels, mono numbers, and color
 * only for meaning (win / loss / chart series). */

export function SlideLayout({
	children,
	className,
}: {
	children: ReactNode
	className?: string
}) {
	return (
		<div
			className={cn(
				"w-full max-w-3xl mx-auto py-6 flex flex-col gap-10 *:shrink-0",
				className
			)}
		>
			{children}
		</div>
	)
}

export function SlideHeader({
	eyebrow,
	title,
	subtitle,
}: {
	eyebrow?: string
	title: string
	subtitle?: string
}) {
	return (
		<header className="flex flex-col gap-2">
			{eyebrow && (
				<span className="text-sm text-muted-foreground">{eyebrow}</span>
			)}
			<h1 className="text-2xl md:text-3xl font-bold tracking-tight text-balance">
				{title}
			</h1>
			{subtitle && (
				<p className="text-base text-muted-foreground text-pretty">
					{subtitle}
				</p>
			)}
		</header>
	)
}

export function SlideSection({
	title,
	children,
	className,
}: {
	title?: string
	children: ReactNode
	className?: string
}) {
	return (
		<section className={cn("flex flex-col gap-4", className)}>
			{title && (
				<h2 className="text-lg font-semibold tracking-tight">{title}</h2>
			)}
			{children}
		</section>
	)
}

/** Body copy of a slide. */
export function Text({ children }: { children: ReactNode }) {
	return (
		<p className="text-muted-foreground leading-relaxed text-pretty">
			{children}
		</p>
	)
}

/** A key term inside `Text`. */
export function Em({ children }: { children: ReactNode }) {
	return <span className="font-medium text-foreground">{children}</span>
}

const calloutIcon = {
	note: Info,
	takeaway: Lightbulb,
}

/** An example, a note, or the takeaway of a slide. */
export function Callout({
	title,
	variant = "note",
	children,
}: {
	title?: string
	variant?: keyof typeof calloutIcon
	children: ReactNode
}) {
	const Icon = calloutIcon[variant]
	const heading = title ?? (variant === "takeaway" ? "Merke" : undefined)
	return (
		<Alert className={cn(variant === "takeaway" && "bg-muted/50")}>
			<Icon />
			{heading && <AlertTitle>{heading}</AlertTitle>}
			<AlertDescription className="leading-relaxed text-pretty md:text-pretty">
				{children}
			</AlertDescription>
		</Alert>
	)
}

export function DataTable({
	headers,
	rows,
}: {
	headers: string[]
	rows: ReactNode[][]
}) {
	return (
		<div className="rounded-xl border overflow-hidden">
			<Table>
				<TableHeader>
					<TableRow className="hover:bg-transparent">
						{headers.map(h => (
							<TableHead
								key={h}
								className="text-xs uppercase tracking-wide text-muted-foreground"
							>
								{h}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{rows.map((row, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: list is static and will not change
						<TableRow key={i}>
							{row.map((cell, j) => (
								<TableCell
									// biome-ignore lint/suspicious/noArrayIndexKey: list is static and will not change
									key={j}
									className={cn(
										"whitespace-normal align-top",
										j === 0 && "font-medium"
									)}
								>
									{cell}
								</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	)
}

const toneClass = {
	default: "text-foreground",
	muted: "text-muted-foreground",
	win: "text-win",
	loss: "text-loss",
}

export type Tone = keyof typeof toneClass

/** Label + value, styled like the stats on the depot page. */
export function Stat({
	label,
	value,
	hint,
	tone = "default",
	size = "default",
}: {
	label: ReactNode
	value: ReactNode
	hint?: ReactNode
	tone?: Tone
	size?: "default" | "lg"
}) {
	return (
		<div className="flex flex-col gap-1 min-w-0">
			<span className="text-sm uppercase tracking-wide text-muted-foreground">
				{label}
			</span>
			<span
				className={cn(
					"number tabular-nums",
					size === "lg"
						? "text-[clamp(1.75rem,4vw,2.5rem)] leading-none font-extrabold tracking-tight"
						: "text-xl font-semibold",
					toneClass[tone]
				)}
			>
				{value}
			</span>
			{hint && <span className="text-xs text-muted-foreground">{hint}</span>}
		</div>
	)
}

export function StatRow({
	children,
	className,
}: {
	children: ReactNode
	className?: string
}) {
	return (
		<div className={cn("flex flex-row flex-wrap gap-x-10 gap-y-4", className)}>
			{children}
		</div>
	)
}

/** Interactive element of a slide (chart, simulator, quiz). Drags inside
 * it do not swipe the carousel. */
export function Figure({
	title,
	description,
	action,
	children,
	className,
}: {
	title?: ReactNode
	description?: ReactNode
	action?: ReactNode
	children: ReactNode
	className?: string
}) {
	return (
		<Card data-no-swipe className={className}>
			{(title || description || action) && (
				<CardHeader>
					{title && <CardTitle>{title}</CardTitle>}
					{description && <CardDescription>{description}</CardDescription>}
					{action && <CardAction>{action}</CardAction>}
				</CardHeader>
			)}
			<CardContent className="flex flex-col gap-6">{children}</CardContent>
		</Card>
	)
}

/** base-ui Slider reports a number, or an array for range sliders */
const sliderValue = (value: number | readonly number[]) =>
	typeof value === "number" ? value : value[0]

export function SliderField({
	label,
	display,
	value,
	onChange,
	min,
	max,
	step,
}: {
	label: string
	display: ReactNode
	value: number
	onChange: (value: number) => void
	min: number
	max: number
	step: number
}) {
	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-baseline justify-between gap-2 text-sm">
				<span className="text-muted-foreground">{label}</span>
				<span className="number tabular-nums font-medium">{display}</span>
			</div>
			<Slider
				aria-label={label}
				min={min}
				max={max}
				step={step}
				value={[value]}
				onValueChange={v => onChange(sliderValue(v))}
			/>
		</div>
	)
}

export function SliderGrid({ children }: { children: ReactNode }) {
	return (
		<div className="grid gap-x-8 gap-y-5 sm:grid-cols-2 md:grid-cols-3">
			{children}
		</div>
	)
}
