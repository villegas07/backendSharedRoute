# ──────────────────────────────────────────────
# Stage 1 — base: Node + pnpm v9 (sin supply-chain minimumReleaseAge)
# La restricción minimumReleaseAge se introdujo en pnpm v10.
# El lockfile es formato 9.0, compatible con pnpm v9.
# ──────────────────────────────────────────────
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate

# ──────────────────────────────────────────────
# Stage 2 — deps: todas las dependencias (dev + prod)
# ──────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

# ──────────────────────────────────────────────
# Stage 3 — prod-deps: prunar dev deps del install completo
# pnpm prune no contacta el registry, no hay supply-chain check
# ──────────────────────────────────────────────
FROM base AS prod-deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY --from=deps /app/node_modules ./node_modules
RUN pnpm prune --prod

# ──────────────────────────────────────────────
# Stage 4 — builder: compilar TypeScript
# ──────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

# ──────────────────────────────────────────────
# Stage 5 — production: imagen mínima final
# ──────────────────────────────────────────────
FROM node:22-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/v1/health || exit 1

CMD ["node", "dist/main"]
