"use client"

import { sellStock } from "@/database/stock_transactions"
import PrimitiveDialog, {
	type TDepot,
	type TStock,
	type TTransactionHandler,
} from "./primitive_dialog"

const handleStockSale: TTransactionHandler = async (
	stock,
	worth,
	commission,
	depot
) => {
	const { error } = await sellStock(stock.id, depot.id, worth)
	if (error) {
		return { error: error, success: null }
	}

	const amount = worth / stock.price

	return {
		error: null,
		success: {
			message: `Successfully sold ${stock.name} x ${amount.toFixed(2)} for ${(
				worth + commission
			).toFixed(2)} USD`,
		},
	}
}

export default function SellStockDialog(props: {
	stock: TStock
	depot: TDepot
	commission: number
	limit: number
	triggerSize?: "xs" | "sm" | "default" | "lg"
}) {
	return (
		<PrimitiveDialog
			title="Verkaufen"
			action="Verkaufen"
			reload
			triggerVariant="outline"
			{...props}
			handleTransaction={handleStockSale}
		/>
	)
}
