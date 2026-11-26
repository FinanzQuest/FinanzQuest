"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import AssetPickerDialog from "@/components/asset_picker_dialog"
import { Button } from "@/components/ui/button"
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { tutorialGateMessage } from "@/lib/asset_tutorial"
import { cn } from "@/lib/utils"
import { createClient } from "@/utils/supabase/client"

type Props = {
	/** depot shown on the page (the active one, or a teacher's ?inspect_depot) */
	depotId: number
	limit?: number
	onSuccessAction?: () => void
	className?: string
}

function getFormSchema(limit?: number) {
	return z.object({
		asset_id: z
			.int({ error: "Bitte wähle ein gültiges Wertpapier aus" })
			.positive("Bitte wähle ein gültiges Wertpapier aus"),
		worth: z.coerce
			.number<number>({ error: "Bitte gib eine Zahl ein" })
			.min(0, { error: "Der Wert darf nicht negativ sein" })
			.max(limit || 1000000, {
				error: `Dir stehen nur ${limit || 1000000} zur Verfügung`,
			}),
		frequency: z.enum(["daily", "weekly", "monthly", "annually"], {
			error: "Bitte wähle eine gültige Frequenz aus",
		}),
	})
}

export default function NewEntryForm({
	depotId,
	limit,
	onSuccessAction: onSuccess,
	className,
}: Props) {
	const client = createClient()
	const formSchema = getFormSchema(limit)
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			worth: 0,
			asset_id: undefined,
			frequency: "monthly",
		},
	})
	async function onSubmit(data: z.infer<typeof formSchema>) {
		const { error } = await client.schema("depots").rpc("upsert_savings_plan", {
			p_depot_id: depotId,
			p_asset_id: data.asset_id,
			p_worth: data.worth,
			p_frequency: data.frequency,
		})

		if (error) {
			toast.error(
				tutorialGateMessage(error) ??
					`Fehler beim Erstellen des Sparplans ${error.message}`
			)
		} else {
			toast.success("Sparplan erfolgreich erstellt")
			if (onSuccess) {
				onSuccess()
			}
		}
	}

	return (
		<Form {...form}>
			<form
				className={cn("flex flex-col gap-4", className)}
				onSubmit={e => {
					e.preventDefault()
					form.handleSubmit(onSubmit)()
				}}
			>
				<FormField
					control={form.control}
					name="asset_id"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Wertpapier</FormLabel>
							<FormControl>
								<AssetPickerDialog
									value={field.value}
									onValueChange={value => field.onChange(value.id)}
								/>
							</FormControl>
							<FormDescription>
								Wähle das Wertpapier aus, in das du investieren möchtest.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>{" "}
				<FormField
					control={form.control}
					name="worth"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Wert</FormLabel>
							<FormControl>
								<Input placeholder={`${0}-${limit || 1000000}`} {...field} />
							</FormControl>
							<FormDescription>
								So viel Geld wird regelmäßig in das Wertpapier investiert.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="frequency"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Frequenz</FormLabel>
							<FormControl>
								<ToggleGroup
									className="w-full flex flex-row justify-start gap-3 "
									value={[field.value]}
									onValueChange={value => {
										// clicking the active item deselects it — keep the period
										if (value[0]) field.onChange(value[0])
									}}
								>
									<ToggleGroupItem value="daily">Täglich</ToggleGroupItem>
									<ToggleGroupItem value="weekly">Wöchentlich</ToggleGroupItem>
									<ToggleGroupItem value="monthly">Monatlich</ToggleGroupItem>
									<ToggleGroupItem value="annually">Jährlich</ToggleGroupItem>
								</ToggleGroup>
							</FormControl>
							<FormDescription>
								In dieser Frequenz wird das Wertpapier regelmäßig investiert.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" className="mt-4">
					Speichern
				</Button>
			</form>
		</Form>
	)
}
