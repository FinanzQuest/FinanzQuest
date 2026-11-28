import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "./ui/alert-dialog"
export default function SimpleAlertDialog({
	open,
	cancel,
	confirm,
	onConfirm,
	onOpenChange,
	title,
	description,
}: {
	open: boolean
	cancel: string
	confirm: string
	onConfirm: () => void
	onOpenChange: (open: boolean) => void
	title?: string | null
	description?: string | null
}) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter className="w-full flex flex-row !justify-center *:grow">
					<AlertDialogAction
						onClick={onConfirm}
						className="text-destructive bg-transparent border border-input"
					>
						{confirm}
					</AlertDialogAction>
					<AlertDialogCancel variant="default">{cancel}</AlertDialogCancel>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
