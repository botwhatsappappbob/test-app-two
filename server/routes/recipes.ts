import express from 'express';
import { db } from '../config/database.js';
import { optionalAuth, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get all recipes
router.get('/', optionalAuth, (req: AuthRequest, res) => {
  try {
    const recipes = db.prepare('SELECT * FROM recipes ORDER BY name ASC').all();

    const formattedRecipes = recipes.map((recipe: any) => ({
      ...recipe,
      ingredients: JSON.parse(recipe.ingredients),
      instructions: JSON.parse(recipe.instructions),
      dietaryRestrictions: JSON.parse(recipe.dietary_restrictions),
      image: recipe.image_url
    }));

    res.json({ data: formattedRecipes });
  } catch (error) {
    console.error('Get recipes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recipe recommendations based on user's inventory
router.get('/recommendations', optionalAuth, (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.json({ data: [] }); // Return empty array if not authenticated
    }

    // Get user's available ingredients
    const userIngredients = db.prepare(`
      SELECT LOWER(name) as ingredient FROM food_items 
      WHERE user_id = ? AND is_consumed = FALSE AND quantity > 0
    `).all(req.user.id);

    const availableIngredients = userIngredients.map((item: any) => item.ingredient);

    if (availableIngredients.length === 0) {
      return res.json({ data: [] });
    }

    // Get all recipes
    const recipes = db.prepare('SELECT * FROM recipes').all();

    // Filter and score recipes based on available ingredients
    const scoredRecipes = recipes.map((recipe: any) => {
      const recipeIngredients = JSON.parse(recipe.ingredients).map((ing: string) => ing.toLowerCase());
      
      const matchingIngredients = recipeIngredients.filter((ingredient: string) =>
        availableIngredients.some((available: string) =>
          available.includes(ingredient) || ingredient.includes(available)
        )
      );

      const matchScore = matchingIngredients.length / recipeIngredients.length;

      return {
        ...recipe,
        ingredients: JSON.parse(recipe.ingredients),
        instructions: JSON.parse(recipe.instructions),
        dietaryRestrictions: JSON.parse(recipe.dietary_restrictions),
        image: recipe.image_url,
        matchScore,
        matchingIngredients: matchingIngredients.length
      };
    })
    .filter((recipe: any) => recipe.matchingIngredients > 0)
    .sort((a: any, b: any) => b.matchScore - a.matchScore);

    res.json({ data: scoredRecipes });
  } catch (error) {
    console.error('Get recipe recommendations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single recipe
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(id);

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const formattedRecipe = {
      ...recipe,
      ingredients: JSON.parse(recipe.ingredients),
      instructions: JSON.parse(recipe.instructions),
      dietaryRestrictions: JSON.parse(recipe.dietary_restrictions),
      image: recipe.image_url
    };

    res.json({ data: formattedRecipe });
  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;