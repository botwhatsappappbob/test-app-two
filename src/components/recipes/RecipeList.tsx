import React, { useState, useEffect } from 'react';
import { Clock, Users, ChefHat, Search, Filter, Star, Sparkles, ArrowRight } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Recipe } from '../../types';
import { recipesAPI } from '../../lib/api';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { useApi } from '../../hooks/useApi';

export const RecipeList: React.FC = () => {
  const { foodItems } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  
  const {
    data: recipes,
    isLoading: recipesLoading,
    error: recipesError,
    execute: fetchRecipes
  } = useApi<Recipe[]>(recipesAPI.getAll);

  const {
    data: recommendations,
    isLoading: recommendationsLoading,
    error: recommendationsError,
    execute: fetchRecommendations
  } = useApi<Recipe[]>(recipesAPI.getRecommendations);

  useEffect(() => {
    fetchRecipes();
    fetchRecommendations();
  }, []);

  const availableIngredients = foodItems
    .filter(item => !item.isConsumed && item.quantity > 0)
    .map(item => item.name.toLowerCase());

  const displayedRecipes = showRecommendations ? (recommendations || []) : (recipes || []);
  
  const filteredRecipes = displayedRecipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || recipe.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getMatchingIngredients = (recipe: Recipe) => {
    return recipe.ingredients.filter(ingredient =>
      availableIngredients.some(available =>
        available.includes(ingredient.toLowerCase()) || 
        ingredient.toLowerCase().includes(available)
      )
    );
  };

  const categories = ['all', 'breakfast', 'lunch', 'dinner', 'snack', 'dessert'];

  const isLoading = showRecommendations ? recommendationsLoading : recipesLoading;
  const error = showRecommendations ? recommendationsError : recipesError;

  const handleRefresh = () => {
    fetchRecipes();
    fetchRecommendations();
  };

  const RecipeModal = ({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {recipe.image && (
          <div className="h-64 bg-gray-200">
            <img
              src={recipe.image}
              alt={recipe.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{recipe.name}</h2>
              <p className="text-gray-600 text-lg">{recipe.description}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              ×
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Instructions</h3>
              <ol className="space-y-3">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>
            
            <div>
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recipe Info</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Prep Time:</span>
                    <span className="font-medium">{recipe.prepTime} min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Cook Time:</span>
                    <span className="font-medium">{recipe.cookTime} min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Servings:</span>
                    <span className="font-medium">{recipe.servings}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Cuisine:</span>
                    <span className="font-medium">{recipe.cuisine}</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingredients</h3>
                <div className="space-y-2">
                  {recipe.ingredients.map((ingredient, index) => {
                    const isAvailable = getMatchingIngredients(recipe).includes(ingredient);
                    return (
                      <div
                        key={index}
                        className={`flex items-center p-2 rounded ${
                          isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-600'
                        }`}
                      >
                        <span className="mr-2">
                          {isAvailable ? '✓' : '○'}
                        </span>
                        {ingredient}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {recipe.dietaryRestrictions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Dietary Info</h3>
                  <div className="flex flex-wrap gap-2">
                    {recipe.dietaryRestrictions.map((restriction, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {restriction}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" text="Loading recipes..." className="py-16" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorMessage message={error} onRetry={handleRefresh} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recipe Suggestions</h1>
          <p className="text-gray-600 mt-2">Discover delicious recipes based on your available ingredients</p>
        </div>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-3 px-4 py-2 bg-white border border-gray-200 rounded-lg">
            <input
              type="checkbox"
              checked={showRecommendations}
              onChange={(e) => setShowRecommendations(e.target.checked)}
              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm text-gray-700 font-medium flex items-center">
              <Sparkles className="h-4 w-4 mr-1 text-emerald-600" />
              Smart Recommendations
            </span>
          </label>
        </div>
      </div>

      {/* Smart Recommendations Banner */}
      {showRecommendations && recommendations && recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Sparkles className="h-6 w-6 text-emerald-600 mr-2" />
                Smart Recommendations
              </h2>
              <p className="text-gray-600 mt-1">
                Based on {availableIngredients.length} ingredients in your inventory
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-emerald-600">{recommendations.length}</div>
              <div className="text-sm text-gray-600">recipes found</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Available ingredients:</span>
            <span className="font-semibold text-emerald-600">{availableIngredients.length}</span>
          </div>
        </div>
      </div>

      {/* Recipe Cards */}
      {filteredRecipes.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <ChefHat className="h-16 w-16 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            {availableIngredients.length === 0 ? "No ingredients available" : "No recipes found"}
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {availableIngredients.length === 0 
              ? "Add some food items to your inventory to get personalized recipe recommendations!" 
              : "Try adjusting your search terms or filters to find recipes."
            }
          </p>
          {availableIngredients.length === 0 && (
            <button className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
              <ArrowRight className="h-5 w-5 mr-2" />
              Go to Inventory
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => {
            const matchingIngredients = getMatchingIngredients(recipe);
            const matchPercentage = recipe.matchScore ? recipe.matchScore * 100 : 
              (matchingIngredients.length / recipe.ingredients.length) * 100;
            
            return (
              <div key={recipe.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                {recipe.image && (
                  <div className="h-48 bg-gray-200 relative overflow-hidden">
                    <img
                      src={recipe.image}
                      alt={recipe.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    {matchingIngredients.length > 0 && (
                      <div className="absolute top-4 right-4">
                        <div className="flex items-center px-3 py-1 bg-white bg-opacity-95 backdrop-blur-sm text-emerald-700 rounded-full text-sm font-bold shadow-lg">
                          <Star className="h-4 w-4 mr-1 fill-current" />
                          {Math.round(matchPercentage)}% match
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{recipe.name}</h3>
                      <p className="text-gray-600 text-sm">{recipe.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {recipe.prepTime + recipe.cookTime} min
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {recipe.servings} servings
                    </div>
                    <div className="px-2 py-1 bg-gray-100 rounded text-xs capitalize font-medium">
                      {recipe.category}
                    </div>
                  </div>
                  
                  {matchingIngredients.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm font-semibold text-gray-900 mb-2">
                        You have {matchingIngredients.length} of {recipe.ingredients.length} ingredients:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {recipe.ingredients.slice(0, 6).map((ingredient, index) => {
                          const isAvailable = matchingIngredients.includes(ingredient);
                          return (
                            <span
                              key={index}
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                isAvailable 
                                  ? 'bg-emerald-100 text-emerald-700' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {ingredient}
                            </span>
                          );
                        })}
                        {recipe.ingredients.length > 6 && (
                          <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600 font-medium">
                            +{recipe.ingredients.length - 6} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {recipe.dietaryRestrictions.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {recipe.dietaryRestrictions.map((restriction, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                          >
                            {restriction}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <button 
                    onClick={() => setSelectedRecipe(recipe)}
                    className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 transition-colors font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    View Full Recipe
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recipe Modal */}
      {selectedRecipe && (
        <RecipeModal 
          recipe={selectedRecipe} 
          onClose={() => setSelectedRecipe(null)} 
        />
      )}

      {/* Tips for better recommendations */}
      {availableIngredients.length > 0 && showRecommendations && (!recommendations || recommendations.length === 0) && (
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
          <div className="flex items-start">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <ChefHat className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No matching recipes found</h3>
              <p className="text-gray-600 mb-4">
                Try adding more common ingredients to your inventory, or browse all recipes to discover new dishes!
              </p>
              <button
                onClick={() => setShowRecommendations(false)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Browse All Recipes →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};