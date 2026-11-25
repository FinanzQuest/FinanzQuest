import {
	BookOpen,
	Brain,
	Check,
	Crown,
	Dices,
	Flame,
	Landmark,
	Lock,
	type LucideIcon,
	PieChart,
	Receipt,
	Sigma,
	Sparkles,
	Sprout,
	TrendingUp,
	Trophy,
} from "lucide-react"
import Link from "next/link"
import { numberFormat } from "@/lib/util"
import { cn } from "@/lib/utils"
import { pathLessons } from "./catalog"
import type {
	LearnerProgress,
	LessonMeta,
	LessonState,
	PathDef,
	PathIcon,
	PathState,
} from "./types"

const icons: Record<PathIcon, LucideIcon> = {
	sprout: Sprout,
	"trending-up": TrendingUp,
	"pie-chart": PieChart,
	brain: Brain,
	landmark: Landmark,
	sigma: Sigma,
	receipt: Receipt,
	dices: Dices,
}

// winding trunk: horizontal offsets (px) cycled along the nodes
const wind = [0, 36, 56, 36, 0, -36, -56, -36]

interface Props {
	paths: PathDef[]
	pathStates: Record<string, PathState>
	lessonStates: Record<string, LessonState>
	progress: LearnerProgress
}

export function SkillTree({
	paths,
	pathStates,
	lessonStates,
	progress,
}: Props) {
	const byId = Object.fromEntries(paths.map(p => [p.id, p]))
	const trunk = byId.grundlagen
	const branches = ["aktien", "etfs", "psychologie", "anleihen"].map(
		id => byId[id]
	)
	const portfolio = byId.portfolio
	const stubs = paths.filter(p => p.status === "soon")

	const section = (p: PathDef) => (
		<PathSection
			key={p.id}
			path={p}
			state={pathStates[p.id]}
			lessonStates={lessonStates}
			progress={progress}
		/>
	)

	return (
		<div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-8">
			<Header progress={progress} />
			<div className="mx-auto w-full max-w-md">{section(trunk)}</div>
			<Fork columns={branches.length} />
			<div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
				{branches.map(section)}
			</div>
			<Fork columns={1} />
			<div className="mx-auto w-full max-w-md">{section(portfolio)}</div>
			<div className="grid gap-4 sm:grid-cols-2">{stubs.map(section)}</div>
		</div>
	)
}

function Header({ progress }: { progress: LearnerProgress }) {
	return (
		<div className="flex items-center justify-between gap-3">
			<div className="min-w-0">
				<h1 className="text-2xl font-bold">Lernpfad</h1>
				<p className="text-sm text-muted-foreground">
					Schritt für Schritt zum sicheren Anleger.
				</p>
			</div>
			<div className="flex shrink-0 items-center gap-2">
				<Chip icon={<Sparkles className="size-4 text-primary" />}>
					{numberFormat.format(progress.xpTotal)} XP
				</Chip>
				<Chip
					icon={
						<Flame
							className={cn(
								"size-4",
								progress.streak > 0
									? "fill-current text-overlay-2"
									: "text-muted-foreground"
							)}
						/>
					}
				>
					{progress.streak}
				</Chip>
			</div>
		</div>
	)
}

function Chip({
	icon,
	children,
}: {
	icon: React.ReactNode
	children: React.ReactNode
}) {
	return (
		<span className="flex items-center gap-1.5 rounded-2xl border bg-card px-3 py-1.5 text-sm font-semibold tabular-nums">
			{icon}
			{children}
		</span>
	)
}

/** Decorative connector: trunk splits into `columns` branches (desktop only for >1). */
function Fork({ columns }: { columns: number }) {
	return (
		<div
			aria-hidden
			className={cn(
				"mx-auto flex h-10 w-full items-start justify-center",
				columns > 1 && "md:h-14"
			)}
		>
			<div className="h-full w-0.5 rounded-full bg-border" />
		</div>
	)
}

