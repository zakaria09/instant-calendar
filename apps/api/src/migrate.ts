import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import path from 'path'

async function runMigrations() {
  console.log('Running migrations...')
  const db = drizzle(process.env.DATABASE_URL!)

  await migrate(db, {
    migrationsFolder: path.join(process.cwd(), 'packages/db/drizzle'),
  })

  console.log('Migrations complete')
  process.exit(0)
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})