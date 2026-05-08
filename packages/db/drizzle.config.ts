import { defineConfig } from 'drizzle-kit'
import * as dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
  schema: ['./src/schedule-schema.ts', './src/auth-schema.ts', './src/org-schema.ts', './src/services-schema.ts'],
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL! + '?connect_timeout=10',
  },
})