function PathSection({
	path,
	state,
	lessonStates,
	progress,
}: {
	path: PathDef
	state: PathState
	lessonStates: Record<string, LessonState>
	progress: LearnerProgress
}) {
	const Icon = icons[path.icon]
	const soon = state === "soon"
	const locked = state === "locked"
	const lessons = pathLessons(path.id)
	return (
		<section
			aria-label={path.title}
			className={cn(
				"flex flex-col items-center gap-5",
				(soon || locked) && "opacity-70"
			)}
		>
			<div
				className={cn(
					"flex w-full items-start gap-3 rounded-2xl border bg-card p-4",
					soon && "border-dashed grayscale"
				)}
			>
				<span
					className={cn(
						"flex size-10 shrink-0 items-center justify-center rounded-xl",
						state === "done"
							? "bg-win/15 text-win"
							: "bg-primary/10 text-primary"
					)}
				>
					<Icon className="size-5" />
				</span>
				<div className="min-w-0">
					<h2 className="font-bold leading-tight">{path.title}</h2>
					<p className="text-sm text-muted-foreground">{path.description}</p>
					{soon && (
						<span className="mt-1 inline-block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							bald verfügbar
						</span>
					)}
					{locked && (
						<span className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
							<Lock className="size-3" />
							Schließe zuerst{" "}
							{path.requires.length > 1
								? "die vorherigen Pfade"
								: "den vorherigen Pfad"}{" "}
							ab
						</span>
					)}
				</div>
			</div>
			{!soon && (
				<ol className="flex w-full flex-col items-center gap-5 pb-2">
					{lessons.map((l, i) => (
						<li
							key={l.id}
							className="flex w-full flex-col items-center"
							style={{ transform: `translateX(${wind[i % wind.length]}px)` }}
						>
							<Node
								meta={l}
								state={lessonStates[l.id]}
								mastery={progress.lessons[l.id]?.mastery ?? 0}
							/>
						</li>
					))}
				</ol>
			)}
		</section>
	)
}

function Node({
	meta,
	state,
	mastery,
}: {
	meta: LessonMeta
	state: LessonState
	mastery: number
}) {
	const locked = state === "locked"
	const Glyph = meta.checkpoint
		? Trophy
		: state === "done"
			? Check
			: locked
				? Lock
				: BookOpen
	const body = (
		<>
			{state === "available" && (
				<span
					aria-hidden
					className="absolute inset-0 rounded-full bg-primary/30 motion-safe:animate-ping motion-safe:[animation-duration:2.4s]"
				/>
			)}
			<span
				className={cn(
					"relative flex size-16 items-center justify-center rounded-full border-b-4 transition-transform",
					locked && "border-border bg-muted text-muted-foreground",
					(state === "available" || state === "in_progress") &&
						"border-foreground/30 bg-primary text-primary-foreground",
					state === "in_progress" && "ring-4 ring-primary/30",
					state === "done" && "border-foreground/20 bg-win text-background",
					meta.checkpoint && "size-[4.5rem]"
				)}
			>
				<Glyph className={meta.checkpoint ? "size-8" : "size-6"} />
			</span>
		</>
	)
	return (
		<div className="flex flex-col items-center gap-1.5">
			{locked ? (
				<span
					role="img"
					aria-label={`${meta.title}, gesperrt`}
					className="relative"
				>
					{body}
				</span>
			) : (
				<Link
					href={`/tutorial/${meta.pathId}/${meta.slug}`}
					aria-label={meta.title}
					className="relative rounded-full outline-none transition-transform hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-95 active:translate-y-px"
				>
					{body}
				</Link>
			)}
			<span
				className={cn(
					"max-w-44 text-center text-sm font-medium leading-tight",
					locked && "text-muted-foreground"
				)}
			>
				{meta.title}
			</span>
			{state === "done" && (
				<span
					role="img"
					className="flex gap-0.5"
					aria-label={`Meisterschaft ${mastery} von 3`}
				>
					{[1, 2, 3].map(n => (
						<Crown
							key={n}
							className={cn(
								"size-3.5",
								n <= mastery
									? "fill-current text-overlay-2"
									: "text-muted-foreground/40"
							)}
						/>
					))}
				</span>
			)}
		</div>
	)
}
