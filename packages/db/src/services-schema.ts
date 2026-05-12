import { user } from './auth-schema';
import { organization } from './org-schema';
import { pgTable, serial, text, integer, decimal } from 'drizzle-orm/pg-core';

export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  duration: integer('duration').notNull(), // minutes
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
});