
import { db } from '../db';
import { recipesTable } from '../db/schema';
import { type CreateRecipeInput, type Recipe } from '../schema';

export const createRecipe = async (input: CreateRecipeInput): Promise<Recipe> => {
  try {
    // Insert recipe record
    const result = await db.insert(recipesTable)
      .values({
        name: input.name,
        description: input.description,
        ingredients: input.ingredients,
        instructions: input.instructions,
        prep_time_minutes: input.prep_time_minutes,
        servings: input.servings
      })
      .returning()
      .execute();

    // Return the created recipe
    const recipe = result[0];
    return {
      ...recipe,
      // Ensure JSON fields are properly typed
      ingredients: recipe.ingredients as string[],
      instructions: recipe.instructions as string[]
    };
  } catch (error) {
    console.error('Recipe creation failed:', error);
    throw error;
  }
};
