import { Suspense } from "react"
import { Card } from "@/components/ui/card"
import { getUser } from "@/lib/auth"

import SignUpForm from "./form"

async function Content() {
	const { user } = await getUser()
	const upgrade = user?.is_anonymous === true

	return (
		<SignUpForm
			mode={upgrade ? "upgrade" : "signup"}
			title={
				upgrade
					? "Konto erstellen – dein Depot bleibt erhalten"
					: "Erstelle einen Account"
			}
		/>
	)
}

export default function Page() {
	return (
		<main className="w-full flex justify-center">
			<Card className="w-full max-w-md shadow-2xl">
				<Suspense fallback={null}>
					<Content />
				</Suspense>
			</Card>
		</main>
	)
}
