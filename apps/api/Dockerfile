# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace manifests
COPY package.json turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/utils/package.json ./packages/utils/
COPY packages/config/package.json ./packages/config/

RUN npm install --frozen-lockfile

# Copy source
COPY apps/api ./apps/api
COPY packages/utils ./packages/utils
COPY packages/config ./packages/config

RUN npm run build --workspace=apps/api

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./package.json

RUN npm install --omit=dev --ignore-scripts

EXPOSE 4000

USER node

CMD ["node", "dist/index.js"]
