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
