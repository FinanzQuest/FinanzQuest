import { Suspense } from "react"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { getUser } from "@/lib/auth"

import SignUpForm from "./form"

async function Content() {
	const { user } = await getUser()
	const upgrade = user?.is_anonymous === true

	return (
		<>
			<CardHeader className="text-center">
				<CardTitle>
					{upgrade
						? "Konto erstellen – dein Depot bleibt erhalten"
						: "Erstelle einen Account"}
				</CardTitle>
				<CardDescription>
					Gib dazu deine Daten in das Formular ein
				</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-2">
				<SignUpForm mode={upgrade ? "upgrade" : "signup"} />
			</CardContent>
		</>
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
