import "../container.css"

import type React from "react"
import { Suspense } from "react"
import Tooltip from "@/components/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import PageLoader from "../../loaders/page_loader"

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
}

export default function ChartContainer({
	defaultTab: defaultName,
	tabs,
	className,
	toolbar,
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
		<Suspense fallback={<PageLoader />}>
			<Tabs defaultValue={defaultName} className={cn(className)}>
				{tabsContent}
				<div className="w-full bg-muted/50 px-2 border py-2 rounded-full flex flex-row items-center">
					<TabsList className={"py-2"}>{tabsTrigger}</TabsList>
					<div className="grow justify-end flex flex-row items-center ">
						{toolbar}
						{/* <IntervalControls className="grow justify-end p-2" intervals={Intervals} /> */}
					</div>
				</div>
			</Tabs>
		</Suspense>
	)
}
