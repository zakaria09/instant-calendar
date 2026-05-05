import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const calendars = pgTable('calendars', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const availability = pgTable('availability', {
  id: serial('id').primaryKey(),
  calendarId: integer('calendar_id')
    .notNull()
    .references(() => calendars.id, { onDelete: 'cascade' }),
  day: text('day').notNull(), // 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
  startTime: text('start_time').notNull(), // '09:00' (HH:mm, 24hr)
  endTime: text('end_time').notNull(), // '17:00'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})