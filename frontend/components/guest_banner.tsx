import Link from "next/link"

/**
 * Shown to anonymous guests above the page content: a card in the content
 * column (left of it the floating sidebar toggle on desktop).
 */
export function GuestBanner() {
	return (
		<div className="mx-4 mt-2 shrink-0 rounded-xl border bg-card px-4 py-2 text-center text-xs text-muted-foreground md:ml-12 md:mr-12 md:text-sm">
			Du testest als Gast. Erstelle ein Konto, damit dein Depot erhalten bleibt
			– inaktive Gast-Zugänge werden nach 30 Tagen gelöscht.{" "}
			<Link
				href="/signup"
				className="font-medium text-foreground underline underline-offset-2"
			>
				Konto erstellen
			</Link>
		</div>
	)
}
