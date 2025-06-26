import Database from 'better-sqlite3';
import { join } from 'path';

const dbPath = process.env.DATABASE_URL || join(process.cwd(), 'database.sqlite');
export const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database tables
export const initializeDatabase = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      user_type TEXT CHECK(user_type IN ('household', 'business')) NOT NULL,
      subscription_plan TEXT CHECK(subscription_plan IN ('free', 'premium')) DEFAULT 'free',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Food items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS food_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      purchase_date DATETIME NOT NULL,
      expiration_date DATETIME NOT NULL,
      storage_location TEXT NOT NULL,
      cost REAL,
      barcode TEXT,
      is_consumed BOOLEAN DEFAULT FALSE,
      consumed_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Recipes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS recipes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      ingredients TEXT NOT NULL, -- JSON array
      instructions TEXT NOT NULL, -- JSON array
      prep_time INTEGER NOT NULL,
      cook_time INTEGER NOT NULL,
      servings INTEGER NOT NULL,
      category TEXT NOT NULL,
      cuisine TEXT NOT NULL,
      dietary_restrictions TEXT NOT NULL, -- JSON array
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Food banks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS food_banks (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      accepted_items TEXT NOT NULL, -- JSON array
      operating_hours TEXT NOT NULL,
      website TEXT,
      country TEXT NOT NULL,
      city TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Donations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS donations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      food_items TEXT NOT NULL, -- JSON array of food item IDs
      recipient_organization TEXT NOT NULL,
      pickup_date DATETIME NOT NULL,
      status TEXT CHECK(status IN ('pending', 'confirmed', 'completed', 'cancelled')) DEFAULT 'pending',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Notification settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notification_settings (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      expiration_alerts BOOLEAN DEFAULT TRUE,
      alert_days_before INTEGER DEFAULT 3,
      recipe_recommendations BOOLEAN DEFAULT TRUE,
      donation_reminders BOOLEAN DEFAULT TRUE,
      weekly_reports BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_food_items_user_id ON food_items(user_id);
    CREATE INDEX IF NOT EXISTS idx_food_items_expiration ON food_items(expiration_date);
    CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
    CREATE INDEX IF NOT EXISTS idx_food_banks_country_city ON food_banks(country, city);
  `);

  console.log('Database initialized successfully');
};

// Seed initial data
export const seedDatabase = () => {
  // Check if recipes already exist
  const recipeCount = db.prepare('SELECT COUNT(*) as count FROM recipes').get() as { count: number };
  
  if (recipeCount.count === 0) {
    // Insert sample recipes
    const insertRecipe = db.prepare(`
      INSERT INTO recipes (id, name, description, ingredients, instructions, prep_time, cook_time, servings, category, cuisine, dietary_restrictions, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const sampleRecipes = [
      {
        id: '1',
        name: 'Fresh Garden Salad',
        description: 'A refreshing salad with mixed vegetables and herbs',
        ingredients: JSON.stringify(['lettuce', 'tomatoes', 'cucumbers', 'carrots', 'onions', 'olive oil', 'lemon']),
        instructions: JSON.stringify([
          'Wash all vegetables thoroughly under cold running water',
          'Chop lettuce into bite-sized pieces and place in a large bowl',
          'Slice tomatoes and cucumbers into rounds',
          'Grate carrots using a coarse grater',
          'Thinly slice onions for a mild flavor',
          'Combine all vegetables in the bowl',
          'Drizzle with olive oil and fresh lemon juice',
          'Toss gently and season with salt and pepper to taste'
        ]),
        prep_time: 15,
        cook_time: 0,
        servings: 4,
        category: 'lunch',
        cuisine: 'Mediterranean',
        dietary_restrictions: JSON.stringify(['vegetarian', 'vegan', 'gluten-free']),
        image_url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'
      },
      {
        id: '2',
        name: 'Vegetable Stir Fry',
        description: 'Quick and healthy stir fry with seasonal vegetables',
        ingredients: JSON.stringify(['broccoli', 'carrots', 'bell peppers', 'onions', 'garlic', 'soy sauce', 'ginger', 'sesame oil']),
        instructions: JSON.stringify([
          'Heat sesame oil in a large wok or pan over high heat',
          'Add minced garlic and ginger, cook for 30 seconds until fragrant',
          'Add harder vegetables first (carrots, broccoli stems)',
          'Stir fry for 3-4 minutes until slightly tender',
          'Add softer vegetables (bell peppers, broccoli florets, onions)',
          'Continue cooking for another 2-3 minutes',
          'Add soy sauce and toss to combine',
          'Cook for 1 more minute until vegetables are crisp-tender',
          'Serve immediately over rice or noodles'
        ]),
        prep_time: 10,
        cook_time: 10,
        servings: 3,
        category: 'dinner',
        cuisine: 'Asian',
        dietary_restrictions: JSON.stringify(['vegetarian', 'vegan']),
        image_url: 'https://images.pexels.com/photos/2253643/pexels-photo-2253643.jpeg'
      }
    ];

    sampleRecipes.forEach(recipe => {
      insertRecipe.run(
        recipe.id, recipe.name, recipe.description, recipe.ingredients,
        recipe.instructions, recipe.prep_time, recipe.cook_time, recipe.servings,
        recipe.category, recipe.cuisine, recipe.dietary_restrictions, recipe.image_url
      );
    });
  }

  // Check if food banks already exist
  const foodBankCount = db.prepare('SELECT COUNT(*) as count FROM food_banks').get() as { count: number };
  
  if (foodBankCount.count === 0) {
    // Insert sample food banks
    const insertFoodBank = db.prepare(`
      INSERT INTO food_banks (id, name, address, phone, email, accepted_items, operating_hours, website, country, city, latitude, longitude)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const sampleFoodBanks = [
      {
        id: '1',
        name: 'Feeding America - Central Food Bank',
        address: '123 Main St, New York, NY 10001, USA',
        phone: '+1 (555) 123-4567',
        email: 'contact@feedingamerica-central.org',
        accepted_items: JSON.stringify(['vegetables', 'fruits', 'canned', 'grains', 'dairy']),
        operating_hours: 'Mon-Fri: 8AM-6PM, Sat: 9AM-3PM',
        website: 'https://feedingamerica.org',
        country: 'United States',
        city: 'New York',
        latitude: 40.7128,
        longitude: -74.0060
      },
      {
        id: '2',
        name: 'The Trussell Trust - London',
        address: '52 Camberwell Church St, London SE5 8QZ, UK',
        phone: '+44 20 7394 5200',
        email: 'london@trusselltrust.org',
        accepted_items: JSON.stringify(['canned', 'grains', 'snacks', 'beverages']),
        operating_hours: 'Mon-Fri: 9AM-5PM, Sat: 10AM-2PM',
        website: 'https://trusselltrust.org',
        country: 'United Kingdom',
        city: 'London',
        latitude: 51.5074,
        longitude: -0.1278
      }
    ];

    sampleFoodBanks.forEach(bank => {
      insertFoodBank.run(
        bank.id, bank.name, bank.address, bank.phone, bank.email,
        bank.accepted_items, bank.operating_hours, bank.website,
        bank.country, bank.city, bank.latitude, bank.longitude
      );
    });
  }

  console.log('Database seeded successfully');
};