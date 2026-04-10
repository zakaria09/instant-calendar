# ============================================
# Stage 1: Dependencies Installation Stage
# ============================================
ARG NODE_VERSION=24.13.0-slim

FROM node:${NODE_VERSION} AS dependencies

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY tsconfig.base.json ./

# Copy app source and packages
COPY apps/web ./apps/web
COPY packages ./packages

# Copy app source and packages
COPY apps/web ./apps/web
COPY packages ./packages

# Install all dependencies
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
  if [ -f pnpm-lock.yaml ]; then \
    corepack enable pnpm && pnpm install --frozen-lockfile; \
  else \
    echo "No lockfile found." && exit 1; \
  fi

# ============================================
# Stage 2: Build Next.js application
# ============================================

FROM node:${NODE_VERSION} AS builder

WORKDIR /app

# Copy everything from dependencies stage (source + node_modules)
COPY --from=dependencies /app ./

ENV NODE_ENV=production

RUN corepack enable pnpm && pnpm --filter @repo/web build

# ============================================
# Stage 3: Run Next.js application
# ============================================

FROM node:${NODE_VERSION} AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# public and .next output are now under apps/web/
COPY --from=builder --chown=node:node /app/apps/web/public ./public

RUN mkdir .next
RUN chown node:node .next

COPY --from=builder --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=builder --chown=node:node /app/apps/web/.next/static ./.next/static

USER node

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
