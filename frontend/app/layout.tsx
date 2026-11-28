import { Geist_Mono as FontMono, Inter, Space_Grotesk } from "next/font/google"

import "./globals.css"
import type { Metadata } from "next"
import type React from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const spaceGroteskHeading = Space_Grotesk({
	subsets: ["latin"],
	variable: "--font-heading",
})

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = FontMono({
	subsets: ["latin"],
	variable: "--font-mono",
})

export const metadata: Metadata = {
	icons: {
		icon: { url: "/logo_favicon.svg", type: "image/svg+xml" },
	},
}

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
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1.0, viewport-fit=cover"
				/>
			</head>
			<body className="h-full max-h-screen overflow-hidden dark">
				{/*<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>*/}
				<TooltipProvider>{children}</TooltipProvider>
				{/*</ThemeProvider>*/}
			</body>
		</html>
	)
}
