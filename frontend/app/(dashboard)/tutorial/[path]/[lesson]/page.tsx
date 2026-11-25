import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"
import { getDepotId } from "@/lib/get_depot_id"
import { serverSlots } from "../../_content/server_slots"
import { getLessonMeta, pathLessons } from "../../_engine/catalog"
import { LessonPlayer } from "../../_engine/lesson_player"
import { getProgress } from "../../_engine/progress"
import { getLessonState } from "../../_engine/unlock"

// params is a Promise in this Next version
export default async function Page({
	params,
}: {
	params: Promise<{ path: string; lesson: string }>
}) {
	const { path, lesson } = await params
	const meta = getLessonMeta(`${path}.${lesson}`)
	if (!meta) notFound()

	const progress = await getProgress()
	if (getLessonState(meta, progress) === "locked") redirect("/tutorial")

	const lessons = pathLessons(meta.pathId)
	const next = lessons[lessons.findIndex(l => l.id === meta.id) + 1]
	const { depotId } = await getDepotId()

	const slotRenderers = serverSlots[meta.id] ?? {}
	const slots = Object.fromEntries(
		await Promise.all(
			Object.entries(slotRenderers).map(
				async ([name, render]) => [name, await render()] as const
			)
		)
	)

	return (
		<div className="flex h-full min-h-0 w-full flex-col overflow-y-auto bg-background">
			<Suspense>
				<LessonPlayer
					lessonId={meta.id}
					depotId={depotId}
					nextHref={next ? `/tutorial/${next.pathId}/${next.slug}` : null}
					slots={slots}
				/>
			</Suspense>
		</div>
	)
}
