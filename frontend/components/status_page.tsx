import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import logo_full from "@/public/logo_full.svg"

/** Full-screen message with a way back (error and 404 pages). */
export function StatusPage({
	title,
	message,
	code,
}: {
	title: string
	message: string
	code?: string
}) {
	return (
		<main className="h-svh overflow-y-auto flex flex-col items-center justify-center gap-6 px-4 text-center">
			<Image src={logo_full} alt="FinanzQuest" height={40} />
			{code && (
				<span className="text-6xl font-extrabold tracking-tight number text-muted-foreground">
					{code}
				</span>
			)}
			<div className="flex flex-col gap-2 max-w-md">
				<h1 className="text-2xl font-bold tracking-tight">{title}</h1>
				<p className="text-muted-foreground">{message}</p>
			</div>
			<Button nativeButton={false} render={<Link href="/" />}>
				Zur Startseite
			</Button>
		</main>
	)
}
