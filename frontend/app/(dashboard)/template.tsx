/** Re-mounts on every navigation: content fades in softly. */
export default function Template({ children }: { children: React.ReactNode }) {
	return <div className="fq-page-in h-full min-h-0 w-full">{children}</div>
}
