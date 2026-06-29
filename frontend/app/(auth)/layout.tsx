import "@/app/globals.css"

import type { Metadata } from "next"
import Image from "next/image"
import type React from "react"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
export const metadata: Metadata = {
	title: "FinanzQuest",
	description: "FinanzQuest",
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<div
			className={cn(
				"h-dvh bg-background font-sans antialiased flex flex-col overflow-hidden w-full bg-gradient-to-bl from-win/8 via-background to-background"
			)}
		>
			<div className="absolute w-[calc(100%-4rem)] left-1/2 -translate-x-1/2 pt-8 pb-8 px-2 flex flex-row items-center gap-4 justify-center flex-wrap overflow-hidden border-b">
				<Image
					src="/logo_unrounded.svg"
					alt=""
					width={48}
					height={48}
					className="border rounded-md shadow-md shrink-0 leading-none"
				/>
				<div className="h-min text-2xl font-semibold tracking-wide overflow-x-hidden">
					Finanzquest
				</div>
			</div>
			{children}
			<Toaster />
		</div>
	)
}
