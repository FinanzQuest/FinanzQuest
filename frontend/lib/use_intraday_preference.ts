"use client"

import { useCallback, useSyncExternalStore } from "react"

const cookieName = "intradayPrices"
const maxAgeSeconds = 365 * 24 * 3600
const changeEvent = "intraday-preference-change"

function readCookie(): "1" | "0" | "unset" {
	const value = document.cookie
		.split("; ")
		.find(entry => entry.startsWith(`${cookieName}=`))
		?.split("=")[1]
	return value === "1" || value === "0" ? value : "unset"
}

function subscribe(onChange: () => void) {
	// same tab: our own event; other tabs share the cookie but not the event
	window.addEventListener(changeEvent, onChange)
	return () => window.removeEventListener(changeEvent, onChange)
}

/**
 * Whether charts show intraday (15-minute) prices where available. One
 * setting for the depot and the stock charts, kept in a cookie (cross-page
 * state); every chart using the hook updates together. Defaults to on.
 * `loaded` is false during server rendering and hydration — load intraday
 * data only once it is true, so a stored "off" never triggers a fetch.
 */
export function useIntradayPreference(): {
	enabled: boolean
	loaded: boolean
	setEnabled: (value: boolean) => void
} {
	const stored = useSyncExternalStore(subscribe, readCookie, () => null)

	const setEnabled = useCallback((value: boolean) => {
		// biome-ignore lint/suspicious/noDocumentCookie: plain preference cookie, no Cookie Store API needed
		document.cookie = `${cookieName}=${value ? "1" : "0"}; path=/; max-age=${maxAgeSeconds}; samesite=lax`
		window.dispatchEvent(new Event(changeEvent))
	}, [])

	return {
		enabled: stored !== "0",
		loaded: stored !== null,
		setEnabled,
	}
}
