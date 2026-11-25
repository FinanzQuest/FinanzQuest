"use client"

import { Crown, Flame, Sparkles } from "lucide-react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { numberFormat, toAbsoluteTimeString } from "@/lib/util"
import { cn } from "@/lib/utils"
import { getLessonMeta, getPath, paths } from "../../tutorial/_engine/catalog"
import type {
	ClassLessonRow,
	ClassOverviewRow,
} from "../../tutorial/_engine/db_types"
import { getStudentLessons } from "./actions"

type SortKey = "name" | "xp" | "streak" | "lessons" | "active"

const sorts: { key: SortKey; label: string }[] = [
	{ key: "name", label: "Name" },
	{ key: "xp", label: "XP" },
	{ key: "streak", label: "Serie" },
	{ key: "lessons", label: "Lektionen" },
	{ key: "active", label: "Zuletzt aktiv" },
]

const displayName = (r: ClassOverviewRow) => r.user_name || r.email || "–"

function compare(a: ClassOverviewRow, b: ClassOverviewRow, key: SortKey) {
	switch (key) {
		case "name":
			return displayName(a).localeCompare(displayName(b), "de")
		case "xp":
			return b.xp_total - a.xp_total
		case "streak":
			return b.streak - a.streak
		case "lessons":
			return b.lessons_completed - a.lessons_completed
		case "active":
			return (b.last_active_day ?? "").localeCompare(a.last_active_day ?? "")
	}
}

const lastActive = (r: ClassOverviewRow) =>
	r.last_active_day ? toAbsoluteTimeString(new Date(r.last_active_day)) : "–"

const currentLesson = (r: ClassOverviewRow) =>
	(r.current_lesson_id && getLessonMeta(r.current_lesson_id)?.title) ||
	(r.lessons_completed > 0 ? "Alles abgeschlossen" : "–")

