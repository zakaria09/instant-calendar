import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const calendars = pgTable('calendars', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})