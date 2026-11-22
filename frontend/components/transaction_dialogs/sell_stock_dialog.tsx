"use client"

import { sellStock } from "@/database/stock_transactions"
import { currencyFormatFixedLength } from "@/lib/cash_display_string"
import PrimitiveDialog, {
	type TDepot,
	type TStock,
	type TTransactionHandler,
} from "./primitive_dialog"

const amountFormat = new Intl.NumberFormat("de-DE", {
	maximumFractionDigits: 4,
})

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
			message: `${amountFormat.format(amount)} × ${stock.name} für ${currencyFormatFixedLength.format(worth - commission)} verkauft`,
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
