import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import Inner from "./form"

export default async function Page() {
	return (
		<main className="w-full flex justify-center">
			<Card className="w-full max-w-md shadow-2xl">
				<CardHeader className="text-center">
					<CardTitle>Eröffne dein erstes Depot</CardTitle>
					<CardDescription>
						Wir konnten kein Depot für deinen Account finden, bitte eröffne ein
						neues Depot.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Inner />
				</CardContent>
			</Card>
		</main>
	)
}
