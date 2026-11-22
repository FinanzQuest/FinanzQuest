import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"

import SignUpForm from "./form"

export default function Page() {
	return (
		<main className="w-full flex justify-center">
			<Card className="w-full max-w-md shadow-2xl">
				<CardHeader className="text-center">
					<CardTitle>Erstelle einen Account</CardTitle>
					<CardDescription>
						Gib dazu deine Daten in das Formular ein
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-2">
					<SignUpForm />
				</CardContent>
			</Card>
		</main>
	)
}
