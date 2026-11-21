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
		<main className="grow flex justify-center items-center">
			<Card className="w-[1400px] max-w-[33%] shadow-2xl">
				<CardHeader>
					<CardTitle className="text-center">Erstelle einen Account</CardTitle>
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
