import { useRouter } from "next/navigation"
import React from "react"
import { toast } from "sonner"
import { Button } from "../ui/button"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog"
import BuyStockForm, { type onSubmitValues } from "./buy_stock_form"

interface props extends React.ComponentPropsWithoutRef<"div"> {
	stock: TStock
	depot: TDepot
	handleTransaction: TTransactionHandler
	description?: string
	title?: string
	action?: string
	reload?: boolean
	limit: number
	commission: number
	triggerVariant?: "default" | "secondary" | "outline"
	triggerSize?: "xs" | "sm" | "default" | "lg"
	triggerClassName?: string
}

export type TStock = {
	name: string
	id: number
	price: number
}

export type TDepot = {
	id: number
	monetaryAssets: number
}
export type TTransactionHandler = (
	stock: TStock,
	worth: number,
	commission: number,
	depot: TDepot
) => Promise<{ error: Error | null; success: { message: string } | null }>

export default function PrimitiveDialog({
	stock,
	depot,
	handleTransaction,
	reload,
	limit,
	description,
	title,
	action,
	commission,
	triggerVariant,
	triggerSize,
	triggerClassName,
}: props) {
	const router = useRouter()
	const [isOpen, setOpen] = React.useState(false)
	const handleSubmit = async ({ worth }: onSubmitValues) => {
		const { error, success } = await handleTransaction(
			stock,
			worth,
			commission,
			depot
		)

		if (error) {
			toast.error("Failed Transaction", {
				description: error?.message,
			})
			return
		}

		toast("Successfull Transaction", {
			description: success?.message,
		})
		setOpen(false)
		if (reload) {
			router.refresh()
		}
	}

	return (
		<Dialog onOpenChange={open => setOpen(open)} open={isOpen}>
			<DialogTrigger
				render={
					<Button
						variant={triggerVariant}
						size={triggerSize}
						className={triggerClassName}
						disabled={limit === 0}
						onClick={() => {
							setOpen(true)
						}}
					>
						{action}
					</Button>
				}
			/>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
					<DialogClose />
				</DialogHeader>
				<BuyStockForm
					onSubmit={handleSubmit}
					commission={commission}
					limit={limit}
				/>
			</DialogContent>
		</Dialog>
	)
}
