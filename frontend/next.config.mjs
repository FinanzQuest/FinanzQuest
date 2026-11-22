/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "assets.parqet.com",
				port: "",
				pathname: "/logos/**",
			},
		],
	},
	output: "standalone",
	// Cache Components: a prerendered static shell (layout, navigation) is
	// served at once and user-specific parts stream in; public data is cached
	// across users with "use cache" (prices, leaderboard). Partial
	// prefetching prefetches only the static part of linked routes.
	cacheComponents: true,
	partialPrefetching: true,
	// React Compiler: automatic memoization of components and hooks. Next.js
	// pre-filters with SWC so the Babel plugin only runs on files with JSX or
	// hooks. Components it cannot compile (TanStack Table's useReactTable) are
	// skipped and behave as before.
	reactCompiler: {
		environment: {
			// keep existing useMemo/useCallback semantics (set explicitly, the
			// default differs between compiler implementations)
			enablePreserveExistingMemoizationGuarantees: true,
		},
	},
}
export default nextConfig
