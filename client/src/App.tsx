
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/utils/trpc';
import { useState } from 'react';
import type { Recipe, GenerateRecipeInput } from '../../server/src/schema';

function App() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<GenerateRecipeInput>({
    dog_size: undefined,
    dietary_restrictions: [],
    preferred_ingredients: []
  });

  const handleGenerateRecipe = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const newRecipe = await trpc.generateRecipe.mutate(formData);
      setRecipe(newRecipe);
    } catch (err) {
      setError('Failed to generate recipe. Please try again.');
      console.error('Failed to generate recipe:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDietaryRestrictionToggle = (restriction: string) => {
    setFormData((prev: GenerateRecipeInput) => ({
      ...prev,
      dietary_restrictions: prev.dietary_restrictions?.includes(restriction)
        ? prev.dietary_restrictions.filter(r => r !== restriction)
        : [...(prev.dietary_restrictions || []), restriction]
    }));
  };

  const handlePreferredIngredientToggle = (ingredient: string) => {
    setFormData((prev: GenerateRecipeInput) => ({
      ...prev,
      preferred_ingredients: prev.preferred_ingredients?.includes(ingredient)
        ? prev.preferred_ingredients.filter(i => i !== ingredient)
        : [...(prev.preferred_ingredients || []), ingredient]
    }));
  };

  const commonDietaryRestrictions = [
    'grain-free',
    'soy-free',
    'nut-free',
    'low-protein',
    'low-fat'
  ];

  const commonIngredients = [
    'sweet potato',
    'carrots',
    'pumpkin',
    'quinoa',
    'spinach',
    'blueberries',
    'coconut oil',
    'chickpeas'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🐕 Vegan Dog Recipe Generator 🌱
          </h1>
          <p className="text-lg text-gray-600">
            Create healthy, plant-based meals for your furry friend!
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Recipe Generator Form */}
          <Card className="border-2 border-green-200 shadow-lg">
            <CardHeader className="bg-green-100">
              <CardTitle className="text-green-800">🍽️ Recipe Preferences</CardTitle>
              <CardDescription>
                Tell us about your dog to generate a personalized recipe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dog Size
                </label>
                <Select 
                  value={formData.dog_size || ''} 
                  onValueChange={(value: 'small' | 'medium' | 'large') => 
                    setFormData((prev: GenerateRecipeInput) => ({ ...prev, dog_size: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your dog's size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (under 25 lbs)</SelectItem>
                    <SelectItem value="medium">Medium (25-60 lbs)</SelectItem>
                    <SelectItem value="large">Large (over 60 lbs)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dietary Restrictions
                </label>
                <div className="flex flex-wrap gap-2">
                  {commonDietaryRestrictions.map((restriction) => (
                    <Badge
                      key={restriction}
                      variant={formData.dietary_restrictions?.includes(restriction) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-green-100"
                      onClick={() => handleDietaryRestrictionToggle(restriction)}
                    >
                      {restriction}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Ingredients
                </label>
                <div className="flex flex-wrap gap-2">
                  {commonIngredients.map((ingredient) => (
                    <Badge
                      key={ingredient}
                      variant={formData.preferred_ingredients?.includes(ingredient) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-blue-100"
                      onClick={() => handlePreferredIngredientToggle(ingredient)}
                    >
                      {ingredient}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleGenerateRecipe}
                disabled={isGenerating}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                {isGenerating ? '🔄 Generating Recipe...' : '🎲 Generate New Recipe'}
              </Button>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Recipe Display */}
          <Card className="border-2 border-blue-200 shadow-lg">
            <CardHeader className="bg-blue-100">
              <CardTitle className="text-blue-800">📋 Your Recipe</CardTitle>
              <CardDescription>
                Fresh recipe generated just for your pup!
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {recipe ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {recipe.name}
                    </h3>
                    {recipe.description && (
                      <p className="text-gray-600 mb-4">{recipe.description}</p>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <span className="text-sm font-medium text-orange-800">⏱️ Prep Time</span>
                        <p className="text-orange-700">{recipe.prep_time_minutes} minutes</p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <span className="text-sm font-medium text-purple-800">🍽️ Servings</span>
                        <p className="text-purple-700">{recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">
                      🥕 Ingredients
                    </h4>
                    <ul className="space-y-2">
                      {recipe.ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-center text-gray-700">
                          <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                          {ingredient}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">
                      👨‍🍳 Instructions
                    </h4>
                    <ol className="space-y-3">
                      {recipe.instructions.map((instruction, index) => (
                        <li key={index} className="flex items-start text-gray-700">
                          <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5 flex-shrink-0">
                            {index + 1}
                          </span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-lg mt-4">
                    <p className="text-sm text-yellow-800">
                      ⚠️ <strong>Safety Note:</strong> Always consult with your veterinarian before introducing new foods to your dog's diet.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🐕</div>
                  <p className="text-gray-500">
                    Click "Generate New Recipe" to create a delicious vegan meal for your dog!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            🌱 All recipes are plant-based and designed with your dog's health in mind
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
