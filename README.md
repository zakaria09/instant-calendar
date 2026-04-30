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
- pnpm
- Docker (for the database)

### Local Development

1. Clone the repo and install dependencies from the root:

```bash
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

4. Run migrations:

```bash
pnpm --filter @packages/db db:migrate
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

Schema is split across three files in `packages/db/src/`:

- `auth-schema.ts` — user, session, account, verification, jwks (Better Auth core)
- `org-schema.ts` — organisation, member, invitation (Better Auth organisation plugin)
- `schema.ts` — calendars and other application tables

All three are registered in `drizzle.config.ts`.

Migrations are managed with Drizzle Kit and run automatically on every production deploy.

```bash
# Generate a new migration
pnpm --filter @packages/db db:generate

# Run migrations locally
pnpm --filter @packages/db db:migrate

# Push schema directly to the database (no migration files — useful for local dev)
pnpm --filter @packages/db db:push

# Open Drizzle Studio
pnpm --filter @packages/db db:studio
```

> **`db:push` vs `db:migrate`** — `db:push` applies your Drizzle schema directly to the database without creating migration files. It's convenient during local development when you're iterating on the schema. For production, use `db:generate` + `db:migrate` to create versioned, reviewable migration files.

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

### Domains

| Domain | Service |
|---|---|
| `instantcalendar.io` | Next.js web app |
| `api.instantcalendar.io` | Hono API |