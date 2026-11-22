import { useId } from "react"
import { cn } from "@/lib/utils"

/**
 * Small area chart without axes (plain SVG, renders on the server too), in
 * the style of the price chart: a line with a gradient fill fading out
 * towards the bottom. Green when the last value is above the first, red
 * when below.
 */
export function Sparkline({
	values,
	className,
	label,
}: {
	values: number[] | null | undefined
	className?: string
	/** accessible description, e.g. "3 Monate: +4 %" */
	label?: string
}) {
	const gradientId = useId()
	const points = (values ?? []).filter(v => Number.isFinite(v))
	if (points.length < 2) {
		return <div className={cn("h-8 w-24", className)} aria-hidden />
	}
	const width = 96
	const height = 32
	const min = Math.min(...points)
	const max = Math.max(...points)
	const span = max - min || 1
	const step = width / (points.length - 1)
	const coords = points.map(
		(v, i) =>
			[
				(i * step).toFixed(1),
				(height - 2 - ((v - min) / span) * (height - 4)).toFixed(1),
			] as const
	)
	const line = coords
		.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`)
		.join("")
	const area = `${line}L${width},${height}L0,${height}Z`
	const up = points[points.length - 1] >= points[0]
	return (
		<svg
			viewBox={`0 0 ${width} ${height}`}
			preserveAspectRatio="none"
			role={label ? "img" : undefined}
			aria-label={label}
			aria-hidden={label ? undefined : true}
			className={cn(
				"h-8 w-24 overflow-visible",
				up ? "text-win" : "text-loss",
				className
			)}
		>
			<defs>
				<linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor="currentColor" stopOpacity={0.35} />
					<stop offset="100%" stopColor="currentColor" stopOpacity={0} />
				</linearGradient>
			</defs>
			<path d={area} fill={`url(#${gradientId})`} stroke="none" />
			<path
				d={line}
				fill="none"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinejoin="round"
				strokeLinecap="round"
				vectorEffect="non-scaling-stroke"
			/>
		</svg>
	)
}
