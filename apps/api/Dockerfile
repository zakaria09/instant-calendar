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

RUN corepack enable pnpm && pnpm --filter @apps/api build

FROM node:${NODE_VERSION} AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/db/drizzle ./packages/db/drizzle

EXPOSE 3001

CMD ["node", "dist/apps/api/src/index.js"]