export function LearningTable({ data }: { data: ClassOverviewRow[] }) {
	const [query, setQuery] = useState("")
	const [sort, setSort] = useState<SortKey>("name")
	const [selected, setSelected] = useState<ClassOverviewRow | null>(null)

	const rows = useMemo(() => {
		const q = query.trim().toLowerCase()
		return data
			.filter(
				r =>
					!q ||
					(r.email ?? "").toLowerCase().includes(q) ||
					(r.user_name ?? "").toLowerCase().includes(q)
			)
			.sort((a, b) => compare(a, b, sort))
	}, [data, query, sort])

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
				<Input
					value={query}
					onChange={e => setQuery(e.target.value)}
					placeholder="Name oder E-Mail suchen"
					aria-label="Schüler suchen"
					className="sm:max-w-xs"
				/>
				<div className="flex flex-wrap gap-1">
					{sorts.map(s => (
						<Button
							key={s.key}
							size="sm"
							variant={sort === s.key ? "secondary" : "ghost"}
							aria-pressed={sort === s.key}
							onClick={() => setSort(s.key)}
						>
							{s.label}
						</Button>
					))}
				</div>
			</div>

			{rows.length === 0 && (
				<p className="py-8 text-center text-muted-foreground">
					Keine Schüler gefunden.
				</p>
			)}

			{/* phones: cards */}
			<ul className="flex flex-col gap-3 md:hidden">
				{rows.map(r => (
					<li key={r.user_id}>
						<button
							type="button"
							onClick={() => setSelected(r)}
							className="flex w-full flex-col gap-2 rounded-2xl border bg-card p-4 text-left"
						>
							<span className="min-w-0">
								<span className="block truncate font-semibold">
									{displayName(r)}
								</span>
								{r.user_name && (
									<span className="block truncate text-xs text-muted-foreground">
										{r.email}
									</span>
								)}
							</span>
							<span className="flex flex-wrap gap-x-4 gap-y-1 text-sm tabular-nums">
								<span>{numberFormat.format(r.xp_total)} XP</span>
								<span>{numberFormat.format(r.streak)} Tage Serie</span>
								<span>
									{numberFormat.format(r.lessons_completed)} Lektionen
								</span>
							</span>
							<span className="text-xs text-muted-foreground">
								Aktuell: {currentLesson(r)} · Zuletzt aktiv: {lastActive(r)}
							</span>
						</button>
					</li>
				))}
			</ul>

			{/* tablet/desktop: table */}
			{rows.length > 0 && (
				<div className="hidden rounded-lg bg-background md:block">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Schüler</TableHead>
								<TableHead className="text-right">XP</TableHead>
								<TableHead className="text-right">Serie</TableHead>
								<TableHead className="text-right">Lektionen</TableHead>
								<TableHead>Aktuelle Lektion</TableHead>
								<TableHead>Zuletzt aktiv</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{rows.map(r => (
								<TableRow
									key={r.user_id}
									className="cursor-pointer"
									onClick={() => setSelected(r)}
								>
									<TableCell>
										<button
											type="button"
											className="text-left font-medium"
											onClick={() => setSelected(r)}
										>
											{displayName(r)}
										</button>
										{r.user_name && (
											<div className="text-xs text-muted-foreground">
												{r.email}
											</div>
										)}
									</TableCell>
									<TableCell className="text-right tabular-nums">
										{numberFormat.format(r.xp_total)}
									</TableCell>
									<TableCell className="text-right tabular-nums">
										{numberFormat.format(r.streak)}
									</TableCell>
									<TableCell className="text-right tabular-nums">
										{numberFormat.format(r.lessons_completed)}
									</TableCell>
									<TableCell>{currentLesson(r)}</TableCell>
									<TableCell>{lastActive(r)}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}

			<StudentSheet student={selected} onClose={() => setSelected(null)} />
		</div>
	)
}

function StudentSheet({
	student,
	onClose,
}: {
	student: ClassOverviewRow | null
	onClose: () => void
}) {
	return (
		<Sheet open={!!student} onOpenChange={o => !o && onClose()}>
			<SheetContent className="w-full overflow-y-auto sm:max-w-md">
				{student && <StudentDetail key={student.user_id} student={student} />}
			</SheetContent>
		</Sheet>
	)
}

function StudentDetail({ student }: { student: ClassOverviewRow }) {
	const [state, setState] = useState<{
		rows: ClassLessonRow[]
		error: string | null
	} | null>(null)
	const [started, setStarted] = useState(false)
	if (!started) {
		setStarted(true)
		getStudentLessons(student.user_id).then(setState)
	}
	const byLesson = new Map((state?.rows ?? []).map(r => [r.lesson_id, r]))

	return (
		<>
			<SheetHeader>
				<SheetTitle>{displayName(student)}</SheetTitle>
				<SheetDescription>{student.email}</SheetDescription>
			</SheetHeader>
			<div className="flex flex-col gap-5 px-4 pb-6">
				<div className="flex flex-wrap gap-4 text-sm tabular-nums">
					<span className="flex items-center gap-1">
						<Sparkles className="size-4" />
						{numberFormat.format(student.xp_total)} XP
					</span>
					<span className="flex items-center gap-1">
						<Flame className="size-4" />
						{numberFormat.format(student.streak)} Tage (Best:{" "}
						{numberFormat.format(student.streak_best)})
					</span>
				</div>
				{!state && (
					<p className="text-sm text-muted-foreground">Wird geladen …</p>
				)}
				{state?.error && <p className="text-sm text-loss">{state.error}</p>}
				{state &&
					!state.error &&
					paths
						.filter(p => p.lessonIds.length > 0)
						.map(p => (
							<section key={p.id} className="flex flex-col gap-1">
								<h3 className="font-semibold">{getPath(p.id)?.title}</h3>
								<ul className="flex flex-col divide-y rounded-2xl border bg-card">
									{p.lessonIds.map(id => {
										const r = byLesson.get(id)
										return (
											<li
												key={id}
												className={cn(
													"flex items-center justify-between gap-3 px-3 py-2 text-sm",
													!r && "text-muted-foreground"
												)}
											>
												<span className="min-w-0 truncate">
													{getLessonMeta(id)?.title ?? id}
												</span>
												{r ? (
													<span className="flex shrink-0 items-center gap-3 tabular-nums">
														<span className="flex">
															{[1, 2, 3].map(n => (
																<Crown
																	key={n}
																	className={cn(
																		"size-4",
																		n <= r.mastery
																			? "fill-current text-overlay-2"
																			: "text-muted-foreground/40"
																	)}
																/>
															))}
														</span>
														<span>
															{numberFormat.format(
																Math.round(r.best_score * 100)
															)}{" "}
															%
														</span>
														<span className="text-xs text-muted-foreground">
															{numberFormat.format(r.completions)}×
														</span>
													</span>
												) : (
													<span className="text-xs">offen</span>
												)}
											</li>
										)
									})}
								</ul>
							</section>
						))}
			</div>
		</>
	)
}
