import type React from "react"
import {
	Tooltip as TooltipComponent,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip"

interface IconT extends React.ComponentPropsWithoutRef<"div"> {
	name: string
}

export default function Tooltip({ name, children, className }: IconT) {
	return (
		<TooltipProvider>
			<TooltipComponent>
				<TooltipTrigger
					className={className}
					render={<div>{children}</div>}
				></TooltipTrigger>
				<TooltipContent>
					<p>{name}</p>
				</TooltipContent>
			</TooltipComponent>
		</TooltipProvider>
	)
}
