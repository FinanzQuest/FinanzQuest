import type {
	AssetKind,
	PathId,
} from "@/app/(dashboard)/tutorial/_engine/types"

/**
 * Base tutorial path that must be passed before an asset type can be bought.
 * The ETF course (etfs) is optional and advanced; the introduction
 * (grundlagen) unlocks ETFs. Keep in sync with dbinit/04-functions/users/require_asset_tutorial.sql
 * (the DB enforces it, this only drives the UI).
 */
export const assetBasePath: Record<AssetKind, PathId> = {
	stock: "aktien",
	fund: "grundlagen",
	bond: "anleihen",
	crypto: "krypto",
	commodity: "rohstoffe",
}

export const assetKindLabel: Record<AssetKind, string> = {
	stock: "Aktien",
	fund: "ETFs",
	bond: "Anleihen",
	crypto: "Kryptowährungen",
	commodity: "Rohstoffe",
}

/**
 * German message when the DB rejected a buy / savings plan because the base
 * tutorial path of the asset is missing (SQLSTATE 42501, HINT = path id),
 * null for any other error.
 */
export function tutorialGateMessage(error: {
	code?: string
	message?: string
	hint?: string | null
}): string | null {
	if (error.code !== "42501" || !error.message?.startsWith("Tutorial required"))
		return null
	const kind = (Object.keys(assetBasePath) as AssetKind[]).find(
		k => assetBasePath[k] === error.hint
	)
	return kind
		? `Schließe zuerst den Kurs „${assetKindLabel[kind]}“ im Tutorial ab, um das zu kaufen.`
		: "Schließe zuerst den passenden Kurs im Tutorial ab."
}
