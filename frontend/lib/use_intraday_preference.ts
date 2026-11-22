"use client"

import { useCallback, useEffect, useState } from "react"

const cookieName = "intradayPrices"
const maxAgeSeconds = 365 * 24 * 3600

/**
 * Whether charts show intraday (15-minute) prices where available. One
 * setting for the depot and the stock charts, kept in a cookie (cross-page
 * state). Defaults to on; read after mount so server and client render the
 * same markup. `loaded` turns true once the cookie was read — load intraday
 * data only then, so a stored "off" never triggers a fetch.
 */
export function useIntradayPreference(): {
	enabled: boolean
	loaded: boolean
	setEnabled: (value: boolean) => void
} {
	const [enabled, setEnabledState] = useState(true)
	const [loaded, setLoaded] = useState(false)

	useEffect(() => {
		const stored = document.cookie
			.split("; ")
			.find(entry => entry.startsWith(`${cookieName}=`))
			?.split("=")[1]
		if (stored !== undefined) setEnabledState(stored === "1")
		setLoaded(true)
	}, [])

	const setEnabled = useCallback((value: boolean) => {
		setEnabledState(value)
		// biome-ignore lint/suspicious/noDocumentCookie: plain preference cookie, no Cookie Store API needed
		document.cookie = `${cookieName}=${value ? "1" : "0"}; path=/; max-age=${maxAgeSeconds}; samesite=lax`
	}, [])

	return { enabled, loaded, setEnabled }
}
