import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"

import LoginForm from "./form"
export default function Page() {
	return (
		<main className="w-full flex justify-center">
			<Card className="w-full max-w-md shadow-2xl">
				<CardHeader className="text-center">
					<CardTitle>Willkommen</CardTitle>
					<CardDescription>
						Logge dich ein, indem du deine E-Mail und Passwort eingibst.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-2">
					<LoginForm />
				</CardContent>
			</Card>
		</main>
	)
}
