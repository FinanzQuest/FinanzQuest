import { createClient } from "@supabase/supabase-js"

// Requires service role key (not anon key) for admin.createUser
const supabase = createClient(
	process.env.SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const DEFAULT_PASSWORD = "FinanzQuest2026!"

const students = [
	{ email: "toni.bui@martineum.de", fullName: "Toni Hoang Hai Bui" },
	{ email: "mattes.friese@martineum.de", fullName: "Mattes Friese" },
	{ email: "lenny.hennig@martineum.de", fullName: "Lenny Hennig" },
	{ email: "alida.heucke@martineum.de", fullName: "Alida Heucke" },
	{ email: "natalie.hoyer@martineum.de", fullName: "Natalie Hoyer" },
	{ email: "hanna.kunze@martineum.de", fullName: "Hanna Kunze" },
	{ email: "teresa.ledderbohm@martineum.de", fullName: "Teresa Ledderbohm" },
	{ email: "roman.maier@martineum.de", fullName: "Roman Maier" },
	{ email: "lotta.menzel@martineum.de", fullName: "Lotta Menzel" },
	{ email: "amelie.nahrstedt@martineum.de", fullName: "Amelie Nahrstedt" },
	{ email: "annabell.pawlik@martineum.de", fullName: "Annabell Pawlik" },
	{ email: "eric.pitt@martineum.de", fullName: "Eric Pitt" },
	{ email: "maja.roemmer@martineum.de", fullName: "Maja Römmer" },
	{ email: "neo.schuermann@martineum.de", fullName: "Neo-Justin Schürmann" },
	{ email: "julian.seifert@martineum.de", fullName: "Julian Seifert" },
	{ email: "ruby.thiemann@martineum.de", fullName: "Ruby Mae Thiemann" },
	{ email: "valeriia.zeinalova@martineum.de", fullName: "Valeriia Zeinalova" },
	{ email: "charlotta.blahovec@martineum.de", fullName: "Charlotta Blahovec" },
	{ email: "charlotte.brandt@martineum.de", fullName: "Charlotte Brandt" },
	{
		email: "jasmina.diekmann@martineum.de",
		fullName: "Jasmina Elisabeth Diekmann",
	},
	{ email: "lilly.ebers@martineum.de", fullName: "Lilly Ebers" },
	{ email: "malte.franz@martineum.de", fullName: "Malte Eric Franz" },
	{ email: "liam.fuemel@martineum.de", fullName: "Liam Fümel" },
	{ email: "david.gebauer@martineum.de", fullName: "David Gebauer" },
	{ email: "janine.heister@martineum.de", fullName: "Janine Heister" },
	{
		email: "annelisse.ionita@martineum.de",
		fullName: "Annelisse-Maria Ionita",
	},
	{ email: "emilian.keul@martineum.de", fullName: "Emilian Keul" },
	{ email: "lenny.koenig@martineum.de", fullName: "Lenny Hans König" },
	{ email: "franz.kowalski@martineum.de", fullName: "Franz Kowalski" },
	{ email: "hannes.kraegeloh@martineum.de", fullName: "Hannes Krägeloh" },
	{ email: "leon.kruse@martineum.de", fullName: "Leon Paul Kruse" },
	{ email: "jannik.matlach@martineum.de", fullName: "Jannik Matlach" },
	{ email: "louisa.nedel@martineum.de", fullName: "Louisa Nedel" },
	{ email: "clara.otto@martineum.de", fullName: "Clara Otto" },
	{ email: "leon.rohde@martineum.de", fullName: "Leon Rohde" },
	{ email: "clara.rohland@martineum.de", fullName: "Clara Rohland" },
	{ email: "tim.soechting@martineum.de", fullName: "Tim Söchting" },
	{ email: "lotta.winkelmann@martineum.de", fullName: "Lotta Winkelmann" },
	{ email: "yannis.woznitza@martineum.de", fullName: "Yannis Woznitza" },
	{ email: "leni.zinn@martineum.de", fullName: "Leni Amalia Zinn" },
]

async function createStudents() {
	let created = 0
	let skipped = 0
	let failed = 0

	for (const student of students) {
		const { error } = await supabase.auth.admin.createUser({
			email: student.email,
			password: DEFAULT_PASSWORD,
			email_confirm: true, // sets email_confirmed_at automatically
			user_metadata: {
				name: student.fullName,
			},
		})

		if (error) {
			if (error.message.includes("already been registered")) {
				console.log(`⏭  skipped  ${student.email}`)
				skipped++
			} else {
				console.error(`✗  failed   ${student.email} – ${error.message}`)
				failed++
			}
		} else {
			console.log(`✓  created  ${student.email}`)
			created++
		}
	}

	console.log(
		`\nDone: ${created} created, ${skipped} skipped, ${failed} failed`
	)
}

createStudents()
