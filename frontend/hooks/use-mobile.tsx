import * as React from "react"

const MOBILE_BREAKPOINT = 768
const query = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

function subscribe(onChange: () => void) {
	const mql = window.matchMedia(query)
	mql.addEventListener("change", onChange)
	return () => mql.removeEventListener("change", onChange)
}

/** Viewport below the md breakpoint; false during server rendering. */
export function useIsMobile() {
	return React.useSyncExternalStore(
		subscribe,
		() => window.matchMedia(query).matches,
		() => false
	)
}
