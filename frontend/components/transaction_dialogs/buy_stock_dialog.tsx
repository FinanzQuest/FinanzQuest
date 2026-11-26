"use client"

import { buyStock } from "@/database/stock_transactions"
import { currencyFormatFixedLength } from "@/lib/cash_display_string"
import PrimitiveDialog, {
	type TDepot,
	type TStock,
	type TTransactionHandler,
} from "./primitive_dialog"

const amountFormat = new Intl.NumberFormat("de-DE", {
	maximumFractionDigits: 4,
})

const handleStockPurchase: TTransactionHandler = async (
	stock,
	worth,
	commission,
	depot
) => {
	const { error } = await buyStock(stock.id, depot.id, worth)
	if (error) {
		console.error("Error buying stock:", error)
		return { error: error, success: null }
	}

	const amount = worth / stock.price
	return {
		error: null,
		success: {
			message: `${amountFormat.format(amount)} × ${stock.name} für ${currencyFormatFixedLength.format(worth + commission)} gekauft`,
		},
	}
}

export default function BuyStockDialog(props: {
	stock: TStock
	depot: TDepot
	commission: number
	limit: number
	triggerSize?: "xs" | "sm" | "default" | "lg"
	triggerClassName?: string
}) {
	return (
		<PrimitiveDialog
			reload
			title="Kaufen"
			action="Kaufen"
			{...props}
			handleTransaction={handleStockPurchase}
		/>
	)
}
