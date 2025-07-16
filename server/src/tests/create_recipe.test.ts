
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { recipesTable } from '../db/schema';
import { type CreateRecipeInput } from '../schema';
import { createRecipe } from '../handlers/create_recipe';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateRecipeInput = {
  name: 'Chicken and Rice Bowl',
  description: 'A simple and nutritious meal for dogs',
  ingredients: ['chicken breast', 'brown rice', 'carrots', 'green beans'],
  instructions: ['Cook chicken thoroughly', 'Boil rice until tender', 'Steam vegetables', 'Mix all ingredients when cooled'],
  prep_time_minutes: 30,
  servings: 4
};

describe('createRecipe', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a recipe', async () => {
    const result = await createRecipe(testInput);

    // Basic field validation
    expect(result.name).toEqual('Chicken and Rice Bowl');
    expect(result.description).toEqual(testInput.description);
    expect(result.ingredients).toEqual(['chicken breast', 'brown rice', 'carrots', 'green beans']);
    expect(result.instructions).toEqual(['Cook chicken thoroughly', 'Boil rice until tender', 'Steam vegetables', 'Mix all ingredients when cooled']);
    expect(result.prep_time_minutes).toEqual(30);
    expect(result.servings).toEqual(4);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save recipe to database', async () => {
    const result = await createRecipe(testInput);

    // Query using proper drizzle syntax
    const recipes = await db.select()
      .from(recipesTable)
      .where(eq(recipesTable.id, result.id))
      .execute();

    expect(recipes).toHaveLength(1);
    expect(recipes[0].name).toEqual('Chicken and Rice Bowl');
    expect(recipes[0].description).toEqual(testInput.description);
    expect(recipes[0].ingredients).toEqual(['chicken breast', 'brown rice', 'carrots', 'green beans']);
    expect(recipes[0].instructions).toEqual(['Cook chicken thoroughly', 'Boil rice until tender', 'Steam vegetables', 'Mix all ingredients when cooled']);
    expect(recipes[0].prep_time_minutes).toEqual(30);
    expect(recipes[0].servings).toEqual(4);
    expect(recipes[0].created_at).toBeInstanceOf(Date);
  });

  it('should create recipe with null description', async () => {
    const inputWithNullDescription: CreateRecipeInput = {
      ...testInput,
      description: null
    };

    const result = await createRecipe(inputWithNullDescription);

    expect(result.description).toBeNull();
    expect(result.name).toEqual(testInput.name);
    expect(result.ingredients).toEqual(testInput.ingredients);
    expect(result.instructions).toEqual(testInput.instructions);
  });

  it('should handle empty ingredient and instruction arrays', async () => {
    const inputWithEmptyArrays: CreateRecipeInput = {
      ...testInput,
      ingredients: [],
      instructions: []
    };

    const result = await createRecipe(inputWithEmptyArrays);

    expect(result.ingredients).toEqual([]);
    expect(result.instructions).toEqual([]);
    expect(result.name).toEqual(testInput.name);
    expect(result.prep_time_minutes).toEqual(testInput.prep_time_minutes);
    expect(result.servings).toEqual(testInput.servings);
  });

  it('should handle complex ingredient and instruction arrays', async () => {
    const complexInput: CreateRecipeInput = {
      name: 'Advanced Dog Meal',
      description: 'Complex recipe with many steps',
      ingredients: [
        'organic chicken breast (2 lbs)',
        'sweet potato (1 large)',
        'spinach (1 cup chopped)',
        'coconut oil (1 tbsp)',
        'bone broth (2 cups)'
      ],
      instructions: [
        'Preheat oven to 375°F',
        'Cut chicken into 1-inch cubes',
        'Dice sweet potato into small pieces',
        'Toss chicken and sweet potato with coconut oil',
        'Bake for 25 minutes until chicken is cooked through',
        'Steam spinach until wilted',
        'Combine all ingredients with bone broth',
        'Let cool to room temperature before serving'
      ],
      prep_time_minutes: 45,
      servings: 6
    };

    const result = await createRecipe(complexInput);

    expect(result.ingredients).toHaveLength(5);
    expect(result.instructions).toHaveLength(8);
    expect(result.ingredients[0]).toEqual('organic chicken breast (2 lbs)');
    expect(result.instructions[0]).toEqual('Preheat oven to 375°F');
    expect(result.prep_time_minutes).toEqual(45);
    expect(result.servings).toEqual(6);
  });
});
