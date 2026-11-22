import "@/app/globals.css"

import type { Metadata } from "next"
import Image from "next/image"
import type React from "react"
import { Toaster } from "@/components/ui/sonner"
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
		// scrolls on its own (the body does not): small screens and long forms
		<div className="h-svh overflow-y-auto flex flex-col">
			<div className="pt-8 pb-6 px-4 flex flex-row items-center justify-center shrink-0">
				<Image src={logo_full} alt="FinanzQuest" height={48} />
			</div>
			<div className="flex-1 flex flex-col items-center justify-center px-4 pb-16">
				{children}
			</div>
			<Toaster />
		</div>
	)
}
