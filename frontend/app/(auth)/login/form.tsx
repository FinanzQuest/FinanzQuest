"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"
import { Button } from "@/components/ui/button"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { loginRedirect, resendConfirmation } from "../actions"
import GuestButton from "../guest_button"
import { formSchema } from "./form_schema"

export default function LoginForm() {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
			rememberUser: true,
		},
	})

	const [unconfirmed, setUnconfirmed] = useState(false)

	async function onSubmit(data: z.infer<typeof formSchema>) {
		const error = await loginRedirect(data.email, data.password)

		setUnconfirmed(error?.unconfirmed === true)
		if (error) {
			toast("Log-In gescheitert", {
				description: error.message,
			})
			return
		}
	}

	async function resend() {
		const res = await resendConfirmation(form.getValues("email"))
		toast(res.message ? "Senden fehlgeschlagen" : "E-Mail gesendet", {
			description: res.message ?? "Prüfe dein Postfach.",
		})
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-8 flex flex-col gap-0"
			>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>E-Mail</FormLabel>
							<FormControl>
								<Input
									type="email"
									placeholder="maxmustermann@beispiel.de"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Passwort</FormLabel>
							<FormControl>
								<Input type="password" placeholder="Passwort" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button className="w-full mx-auto" type="submit">
					Einloggen
				</Button>
				{unconfirmed && (
					<Button type="button" variant="outline" onClick={resend}>
						Bestätigungs-E-Mail erneut senden
					</Button>
				)}
				<GuestButton />
				<span className="text-muted-foreground text-sm text-center">
					Kein Account?{" "}
					<Link className={"underline underline-offset-2"} href="/signup">
						Registriere dich hier.
					</Link>
				</span>
			</form>
		</Form>
	)
}
