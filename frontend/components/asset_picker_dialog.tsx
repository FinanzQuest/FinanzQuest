import { Search } from "lucide-react"
import Image from "next/image"
import { useMemo, useState } from "react"
import type { Asset } from "@/database/custom_types"
import { getIconURL } from "@/lib/icon_url"
import { cn } from "@/lib/utils"
import StockPicker from "./asset_picker"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog"

type AssetT = Omit<Asset, "last_updated" | "description">

type AssetPickerDialogProps = {
	className?: string
	value?: number
	defaultValue?: AssetT | null
	onValueChange?: (asset: Asset) => void
	displayName?: boolean
	disabled?: boolean
}

export default function AssetPickerDialog({
	className,
	value,
	defaultValue,
	onValueChange,
	displayName = true,
	disabled = false,
}: AssetPickerDialogProps) {
	const [open, setOpen] = useState(false)
	const [searchQuery, setSearchQuery] = useState<string>("")
	const [selectedAsset, setSelectedAsset] = useState<Asset | null | undefined>(
		defaultValue as Asset // dirty asfuck but doesnt matter rly
	)

	const handleSelect = (_: number, asset: Asset) => {
		setSelectedAsset(asset)
		onValueChange?.(asset)
		setOpen(false)
		setSearchQuery("")
	}

	const handleOpenChange = (isOpen: boolean) => {
		setOpen(isOpen)
		if (isOpen) {
			setSearchQuery("")
		}
	}

	const iconUrl = useMemo(() => {
		if (!selectedAsset) return null
		return getIconURL(selectedAsset.symbol, selectedAsset.asset_type, 32)
	}, [selectedAsset])

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger
				disabled={disabled}
				render={
					<Button
						variant="outline"
						className={cn(
							className,
							"w-full justify-start",
							disabled ? "border-transparent bg-transparent" : "border"
						)}
						type="button"
					>
						{selectedAsset ? (
							<div className="flex items-center gap-2 w-full">
								{iconUrl ? (
									<Image
										src={iconUrl}
										alt={selectedAsset.symbol}
										width={32}
										height={32}
										className="rounded size-5"
									/>
								) : (
									""
								)}
								<span className="font-medium ">{selectedAsset.symbol}</span>
								{displayName ? (
									<>
										<span className="text-muted-foreground">-</span>
										<span className="overflow-hidden text-ellipsis whitespace-nowrap">
											{selectedAsset.name}
										</span>
									</>
								) : null}
							</div>
						) : (
							<div className="flex items-center gap-2 text-muted-foreground">
								<Search className="h-4 w-4" />
								<span>Wähle ein Wertpapier aus</span>
							</div>
						)}
					</Button>
				}
			/>
			<DialogContent className="max-w-[600px] p-2">
				<StockPicker
					value={value}
					onSelect={handleSelect}
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
				/>
			</DialogContent>
		</Dialog>
	)
}
