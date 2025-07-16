
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { type GenerateRecipeInput } from '../schema';
import { generateRecipe } from '../handlers/generate_recipe';

describe('generateRecipe', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should generate a recipe with default values', async () => {
    const input: GenerateRecipeInput = {};
    
    const result = await generateRecipe(input);
    
    // Verify basic structure
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.name).toBeDefined();
    expect(typeof result.name).toBe('string');
    expect(result.description).toBeDefined();
    expect(result.ingredients).toBeInstanceOf(Array);
    expect(result.instructions).toBeInstanceOf(Array);
    expect(typeof result.prep_time_minutes).toBe('number');
    expect(typeof result.servings).toBe('number');
    expect(result.created_at).toBeInstanceOf(Date);
    
    // Verify default values
    expect(result.servings).toBe(2); // medium dog default
    expect(result.prep_time_minutes).toBeGreaterThan(0);
    expect(result.ingredients.length).toBeGreaterThan(0);
    expect(result.instructions.length).toBeGreaterThan(0);
  });

  it('should adjust servings based on dog size', async () => {
    const smallDogInput: GenerateRecipeInput = { dog_size: 'small' };
    const mediumDogInput: GenerateRecipeInput = { dog_size: 'medium' };
    const largeDogInput: GenerateRecipeInput = { dog_size: 'large' };
    
    const smallResult = await generateRecipe(smallDogInput);
    const mediumResult = await generateRecipe(mediumDogInput);
    const largeResult = await generateRecipe(largeDogInput);
    
    expect(smallResult.servings).toBe(1);
    expect(mediumResult.servings).toBe(2);
    expect(largeResult.servings).toBe(4);
    
    // Verify names reflect dog size
    expect(smallResult.name).toMatch(/Small/);
    expect(mediumResult.name).toMatch(/Medium/);
    expect(largeResult.name).toMatch(/Large/);
  });

  it('should include preferred ingredients when specified', async () => {
    const input: GenerateRecipeInput = {
      preferred_ingredients: ['sweet potato', 'quinoa']
    };
    
    const result = await generateRecipe(input);
    
    // Should include preferred ingredients
    expect(result.ingredients).toContain('sweet potato');
    expect(result.ingredients).toContain('quinoa');
    
    // Should mention preferred ingredients in description
    expect(result.description).toMatch(/preferred ingredients/i);
    expect(result.description).toMatch(/sweet potato/);
    expect(result.description).toMatch(/quinoa/);
  });

  it('should exclude ingredients based on dietary restrictions', async () => {
    const input: GenerateRecipeInput = {
      dietary_restrictions: ['quinoa', 'chickpeas']
    };
    
    const result = await generateRecipe(input);
    
    // Should not include restricted ingredients
    expect(result.ingredients).not.toContain('quinoa');
    expect(result.ingredients).not.toContain('chickpeas');
    
    // Should mention dietary restrictions in description
    expect(result.description).toMatch(/avoids/i);
    expect(result.description).toMatch(/quinoa/);
    expect(result.description).toMatch(/chickpeas/);
  });

  it('should generate different recipes on multiple calls', async () => {
    const input: GenerateRecipeInput = { dog_size: 'medium' };
    
    const result1 = await generateRecipe(input);
    const result2 = await generateRecipe(input);
    
    // Should have different IDs
    expect(result1.id).not.toBe(result2.id);
    
    // May have different names, ingredients, or cooking methods
    const isDifferent = 
      result1.name !== result2.name ||
      JSON.stringify(result1.ingredients) !== JSON.stringify(result2.ingredients) ||
      result1.prep_time_minutes !== result2.prep_time_minutes;
    
    expect(isDifferent).toBe(true);
  });

  it('should handle complex input with multiple preferences and restrictions', async () => {
    const input: GenerateRecipeInput = {
      dog_size: 'large',
      preferred_ingredients: ['sweet potato', 'carrots', 'peas'],
      dietary_restrictions: ['lentils', 'hemp']
    };
    
    const result = await generateRecipe(input);
    
    // Verify size-based servings
    expect(result.servings).toBe(4);
    
    // Should include some preferred ingredients
    const hasPreferred = input.preferred_ingredients!.some(pref => 
      result.ingredients.includes(pref)
    );
    expect(hasPreferred).toBe(true);
    
    // Should exclude restricted ingredients
    expect(result.ingredients).not.toContain('lentils');
    expect(result.ingredients.every(ing => !ing.includes('hemp'))).toBe(true);
    
    // Should have comprehensive description
    expect(result.description).toMatch(/large dogs/i);
    expect(result.description).toMatch(/avoids/i);
    expect(result.description).toMatch(/preferred ingredients/i);
  });

  it('should always generate safe ingredients for dogs', async () => {
    const input: GenerateRecipeInput = {
      preferred_ingredients: ['onion', 'garlic', 'grape'] // Unsafe for dogs
    };
    
    const result = await generateRecipe(input);
    
    // Should not include any unsafe ingredients
    const unsafeIngredients = ['onion', 'garlic', 'grape', 'raisin', 'avocado', 'chocolate'];
    unsafeIngredients.forEach(unsafe => {
      expect(result.ingredients).not.toContain(unsafe);
    });
    
    // Should still have valid ingredients
    expect(result.ingredients.length).toBeGreaterThan(0);
  });

  it('should generate valid cooking instructions', async () => {
    const input: GenerateRecipeInput = { dog_size: 'small' };
    
    const result = await generateRecipe(input);
    
    // Should have multiple instruction steps
    expect(result.instructions.length).toBeGreaterThanOrEqual(3);
    
    // Each instruction should be a non-empty string
    result.instructions.forEach(instruction => {
      expect(typeof instruction).toBe('string');
      expect(instruction.length).toBeGreaterThan(0);
    });
    
    // Should include cooling step for dog safety
    const hasCoolingStep = result.instructions.some(instruction => 
      instruction.toLowerCase().includes('cool')
    );
    expect(hasCoolingStep).toBe(true);
  });
});
