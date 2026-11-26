import { connection } from "next/server"
import { Suspense } from "react"
import { paths } from "./_engine/catalog"
import { getProgress } from "./_engine/progress"
import { SkillTree } from "./_engine/skill_tree"
import { getAllLessonStates, getPathState } from "./_engine/unlock"

export default function Page() {
	return (
		<main className="h-full w-full overflow-y-auto bg-background">
			<Suspense>
				<Overview />
			</Suspense>
		</main>
	)
}

async function Overview() {
	// per user: the auth client reads the clock before the cookies
	await connection()
	const progress = await getProgress()
	const pathStates = Object.fromEntries(
		paths.map(p => [p.id, getPathState(p, progress)])
	)
	return (
		<SkillTree
			paths={paths}
			pathStates={pathStates}
			lessonStates={getAllLessonStates(progress)}
			progress={progress}
		/>
	)
}
