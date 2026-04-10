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

FROM node:${NODE_VERSION} AS runner

WORKDIR /app

COPY --from=dependencies /app ./

ENV NODE_ENV=production

EXPOSE 3001

CMD ["npx", "tsx", "apps/api/src/index.ts"]