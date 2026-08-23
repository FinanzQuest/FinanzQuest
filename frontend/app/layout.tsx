import {
	Geist,
	Geist_Mono as FontMono,
	Space_Grotesk, Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "next-themes"
import type React from "react"
import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"

const spaceGroteskHeading = Space_Grotesk({subsets:['latin'],variable:'--font-heading'})

const inter = Inter({subsets:['latin'],variable:'--font-sans'})

const fontMono = FontMono({
	subsets: ["latin"],
	variable: "--font-mono",
})

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html
			lang="en"
			className={cn(
				fontMono.variable,
				"font-sans",
				inter.variable,
				spaceGroteskHeading.variable
			)}
			suppressHydrationWarning
		>
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			</head>
			<body className="h-full max-h-screen overflow-hidden dark">
				{/*<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>*/}
				<TooltipProvider>
					{children}
				</TooltipProvider>
				{/*</ThemeProvider>*/}
			</body>
		</html>
	)
}
