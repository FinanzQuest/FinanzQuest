import Link from "next/link"
import { Button } from "@/components/ui/button"

/** Starts a guest session (see /try). */
export default function GuestButton() {
	return (
		<Button
			variant="outline"
			className="w-full"
			nativeButton={false}
			render={<Link href="/try" />}
		>
			Als Gast testen
		</Button>
	)
}
