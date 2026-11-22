"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"

/**
 * Asset logo. Without a logo URL (ETFs, unknown assets), or when the logo
 * does not load (the logo service has none for many exchange listings), a
 * placeholder of the same size with the first letters of `fallback` (the
 * symbol) takes its place, so rows and headers keep their layout.
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
	const [failed, setFailed] = useState<string | null>(null)
	if (!iconURL || failed === iconURL) {
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
			// the logo service already serves webp at the requested size; loading
			// it directly also keeps missing logos out of the server log
			unoptimized
			onError={() => setFailed(iconURL)}
		/>
	)
}
