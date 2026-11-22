"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

/**
 * Re-renders the current route's server components every `intervalMs` while
 * the tab is visible, so intraday prices stay current. Refreshes right away
 * when the tab becomes visible again after the interval has passed.
 */
export function AutoRefresh({ intervalMs = 60_000 }: { intervalMs?: number }) {
	const router = useRouter()

	useEffect(() => {
		let last = Date.now()
		const refresh = () => {
			if (document.visibilityState !== "visible") return
			last = Date.now()
			router.refresh()
		}
		const onVisibilityChange = () => {
			if (Date.now() - last >= intervalMs) refresh()
		}

		const timer = setInterval(refresh, intervalMs)
		document.addEventListener("visibilitychange", onVisibilityChange)
		return () => {
			clearInterval(timer)
			document.removeEventListener("visibilitychange", onVisibilityChange)
		}
	}, [router, intervalMs])

	return null
}
