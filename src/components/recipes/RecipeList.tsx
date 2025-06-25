import React, { useState } from 'react';
import { Clock, Users, ChefHat, Search, Filter, Star } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Recipe } from '../../types';

export const RecipeList: React.FC = () => {
  const { recipes, getRecipeRecommendations, foodItems } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showRecommendations, setShowRecommendations] = useState(true);
  
  const recommendations = getRecipeRecommendations();
  const availableIngredients = foodItems
    .filter(item => !item.isConsumed && item.quantity > 0)
    .map(item => item.name.toLowerCase());

  const filteredRecipes = (showRecommendations ? recommendations : recipes).filter(recipe => {
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recipe Suggestions</h1>
          <p className="text-gray-600 mt-1">Discover recipes based on your available ingredients</p>
        </div>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showRecommendations}
              onChange={(e) => setShowRecommendations(e.target.checked)}
              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm text-gray-700">Show recommendations only</span>
          </label>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Recipe Cards */}
      {filteredRecipes.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <ChefHat className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes found</h3>
          <p className="text-gray-600 mb-4">
            {availableIngredients.length === 0 
              ? "Add some food items to your inventory to get personalized recipe recommendations!" 
              : "Try adjusting your search terms or filters."
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => {
            const matchingIngredients = getMatchingIngredients(recipe);
            const matchPercentage = (matchingIngredients.length / recipe.ingredients.length) * 100;
            
            return (
              <div key={recipe.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                {recipe.image && (
                  <div className="h-48 bg-gray-200">
                    <img
                      src={recipe.image}
                      alt={recipe.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{recipe.name}</h3>
                      <p className="text-sm text-gray-600">{recipe.description}</p>
                    </div>
                    {matchingIngredients.length > 0 && (
                      <div className="flex items-center px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                        <Star className="h-3 w-3 mr-1" />
                        {Math.round(matchPercentage)}% match
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {recipe.prepTime + recipe.cookTime} min
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {recipe.servings} servings
                    </div>
                    <div className="px-2 py-1 bg-gray-100 rounded text-xs capitalize">
                      {recipe.category}
                    </div>
                  </div>
                  
                  {matchingIngredients.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-900 mb-2">
                        Available ingredients ({matchingIngredients.length}/{recipe.ingredients.length}):
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {recipe.ingredients.slice(0, 6).map((ingredient, index) => {
                          const isAvailable = matchingIngredients.includes(ingredient);
                          return (
                            <span
                              key={index}
                              className={`px-2 py-1 rounded text-xs ${
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
                          <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
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
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                          >
                            {restriction}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <button className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors font-medium">
                    View Recipe
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};