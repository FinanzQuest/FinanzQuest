"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client"
import { startGuestRedirect } from "../actions"

export default function Page() {
	const router = useRouter()
	const [error, setError] = useState<string | null>(null)
	// React strict mode runs effects twice: only one guest sign-up
	const started = useRef(false)

	const start = useCallback(async () => {
		// browser-side: the sign-up passes Caddy with the client IP
		const client = createClient()
		const { data } = await client.auth.getUser()
		if (data.user && !data.user.is_anonymous) {
			router.replace("/")
			return
		}
		if (!data.user) {
			const { error } = await client.auth.signInAnonymously()
			if (error) {
				setError(error.message)
				return
			}
		}
		const res = await startGuestRedirect()
		if (res?.message) setError(res.message)
	}, [router])

	const run = useCallback(() => {
		start().catch(e => setError(e instanceof Error ? e.message : String(e)))
	}, [start])

	useEffect(() => {
		if (started.current) return
		started.current = true
		run()
	}, [run])

	async function retry() {
		setError(null)
		// drop a depot-less guest session so the retry starts clean
		const client = createClient()
		const { data } = await client.auth.getUser()
		if (data.user?.is_anonymous) await client.auth.signOut()
		run()
	}

	return (
		<main className="w-full flex justify-center">
			<Card className="w-full max-w-md shadow-2xl">
				<CardHeader className="text-center">
					<CardTitle>
						{error ? "Gast-Zugang nicht möglich" : "Gast-Zugang wird erstellt…"}
					</CardTitle>
					<CardDescription>
						{error ?? "Einen Moment, wir richten dein Test-Depot ein."}
					</CardDescription>
				</CardHeader>
				{error && (
					<CardContent className="flex flex-col gap-2">
						<Button onClick={retry}>Erneut versuchen</Button>
						<Button
							variant="outline"
							nativeButton={false}
							render={<Link href="/signup" />}
						>
							Konto erstellen
						</Button>
					</CardContent>
				)}
			</Card>
		</main>
	)
}
