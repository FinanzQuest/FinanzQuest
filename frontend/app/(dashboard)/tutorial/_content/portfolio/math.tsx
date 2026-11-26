"use client"

import katex from "katex"
import "katex/dist/katex.min.css"
import { useMemo } from "react"
import { cn } from "@/lib/utils"

interface TexProps {
	children: string
	/** centered display formula; scrolls horizontally when wider than the card */
	block?: boolean
	className?: string
}

/** Tiny KaTeX wrapper: `<Tex>{"\\sigma^2"}</Tex>` inline, `<Tex block>` for display. */
export function Tex({ children, block, className }: TexProps) {
	const html = useMemo(
		() =>
			katex.renderToString(children, {
				displayMode: !!block,
				throwOnError: false,
				output: "html",
			}),
		[children, block]
	)
	if (block) {
		return (
			<span
				className={cn(
					"my-2 block max-w-full overflow-x-auto overflow-y-hidden py-1 text-[0.95em]",
					className
				)}
				// biome-ignore lint/security/noDangerouslySetInnerHtml: KaTeX output of static lesson content
				dangerouslySetInnerHTML={{ __html: html }}
			/>
		)
	}
	return (
		<span
			className={className}
			// biome-ignore lint/security/noDangerouslySetInnerHtml: KaTeX output of static lesson content
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	)
}

/** Raw template tag so LaTeX backslashes need no escaping: tex`\sigma_p`. */
export const tex = String.raw
