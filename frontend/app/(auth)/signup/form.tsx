"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
	resendConfirmation,
	signUpRedirect,
	upgradeGuestRedirect,
} from "../actions"
import GuestButton from "../guest_button"
import { formSchema } from "./form_schema"

export default function SignUpForm({
	mode = "signup",
}: {
	/** "upgrade": the viewer is a guest; the account keeps their depot */
	mode?: "signup" | "upgrade"
}) {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			fullName: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
	})

	const [pending, setPending] = useState<{
		email: string
		kind: "signup" | "email_change"
	} | null>(null)
	const [resending, setResending] = useState(false)

	async function resend() {
		if (!pending) return
		setResending(true)
		const res = await resendConfirmation(pending.email, pending.kind)
		setResending(false)
		toast(res.message ? "Senden fehlgeschlagen" : "E-Mail gesendet", {
			description: res.message ?? "Prüfe dein Postfach.",
		})
	}

	async function onSubmit(data: z.infer<typeof formSchema>) {
		const result =
			mode === "upgrade"
				? await upgradeGuestRedirect(data.fullName, data.email, data.password)
				: await signUpRedirect(data.fullName, data.email, data.password)

		if (result && "pendingEmail" in result && result.pendingEmail) {
			setPending({
				email: result.pendingEmail,
				kind: "kind" in result && result.kind ? result.kind : "signup",
			})
			return
		}
		if (result && "message" in result) {
			toast("Registrierung fehlgeschlagen", {
				description: result.message,
			})
		}
	}

	if (pending) {
		return (
			<div className="flex flex-col gap-4 text-center">
				<h2 className="font-semibold">Prüfe dein Postfach</h2>
				<p className="text-sm text-muted-foreground">
					Wir haben einen Bestätigungslink an{" "}
					<span className="font-medium text-foreground">{pending.email}</span>{" "}
					geschickt. Öffne ihn, um dein Konto zu aktivieren. Schau auch im
					Spam-Ordner nach.
				</p>
				<Button
					type="button"
					variant="outline"
					disabled={resending}
					onClick={resend}
				>
					E-Mail erneut senden
				</Button>
			</div>
		)
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-8 flex flex-col gap-0"
			>
				<FormField
					control={form.control}
					name="fullName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input type="text" placeholder="Max Mustermann" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
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
						<FormItem className="mb-2">
							<FormLabel>Passwort</FormLabel>
							<FormMessage />
							<FormControl>
								<Input type="password" placeholder="Passwort" {...field} />
							</FormControl>
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="confirmPassword"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input
									type="password"
									placeholder="Passwort bestätigen"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="termsAccepted"
					render={({ field }) => (
						<FormItem className="flex flex-row items-start space-x-3 space-y-0">
							<FormControl>
								<Checkbox
									checked={field.value}
									onCheckedChange={field.onChange}
								/>
							</FormControl>
							<FormLabel>
								Ich akzeptiere die{" "}
								<Link className="underline underline-offset-2" href={"/terms"}>
									Nutzungsbedingungen
								</Link>
							</FormLabel>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button className="w-full mx-auto" type="submit">
					{mode === "upgrade" ? "Konto erstellen" : "Registrieren"}
				</Button>
				{mode === "signup" && <GuestButton />}
				<span className="text-muted-foreground text-sm text-center">
					Schon registriert?{" "}
					<Link className="underline underline-offset-2" href="/login">
						Hier einloggen.
					</Link>
				</span>
			</form>
		</Form>
	)
}
