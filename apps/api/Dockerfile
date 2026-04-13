ARG NODE_VERSION=24.13.0-slim

FROM node:${NODE_VERSION} AS dependencies

WORKDIR /app

COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY tsconfig.base.json ./
COPY apps/api ./apps/api
COPY packages ./packages

RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
  if [ -f pnpm-lock.yaml ]; then \
    corepack enable pnpm && pnpm install --frozen-lockfile; \
  else \
    echo "No lockfile found." && exit 1; \
  fi

FROM node:${NODE_VERSION} AS builder

WORKDIR /app

COPY --from=dependencies /app ./

# Build db first then api
RUN corepack enable pnpm && \
  pnpm --filter @packages/types build && \
  pnpm --filter @packages/db build && \
  pnpm --filter @apps/api build

FROM node:${NODE_VERSION} AS deploy

WORKDIR /app

COPY --from=dependencies /app ./
# Copy compiled db so pnpm deploy uses the compiled version
COPY --from=builder /app/packages/db/dist ./packages/db/dist

RUN corepack enable pnpm && pnpm deploy --filter @apps/api --prod --legacy /app/deploy

FROM node:${NODE_VERSION} AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=deploy /app/deploy ./
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/packages/db/drizzle ./packages/db/drizzle
COPY --from=builder /app/packages/types/dist ./packages/types/dist
COPY --from=builder /app/packages/db/dist ./packages/db/dist

EXPOSE 3001

CMD ["node", "dist/apps/api/src/index.js"]