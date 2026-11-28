import Link from "next/link"

/** Shown to anonymous guests above the page content. */
export function GuestBanner() {
	return (
		<div className="shrink-0 border-b bg-muted px-4 py-2 text-sm text-center">
			Du testest als Gast. Erstelle ein Konto, damit dein Depot erhalten bleibt
			– inaktive Gast-Zugänge werden nach 30 Tagen gelöscht.{" "}
			<Link href="/signup" className="font-medium underline underline-offset-2">
				Konto erstellen
			</Link>
		</div>
	)
}
