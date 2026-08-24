"use client"

import { buyStock } from "@/database/stock_transactions"
import PrimitiveDialog, {
	type TDepot,
	type TStock,
	type TTransactionHandler,
} from "./primitive_dialog"

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
			message: `Successfully bought ${stock.name} x ${amount.toFixed(2)} for ${(
				worth + commission
			).toFixed(2)} USD`,
		},
	}
}

export default function BuyStockDialog(props: {
	stock: TStock
	depot: TDepot
	commission: number
	limit: number
	triggerSize?: "xs" | "sm" | "default" | "lg"
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
