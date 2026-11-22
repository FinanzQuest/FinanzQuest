import * as jose from "jose"

const args = process.argv.slice(2)
const url = args.at(0)
const key = args.at(1)

if (!url || !key) {
	console.error("Usage: node generate_keys.js <supabase_url> <jwt_secret>")
	process.exit(1)
}

const secretKey = new TextEncoder().encode(key)

const anonKey = await new jose.SignJWT({
	role: "anon", // Changed from "sub" to "role"
	iss: "supabase", // Added issuer
})
	.setProtectedHeader({ alg: "HS256", typ: "JWT" })
	.setIssuedAt()
	.setExpirationTime("5y")
	.sign(secretKey)

const adminKey = await new jose.SignJWT({
	role: "service_role", // Changed from "sub" to "role"
	iss: "supabase", // Added issuer
})
	.setProtectedHeader({ alg: "HS256", typ: "JWT" })
	.setIssuedAt()
	.setExpirationTime("5y")
	.sign(secretKey)

console.log(`
NEXT_PUBLIC_SUPABASE_URL=${url}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}
SUPABASE_SERVICE_ROLE_KEY=${adminKey}
`)
