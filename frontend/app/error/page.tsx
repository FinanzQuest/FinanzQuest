import { StatusPage } from "@/components/status_page"

export default function ErrorPage() {
	return (
		<StatusPage
			title="Da ist etwas schiefgelaufen"
			message="Bitte versuche es noch einmal. Wenn der Fehler bleibt, melde dich bei deiner Lehrkraft."
		/>
	)
}
