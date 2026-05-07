import { pgTable, serial, text } from 'drizzle-orm/pg-core';
import { user } from './auth-schema';
import { organization } from './org-schema';

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
});