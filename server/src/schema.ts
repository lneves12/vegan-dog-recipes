
import { z } from 'zod';

// Recipe schema
export const recipeSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
  prep_time_minutes: z.number().int(),
  servings: z.number().int(),
  created_at: z.coerce.date()
});

export type Recipe = z.infer<typeof recipeSchema>;

// Input schema for generating recipes
export const generateRecipeInputSchema = z.object({
  dog_size: z.enum(['small', 'medium', 'large']).optional(),
  dietary_restrictions: z.array(z.string()).optional(),
  preferred_ingredients: z.array(z.string()).optional()
});

export type GenerateRecipeInput = z.infer<typeof generateRecipeInputSchema>;

// Input schema for creating recipes (for seeding/admin purposes)
export const createRecipeInputSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
  prep_time_minutes: z.number().int().positive(),
  servings: z.number().int().positive()
});

export type CreateRecipeInput = z.infer<typeof createRecipeInputSchema>;
