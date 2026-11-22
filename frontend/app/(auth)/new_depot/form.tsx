"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createDepotRedirect } from "../actions"

export default function Inner() {
	const [name, setName] = useState("")
	const [pending, startTransition] = useTransition()

	function onSubmit(event: React.FormEvent) {
		event.preventDefault()
		startTransition(async () => {
			// redirects on success; returns an error otherwise
			const error = await createDepotRedirect(name)
			if (error) toast(error.message)
		})
	}

	return (
		<form className="flex flex-col gap-4" onSubmit={onSubmit}>
			<div className="flex flex-col gap-2">
				<Label htmlFor="depot-name">Name (optional)</Label>
				<Input
					id="depot-name"
					value={name}
					maxLength={40}
					placeholder="z. B. Mein Sparschwein"
					onChange={event => setName(event.target.value)}
				/>
				<span className="text-xs text-muted-foreground">
					Ohne Namen bekommt dein Depot einen zufälligen, z. B. „Sparsamer
					Hamster“.
				</span>
			</div>
			<Button type="submit" disabled={pending}>
				{pending ? "Wird eröffnet …" : "Eröffnen"}
			</Button>
		</form>
	)
}
