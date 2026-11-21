// components/ui/scroll-area-lite.tsx
import { cn } from "@/lib/utils"

export function ScrollAreaLite({
	className,
	children,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				"overflow-y-auto",
				// thin native scrollbar, styled to match shadcn
				"[scrollbar-width:thin] [scrollbar-color:var(--border)_transparent]",
				// webkit
				"[&::-webkit-scrollbar]:w-2",
				"[&::-webkit-scrollbar-track]:bg-transparent",
				"[&::-webkit-scrollbar-thumb]:bg-border",
				"[&::-webkit-scrollbar-thumb]:rounded-full",
				className
			)}
			{...props}
		>
			{children}
		</div>
	)
}
