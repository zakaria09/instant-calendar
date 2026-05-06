import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as scheduleSchema from './schedule-schema'
import * as authSchema from './auth-schema'
import * as orgSchema from './org-schema'
import * as servicesSchema from './services-schema'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
})

const fullSchema = {
  ...scheduleSchema,
  ...authSchema,
  ...orgSchema,
  ...servicesSchema,
}

export const db = drizzle(pool, { schema: fullSchema })

export * from './schedule-schema'
export * from './auth-schema'
export * from './org-schema'
export * from './services-schema'

export { scheduleSchema as appSchema, authSchema, orgSchema, fullSchema, servicesSchema } 
