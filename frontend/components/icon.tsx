import Image from "next/image"
import { cn } from "@/lib/utils"

/**
 * Asset logo. Without a logo URL (ETFs, unknown assets) a placeholder of the
 * same size with the first letters of `fallback` (the symbol) takes its
 * place, so rows and headers keep their layout.
 */
export default function URLIcon({
	iconURL,
	size,
	className,
	fallback,
}: {
	iconURL?: string | null
	size: number
	className?: string
	/** text for the placeholder, e.g. the symbol */
	fallback?: string | null
}) {
	if (!iconURL) {
		const letters = (fallback ?? "")
			.replace(/[^A-Za-z0-9]/g, "")
			.slice(0, 3)
			.toUpperCase()
		return (
			<span
				aria-hidden
				className={cn(
					"inline-grid place-items-center bg-muted text-muted-foreground font-semibold text-[0.6rem] leading-none select-none",
					className
				)}
			>
				{letters}
			</span>
		)
	}
	return (
		<Image
			loading="lazy"
			className={className}
			width={size}
			height={size}
			priority={false}
			src={iconURL}
			alt=""
		/>
	)
}
