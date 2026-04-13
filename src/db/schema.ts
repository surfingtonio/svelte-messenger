import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  first: text('first').notNull(),
  last: text('last').notNull(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  roles: text('roles').notNull().default('["user"]'),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
});

export type DbUser = typeof users.$inferSelect;
export type NewDbUser = typeof users.$inferInsert;
