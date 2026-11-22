import "../container.css"

import type React from "react"
import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { ChartSkeleton } from "../../skeletons"

interface TabConfig {
	name: string
	icon: React.ReactNode
	key?: string
	content: React.ReactNode
}

interface ChartContainerProps extends React.ComponentPropsWithoutRef<"div"> {
	defaultTab?: string
	tabs: TabConfig[]
	toolbar?: React.ReactNode[]
	/** below the toolbar, e.g. a legend */
	footer?: React.ReactNode
}

export default function ChartContainer({
	defaultTab: defaultName,
	tabs,
	className,
	toolbar,
	footer,
}: ChartContainerProps) {
	const tabsContent: React.ReactNode[] = tabs.map(tab => (
		<TabsContent className="" key={tab.key ?? tab.name} value={tab.name}>
			{tab.content}
		</TabsContent>
	))

	const tabsTrigger = tabs.map(tab => (
		<TabsTrigger
			className="box-content h-full w-full py-1 px-2"
			key={tab.key ?? tab.name}
			value={tab.name}
		>
			{tab.icon}
		</TabsTrigger>
	))

	return (
		<Suspense fallback={<ChartSkeleton />}>
			<Tabs defaultValue={defaultName} className={cn(className)}>
				{tabsContent}
				{/* one pill on wide screens; wraps into a rounded box on phones */}
				<div className="w-full bg-muted/50 px-2 border py-2 rounded-3xl md:rounded-full flex flex-row flex-wrap items-center gap-x-2 gap-y-1">
					<TabsList className={"py-2"}>{tabsTrigger}</TabsList>
					<div className="grow min-w-0 justify-end flex flex-row flex-wrap items-center gap-1">
						{toolbar}
						{/* <IntervalControls className="grow justify-end p-2" intervals={Intervals} /> */}
					</div>
				</div>
				{footer}
			</Tabs>
		</Suspense>
	)
}
