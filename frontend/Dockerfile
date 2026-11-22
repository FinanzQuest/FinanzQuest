FROM node:24-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
# yarn.lock is Yarn 4 (berry); the image's bundled Yarn 1 cannot read it.
# Corepack provides the version from package.json "packageManager".
COPY package.json yarn.lock .yarnrc.yml ./
RUN corepack enable && yarn install --immutable

FROM deps AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# URLs are public build arguments. JWT_SECRET arrives as a BuildKit secret
# (compose.yml: build.secrets), so it is never stored in a layer or in the
# image history. The build only needs the public values Next.js inlines
# (URLs, anon key); the service-role key is generated at container start from
# the runtime JWT_SECRET (see CMD), and .env.local is removed before the
# layer is committed.
ARG API_URL_SERVER
ARG API_URL_CLIENT

RUN apk add --no-cache openssl
COPY generate_keys.sh ./
RUN --mount=type=secret,id=jwt_secret,required=true \
    sh generate_keys.sh "$API_URL_SERVER" "$API_URL_CLIENT" "$(cat /run/secrets/jwt_secret)" > keys.env && \
    grep -vE '^(SUPABASE_SERVICE_ROLE_KEY|SUPABASE_JWT_SECRET)=' keys.env > .env.local && \
    rm keys.env && \
    yarn build && \
    rm -f .env.local .next/standalone/.env*

FROM base AS dev
WORKDIR /app
RUN corepack enable
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN touch /app/.env.local
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD sh generate_keys.sh "$API_URL_SERVER" "$API_URL_CLIENT" "$JWT_SECRET" > .env.local && yarn dev

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache openssl
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN mkdir -p /app && \
    touch /app/.env.local && \
    chown -R nextjs:nodejs /app

# Runtime configuration (API_URL_SERVER, API_URL_CLIENT, JWT_SECRET) comes
# from the container environment, not from build arguments.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --chown=nextjs:nodejs generate_keys.sh ./
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
SHELL ["/bin/sh", "-c"]
CMD sh generate_keys.sh "$API_URL_SERVER" "$API_URL_CLIENT" "$JWT_SECRET" > .env.local && node server.js
