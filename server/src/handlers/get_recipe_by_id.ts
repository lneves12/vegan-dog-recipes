
import { db } from '../db';
import { recipesTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type Recipe } from '../schema';

export async function getRecipeById(id: number): Promise<Recipe | null> {
  try {
    const result = await db.select()
      .from(recipesTable)
      .where(eq(recipesTable.id, id))
      .execute();

    if (result.length === 0) {
      return null;
    }

    const recipe = result[0];
    return {
      ...recipe,
      created_at: recipe.created_at // Already a Date object from timestamp column
    };
  } catch (error) {
    console.error('Recipe retrieval failed:', error);
    throw error;
  }
}
