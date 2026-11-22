import { StatusPage } from "@/components/status_page"

export default function NotFound() {
	return (
		<StatusPage
			code="404"
			title="Seite nicht gefunden"
			message="Diese Seite gibt es nicht (mehr). Vielleicht hilft dir die Startseite weiter."
		/>
	)
}
