import { getPath, pathLessons, paths } from "./catalog"
import type {
	LearnerProgress,
	LessonMeta,
	LessonState,
	PathDef,
	PathState,
} from "./types"

export function isLessonDone(meta: LessonMeta, progress: LearnerProgress) {
	const p = progress.lessons[meta.id]
	return !!p && p.completions > 0 && p.bestScore >= meta.minScore
}

export function isPathDone(path: PathDef, progress: LearnerProgress) {
	return (
		path.status === "available" &&
		pathLessons(path.id).every(l => isLessonDone(l, progress))
	)
}

export function isPathUnlocked(path: PathDef, progress: LearnerProgress) {
	return (
		path.status === "available" &&
		path.requires.every(r => {
			const req = getPath(r)
			return !!req && isPathDone(req, progress)
		})
	)
}

export function getPathState(
	path: PathDef,
	progress: LearnerProgress
): PathState {
	if (path.status === "soon") return "soon"
	if (isPathDone(path, progress)) return "done"
	return isPathUnlocked(path, progress) ? "open" : "locked"
}

/** Strict sequential unlocking inside an unlocked path. */
export function getLessonState(
	meta: LessonMeta,
	progress: LearnerProgress
): LessonState {
	const path = getPath(meta.pathId)
	if (!path || !isPathUnlocked(path, progress)) return "locked"
	if (isLessonDone(meta, progress)) return "done"
	const lessons = pathLessons(meta.pathId)
	const idx = lessons.findIndex(l => l.id === meta.id)
	const prev = lessons[idx - 1]
	if (prev && !isLessonDone(prev, progress)) return "locked"
	return progress.lessons[meta.id] ? "in_progress" : "available"
}

export function getAllLessonStates(progress: LearnerProgress) {
	const out: Record<string, LessonState> = {}
	for (const p of paths) {
		for (const l of pathLessons(p.id)) out[l.id] = getLessonState(l, progress)
	}
	return out
}
