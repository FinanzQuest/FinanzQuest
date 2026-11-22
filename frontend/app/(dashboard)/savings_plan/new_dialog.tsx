"use client"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import NewEntryForm from "./new_form"

export default function NewEntryDialog({
	trigger,
}: {
	trigger?: React.ReactElement
}) {
	const [isOpen, setIsOpen] = useState(false)
	const router = useRouter()

	const handleSuccessAction = () => {
		setIsOpen(false)
		router.refresh()
		// Perform any additional actions after successful form submission
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger
				render={
					trigger || (
						<Button variant="outline" size="icon">
							<Plus className="h-4 w-4" />
						</Button>
					)
				}
			></DialogTrigger>
			<DialogContent className="overflow-clip">
				<DialogHeader>
					<DialogTitle>Neuer Eintrag</DialogTitle>
					<DialogClose
						onClick={e => {
							e.preventDefault()
							e.stopPropagation()
							setIsOpen(false)
						}}
					/>
				</DialogHeader>
				<NewEntryForm
					className="w-full overflow-hidden px-px"
					onSuccessAction={handleSuccessAction}
				/>
			</DialogContent>
		</Dialog>
	)
}
