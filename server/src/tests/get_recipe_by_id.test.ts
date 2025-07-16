
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { recipesTable } from '../db/schema';
import { getRecipeById } from '../handlers/get_recipe_by_id';
import { type CreateRecipeInput } from '../schema';

const testRecipe: CreateRecipeInput = {
  name: 'Chicken and Rice Bowl',
  description: 'A healthy meal for medium dogs',
  ingredients: ['chicken breast', 'brown rice', 'carrots', 'peas'],
  instructions: ['Cook chicken', 'Boil rice', 'Steam vegetables', 'Mix ingredients'],
  prep_time_minutes: 30,
  servings: 4
};

describe('getRecipeById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return recipe when found', async () => {
    // Create a recipe first
    const insertResult = await db.insert(recipesTable)
      .values(testRecipe)
      .returning()
      .execute();

    const createdRecipe = insertResult[0];

    // Get the recipe by ID
    const result = await getRecipeById(createdRecipe.id);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdRecipe.id);
    expect(result!.name).toEqual('Chicken and Rice Bowl');
    expect(result!.description).toEqual('A healthy meal for medium dogs');
    expect(result!.ingredients).toEqual(['chicken breast', 'brown rice', 'carrots', 'peas']);
    expect(result!.instructions).toEqual(['Cook chicken', 'Boil rice', 'Steam vegetables', 'Mix ingredients']);
    expect(result!.prep_time_minutes).toEqual(30);
    expect(result!.servings).toEqual(4);
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should return null when recipe not found', async () => {
    const result = await getRecipeById(999);

    expect(result).toBeNull();
  });

  it('should handle recipe with null description', async () => {
    // Create recipe with null description
    const recipeWithNullDesc = {
      ...testRecipe,
      description: null
    };

    const insertResult = await db.insert(recipesTable)
      .values(recipeWithNullDesc)
      .returning()
      .execute();

    const createdRecipe = insertResult[0];

    const result = await getRecipeById(createdRecipe.id);

    expect(result).not.toBeNull();
    expect(result!.description).toBeNull();
    expect(result!.name).toEqual('Chicken and Rice Bowl');
    expect(result!.ingredients).toEqual(['chicken breast', 'brown rice', 'carrots', 'peas']);
  });

  it('should return recipe with correct array types', async () => {
    const insertResult = await db.insert(recipesTable)
      .values(testRecipe)
      .returning()
      .execute();

    const createdRecipe = insertResult[0];

    const result = await getRecipeById(createdRecipe.id);

    expect(result).not.toBeNull();
    expect(Array.isArray(result!.ingredients)).toBe(true);
    expect(Array.isArray(result!.instructions)).toBe(true);
    expect(result!.ingredients.length).toEqual(4);
    expect(result!.instructions.length).toEqual(4);
  });
});
