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

import logo_full from "@/public/logo_full.svg"

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<div className={cn()}>
			<div className="w-[calc(100%)]  pt-8 pb-8 px-2 flex flex-row items-center justify-center">
				<Image src={logo_full} alt="" height={48} />
			</div>
			<div className="absolute right-1/2 bottom-1/2 translate-x-1/2 translate-y-1/2">
				{children}
			</div>
			<Toaster />
		</div>
	)
}
