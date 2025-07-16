
import { serial, text, pgTable, timestamp, integer, json } from 'drizzle-orm/pg-core';

export const recipesTable = pgTable('recipes', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'), // Nullable by default
  ingredients: json('ingredients').$type<string[]>().notNull(), // Array of ingredient strings
  instructions: json('instructions').$type<string[]>().notNull(), // Array of instruction steps
  prep_time_minutes: integer('prep_time_minutes').notNull(),
  servings: integer('servings').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// TypeScript type for the table schema
export type Recipe = typeof recipesTable.$inferSelect; // For SELECT operations
export type NewRecipe = typeof recipesTable.$inferInsert; // For INSERT operations

// Important: Export all tables and relations for proper query building
export const tables = { recipes: recipesTable };
