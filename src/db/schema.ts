import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  status: text('status').notNull().default('Planning'),
  progress: integer('progress').notNull().default(0),
  description: text('description'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const teamMembers = sqliteTable('team_members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: text('role'),
  createdAt: text('created_at').notNull(),
});

export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id),
  name: text('name').notNull(),
  status: text('status').notNull().default('incomplete'),
  assignedTo: integer('assigned_to').references(() => teamMembers.id),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});