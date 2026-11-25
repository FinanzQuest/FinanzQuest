import type { LessonMeta, PathDef, PathId } from "./types"

const LESSON_XP = 20
const CHECKPOINT_XP = 50
// keep in sync with dbinit/seed/tutorial_catalog.sql
const LESSON_REWARD = 100
const CHECKPOINT_REWARD = 500
const CHECKPOINT_MIN_SCORE = 0.7

type LessonSeed = readonly [slug: string, title: string]

interface PathSeed extends Omit<PathDef, "lessonIds"> {
	lessons: LessonSeed[]
}

const seeds: PathSeed[] = [
	{
		id: "grundlagen",
		title: "Grundlagen",
		description: "Warum Vorsorge, Zinseszins und der Weg zum ersten ETF.",
		icon: "sprout",
		requires: [],
		status: "available",
		lessons: [
			["warum-vorsorgen", "Warum vorsorgen?"],
			["rendite-zinseszins", "Rendite & Zinseszins"],
			["risiko-streuung", "Risiko & Streuung"],
			["etf-sparplan", "ETFs & Sparplan"],
			["checkpoint", "Checkpoint Grundlagen"],
		],
	},
	{
		id: "aktien",
		title: "Aktien",
		description: "Unternehmen bewerten und Kennzahlen richtig lesen.",
		icon: "trending-up",
		requires: ["grundlagen"],
		status: "available",
		lessons: [
			["unternehmen-bewerten", "Unternehmen bewerten"],
			["kgv-kbv-dividende", "KGV, KBV & Dividende"],
			["risiko-kennzahlen", "Risikokennzahlen"],
			["charts-lesen", "Charts lesen"],
			["checkpoint", "Checkpoint Aktien"],
		],
	},
	{
		id: "etfs",
		title: "ETFs",
		description: "Indizes, Länder, Sektoren und Kosten im Vergleich.",
		icon: "pie-chart",
		requires: ["grundlagen"],
		status: "available",
		lessons: [
			["index-bauen", "Einen Index bauen"],
			["indizes-vergleich", "Indizes im Vergleich"],
			["laender-sektoren", "Länder & Sektoren"],
			["kosten-varianten", "Kosten & Varianten"],
			["checkpoint", "Checkpoint ETFs"],
		],
	},
	{
		id: "psychologie",
		title: "Psychologie",
		description: "Kopf behalten bei Crashs, Timing und Rebalancing.",
		icon: "brain",
		requires: ["grundlagen"],
		status: "available",
		lessons: [
			["crashs", "Crashs verstehen"],
			["panik-simulation", "Panik-Simulation"],
			["time-in-market", "Time in the Market"],
			["einmal-vs-sparplan", "Einmalanlage vs. Sparplan"],
			["rebalancing", "Rebalancing"],
			["checkpoint", "Checkpoint Psychologie"],
		],
	},
	{
		id: "anleihen",
		title: "Anleihen",
		description: "Kupon, Zinsen, Bonität und der Risikopuffer im Depot.",
		icon: "landmark",
		requires: ["grundlagen"],
		status: "available",
		lessons: [
			["wie-anleihen-funktionieren", "Wie Anleihen funktionieren"],
			["zinsen-und-kurse", "Zinsen & Kurse"],
			["bonitaet", "Bonität"],
			["anleihen-im-portfolio", "Anleihen im Portfolio"],
			["checkpoint", "Checkpoint Anleihen"],
		],
	},
	{
		id: "portfolio",
		title: "Portfoliotheorie",
		description: "Die Mathematik hinter Rendite, Risiko und Diversifikation.",
		icon: "sigma",
		requires: ["aktien", "anleihen"],
		status: "available",
		lessons: [
			["rendite-volatilitaet-mathe", "Rendite & Volatilität"],
			["kovarianz-korrelation", "Kovarianz & Korrelation"],
			["sharpe-alpha-beta", "Sharpe, Alpha & Beta"],
			["efficient-frontier", "Efficient Frontier"],
			["capm", "CAPM"],
			["optionen-griechen", "Optionen & Griechen"],
			["checkpoint", "Checkpoint Portfolio"],
		],
	},
	{
		id: "steuern",
		title: "Vorsorge & Steuern",
		description: "Steuern und Vorsorge in Deutschland.",
		icon: "receipt",
		requires: ["grundlagen"],
		status: "soon",
		lessons: [],
	},
	{
		id: "spekulation",
		title: "Spekulation & Fallen",
		description: "Hebel, Hypes und typische Anlegerfallen.",
		icon: "dices",
		requires: ["grundlagen"],
		status: "soon",
		lessons: [],
	},
]

export const paths: PathDef[] = seeds.map(({ lessons, ...p }) => ({
	...p,
	lessonIds: lessons.map(([slug]) => `${p.id}.${slug}`),
}))

export const lessonMetas: LessonMeta[] = seeds.flatMap(p =>
	p.lessons.map(([slug, title]) => {
		const checkpoint = slug === "checkpoint"
		return {
			id: `${p.id}.${slug}`,
			pathId: p.id,
			slug,
			title,
			xp: checkpoint ? CHECKPOINT_XP : LESSON_XP,
			virtualCashReward: checkpoint ? CHECKPOINT_REWARD : LESSON_REWARD,
			minScore: checkpoint ? CHECKPOINT_MIN_SCORE : 0,
			checkpoint,
		}
	})
)

const pathById = new Map(paths.map(p => [p.id, p]))
const lessonById = new Map(lessonMetas.map(l => [l.id, l]))

export const getPath = (id: string): PathDef | undefined =>
	pathById.get(id as PathId)
export const getLessonMeta = (id: string): LessonMeta | undefined =>
	lessonById.get(id)
export const pathLessons = (id: PathId): LessonMeta[] =>
	(pathById.get(id)?.lessonIds ?? []).flatMap(l => lessonById.get(l) ?? [])
