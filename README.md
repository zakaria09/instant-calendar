# Instant Calendar

A lightweight appointment booking tool for sole traders and small teams. Clients book through a simple link — no app download or account required. The product does one thing well: fills your calendar and reduces no-shows.

Built for barbers, nail technicians, personal trainers, therapists, tutors, and anyone else where the client always comes to them.

**Live:** [instantcalendar.io](https://instantcalendar.io) · **Status:** [stats.uptimerobot.com/lCO42diMMJ](https://stats.uptimerobot.com/lCO42diMMJ)

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), Tailwind CSS v4 |
| Backend | Hono, Better Auth, Drizzle ORM |
| Database | PostgreSQL 16 |
| Auth | Better Auth — magic link (passwordless), organisation plugin |
| Email | Resend |
| Infrastructure | DigitalOcean VPS, Docker, Caddy |
| CI/CD | GitHub Actions, GHCR |

---

## Monorepo Structure

```
/apps
  /web          # Next.js frontend
  /api          # Hono backend API
/packages
  /db           # Drizzle schema, migrations, db client
  /types        # Shared Zod schemas and TypeScript types
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (version pinned in `package.json` via `packageManager` — corepack will use the correct version automatically)
- Docker (for the database)

### Local Development

1. Clone the repo and install dependencies from the root:

```bash
corepack enable pnpm
pnpm install
```

2. Create env files:

**`apps/api/.env`**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/instant_calendar
RESEND_API_KEY=your_resend_key
EMAIL_FROM=noreply@yourdomain.com
WEB_URL=http://localhost:3000
BETTER_AUTH_URL=http://localhost:3001
BETTER_AUTH_SECRET=your_secret
PORT=3001
```

**`apps/web/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Start the database:

```bash
pnpm run docker:db
```

4. Push the schema to the local database:

```bash
pnpm --filter @packages/db db:push
```

5. Start both apps:

```bash
pnpm run dev
```

Or individually:

```bash
pnpm --filter @apps/api dev
pnpm --filter @apps/web dev
```

Web runs on [localhost:3000](http://localhost:3000) · API runs on [localhost:3001](http://localhost:3001)

---

## Scripts

| Script | Description |
|---|---|
| `pnpm run dev` | Start web and api concurrently |
| `pnpm run build` | Build web and api |
| `pnpm run docker:db` | Start PostgreSQL in Docker |
| `pnpm run docker:db:down` | Stop PostgreSQL |
| `pnpm run docker:push` | Build and push production image to GHCR |

---

## Database

### Local vs production workflow

Local and production use **different strategies** — mixing them causes migration drift and broken deploys.

| Environment | Command | How it works |
|---|---|---|
| **Local dev** | `db:push` | Applies the current Drizzle schema directly to the database. No migration files. Fast iteration. |
| **Production** | `db:generate` → `db:migrate` | Generates versioned SQL migration files, then applies them in order. Migrations run automatically on every deploy. |

**The rule:** use `db:push` locally, use `db:generate` + `db:migrate` for production. Never run `db:migrate` against your local database — it can conflict with changes already applied by `db:push`. If your local database gets into a bad state, wipe it and re-push:

```bash
pnpm run docker:db:down
docker volume rm $(docker volume ls -q | grep instant-calendar)
pnpm run docker:db
pnpm --filter @packages/db db:push
```

### Typical schema change workflow

1. Edit the Drizzle schema in `packages/db`
2. Run `pnpm --filter @packages/db db:push` to apply locally and test
3. When ready to deploy, generate a migration: `pnpm --filter @packages/db db:generate`
4. Commit the schema changes and the new migration file in `packages/db/drizzle/`
5. Push to `main` — the pipeline will run `db:migrate` in production

### Commands

```bash
# Push schema directly (local dev only)
pnpm --filter @packages/db db:push

# Generate a new migration file (before deploying)
pnpm --filter @packages/db db:generate

# Run migrations (production — runs automatically on deploy)
pnpm --filter @packages/db db:migrate

# Open Drizzle Studio
pnpm --filter @packages/db db:studio
```

> **Migration history table location** — Drizzle stores migration history in `drizzle.__drizzle_migrations` (schema `drizzle`), not `public.__drizzle_migrations`.
>
> Verify applied migrations with:
>
> ```sql
> SELECT id, hash, created_at
> FROM drizzle.__drizzle_migrations
> ORDER BY id;
> ```

### Drizzle version pinning

`drizzle-kit` is pinned to **0.30.6** and `drizzle-orm` to **0.44.2**. Versions 0.31.x of drizzle-kit have a [known bug](https://github.com/drizzle-team/drizzle-orm/issues/4451) where `drizzle-kit migrate` hangs indefinitely with the `pg` driver on macOS. Check the issue before upgrading — once it's resolved, the pin can be lifted.

### Manual migration fallback

If `drizzle-kit migrate` ever hangs or fails, you can apply migration SQL directly via psql:

```bash
docker cp packages/db/drizzle/<migration_file>.sql instant-calendar-db-1:/tmp/migration.sql
docker exec instant-calendar-db-1 psql -U postgres -d instant_calendar -f /tmp/migration.sql
```

---

## Deployment

Pushes to `main` trigger the GitHub Actions pipeline which:

1. Builds Docker images for `web` and `api`
2. Pushes images to GitHub Container Registry
3. SSHs into the DigitalOcean VPS
4. Writes env vars from GitHub Secrets to `/root/instant-calendar.env`
5. Pulls latest images and restarts containers
6. Runs database migrations

### Required GitHub Secrets

| Secret | Description |
|---|---|
| `VPS_HOST` | DigitalOcean droplet IP |
| `VPS_SSH_KEY` | Private SSH key for VPS access |
| `GHCR_TOKEN` | GitHub personal access token with packages scope |
| `POSTGRES_USER` | Database username |
| `POSTGRES_PASSWORD` | Database password |
| `POSTGRES_DB` | Database name |
| `RESEND_API_KEY` | Resend API key |
| `EMAIL_FROM` | Verified sender email address |
| `WEB_URL` | Production web URL |
| `BETTER_AUTH_URL` | Production API URL |
| `BETTER_AUTH_SECRET` | Better Auth signing secret |
| `NEXT_PUBLIC_API_URL` | Public API URL (baked in at build time) |
| `NEXT_PUBLIC_APP_URL` | Public web URL (baked in at build time) |

---

## Infrastructure

- **VPS** — DigitalOcean `s-1vcpu-2gb` droplet in `lon1`
- **Reverse proxy** — Caddy with automatic HTTPS via Let's Encrypt
- **State** — Terraform remote state stored in DigitalOcean Spaces

### pnpm version

pnpm is pinned via the `packageManager` field in the root `package.json`. This ensures Docker builds, CI, and local development all use the same version. If you need to upgrade pnpm:

1. Update the `packageManager` field in `package.json`
2. Run `corepack enable pnpm` and `pnpm install`
3. Commit the updated `package.json` and `pnpm-lock.yaml`

### Domains

| Domain | Service |
|---|---|
| `instantcalendar.io` | Next.js web app |
| `api.instantcalendar.io` | Hono API |