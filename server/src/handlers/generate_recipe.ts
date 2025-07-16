
import { type GenerateRecipeInput, type Recipe } from '../schema';

// Base ingredients categorized by nutritional value and dog safety
const BASE_INGREDIENTS = {
  proteins: ['quinoa', 'lentils', 'chickpeas', 'hemp seeds', 'chia seeds'],
  vegetables: ['sweet potato', 'carrots', 'green beans', 'peas', 'broccoli', 'spinach', 'zucchini'],
  healthy_fats: ['coconut oil', 'flaxseed oil', 'sunflower oil'],
  supplements: ['pumpkin puree', 'blueberries', 'apple (no seeds)', 'oats']
};

// Ingredients to avoid for dogs (even if vegan)
const AVOID_INGREDIENTS = ['onion', 'garlic', 'grape', 'raisin', 'avocado', 'chocolate'];

// Recipe templates with different cooking methods
const COOKING_METHODS = [
  {
    name: 'Steamed Bowl',
    instructions: [
      'Wash and dice all vegetables into small, dog-appropriate pieces',
      'Steam vegetables until tender (10-15 minutes)',
      'Cook grain/protein separately according to package instructions',
      'Mix all ingredients together when cooled',
      'Add healthy fats and supplements',
      'Let cool completely before serving'
    ]
  },
  {
    name: 'Baked Medley',
    instructions: [
      'Preheat oven to 375°F (190°C)',
      'Dice vegetables into small pieces',
      'Toss vegetables with a small amount of oil',
      'Bake for 20-25 minutes until tender',
      'Cook grains separately and mix in after cooling',
      'Add supplements and let cool before serving'
    ]
  },
  {
    name: 'Slow Cooked Stew',
    instructions: [
      'Add diced vegetables and grains to slow cooker',
      'Add enough water to cover ingredients',
      'Cook on low for 4-6 hours',
      'Stir occasionally and add water if needed',
      'Mix in healthy fats and supplements when cooled',
      'Serve at room temperature'
    ]
  }
];

function getServingsForDogSize(dogSize: string): number {
  switch (dogSize) {
    case 'small': return 1;
    case 'large': return 4;
    default: return 2; // medium
  }
}

function getPrepTimeForMethod(methodIndex: number): number {
  const baseTimes = [25, 35, 45]; // Minutes for steamed, baked, slow cooked
  return baseTimes[methodIndex] || 25;
}

function selectIngredients(
  preferred: string[] = [],
  dietary_restrictions: string[] = []
): string[] {
  const selectedIngredients: string[] = [];
  
  // Filter out any avoided ingredients from all categories
  const safeIngredients = {
    proteins: BASE_INGREDIENTS.proteins.filter(ing => !AVOID_INGREDIENTS.includes(ing)),
    vegetables: BASE_INGREDIENTS.vegetables.filter(ing => !AVOID_INGREDIENTS.includes(ing)),
    healthy_fats: BASE_INGREDIENTS.healthy_fats.filter(ing => !AVOID_INGREDIENTS.includes(ing)),
    supplements: BASE_INGREDIENTS.supplements.filter(ing => !AVOID_INGREDIENTS.includes(ing))
  };
  
  // Apply dietary restrictions
  if (dietary_restrictions.length > 0) {
    Object.keys(safeIngredients).forEach(category => {
      safeIngredients[category as keyof typeof safeIngredients] = 
        safeIngredients[category as keyof typeof safeIngredients].filter(
          ing => !dietary_restrictions.some(restriction => 
            ing.toLowerCase().includes(restriction.toLowerCase())
          )
        );
    });
  }
  
  // Add preferred ingredients if they're safe
  preferred.forEach(pref => {
    const normalizedPref = pref.toLowerCase();
    if (!AVOID_INGREDIENTS.includes(normalizedPref) && 
        !dietary_restrictions.some(restriction => 
          normalizedPref.includes(restriction.toLowerCase())
        )) {
      selectedIngredients.push(pref);
    }
  });
  
  // Add base ingredients from each category
  selectedIngredients.push(
    safeIngredients.proteins[Math.floor(Math.random() * safeIngredients.proteins.length)],
    safeIngredients.vegetables[Math.floor(Math.random() * safeIngredients.vegetables.length)],
    safeIngredients.vegetables[Math.floor(Math.random() * safeIngredients.vegetables.length)],
    safeIngredients.healthy_fats[Math.floor(Math.random() * safeIngredients.healthy_fats.length)],
    safeIngredients.supplements[Math.floor(Math.random() * safeIngredients.supplements.length)]
  );
  
  // Remove duplicates and return
  return [...new Set(selectedIngredients)];
}

export async function generateRecipe(input: GenerateRecipeInput): Promise<Recipe> {
  const dogSize = input.dog_size || 'medium';
  const servings = getServingsForDogSize(dogSize);
  
  // Select cooking method randomly
  const methodIndex = Math.floor(Math.random() * COOKING_METHODS.length);
  const cookingMethod = COOKING_METHODS[methodIndex];
  
  // Generate ingredients based on preferences and restrictions
  const ingredients = selectIngredients(
    input.preferred_ingredients,
    input.dietary_restrictions
  );
  
  // Generate recipe name
  const sizeLabel = dogSize.charAt(0).toUpperCase() + dogSize.slice(1);
  const methodLabel = cookingMethod.name;
  const recipeName = `Vegan ${sizeLabel} Dog ${methodLabel}`;
  
  // Create description with dietary info
  let description = `A nutritious vegan recipe specially crafted for ${dogSize} dogs using ${cookingMethod.name.toLowerCase()} cooking method.`;
  
  if (input.dietary_restrictions && input.dietary_restrictions.length > 0) {
    description += ` Avoids: ${input.dietary_restrictions.join(', ')}.`;
  }
  
  if (input.preferred_ingredients && input.preferred_ingredients.length > 0) {
    description += ` Features preferred ingredients: ${input.preferred_ingredients.join(', ')}.`;
  }
  
  return {
    id: Math.floor(Math.random() * 1000000), // Temporary ID for generated recipes
    name: recipeName,
    description,
    ingredients,
    instructions: cookingMethod.instructions,
    prep_time_minutes: getPrepTimeForMethod(methodIndex),
    servings,
    created_at: new Date()
  };
}
