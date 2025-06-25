import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FoodItem, Recipe, Donation, FoodBank, NotificationSettings } from '../types';
import { useAuth } from './AuthContext';

interface AppContextType {
  foodItems: FoodItem[];
  recipes: Recipe[];
  donations: Donation[];
  foodBanks: FoodBank[];
  notificationSettings: NotificationSettings;
  addFoodItem: (item: Omit<FoodItem, 'id' | 'userId'>) => void;
  updateFoodItem: (id: string, updates: Partial<FoodItem>) => void;
  deleteFoodItem: (id: string) => void;
  consumeFoodItem: (id: string, quantity: number) => void;
  addDonation: (donation: Omit<Donation, 'id' | 'userId' | 'createdAt'>) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  getExpiringItems: (days: number) => FoodItem[];
  getRecipeRecommendations: () => Recipe[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultNotificationSettings: NotificationSettings = {
  expirationAlerts: true,
  alertDaysBefore: 3,
  recipeRecommendations: true,
  donationReminders: true,
  weeklyReports: false
};

const sampleRecipes: Recipe[] = [
  {
    id: '1',
    name: 'Fresh Garden Salad',
    description: 'A refreshing salad with mixed vegetables',
    ingredients: ['lettuce', 'tomatoes', 'cucumbers', 'carrots', 'onions'],
    instructions: [
      'Wash all vegetables thoroughly',
      'Chop lettuce into bite-sized pieces',
      'Slice tomatoes and cucumbers',
      'Grate carrots',
      'Thinly slice onions',
      'Mix all ingredients in a large bowl',
      'Add your favorite dressing and toss'
    ],
    prepTime: 15,
    cookTime: 0,
    servings: 4,
    category: 'lunch',
    cuisine: 'Mediterranean',
    dietaryRestrictions: ['vegetarian', 'vegan', 'gluten-free'],
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'
  },
  {
    id: '2',
    name: 'Vegetable Stir Fry',
    description: 'Quick and healthy stir fry with seasonal vegetables',
    ingredients: ['broccoli', 'carrots', 'bell peppers', 'onions', 'garlic', 'soy sauce'],
    instructions: [
      'Heat oil in a large pan or wok',
      'Add minced garlic and cook for 30 seconds',
      'Add harder vegetables first (carrots, broccoli)',
      'Stir fry for 3-4 minutes',
      'Add softer vegetables (peppers, onions)',
      'Cook for another 2-3 minutes',
      'Add soy sauce and toss to combine',
      'Serve over rice or noodles'
    ],
    prepTime: 10,
    cookTime: 10,
    servings: 3,
    category: 'dinner',
    cuisine: 'Asian',
    dietaryRestrictions: ['vegetarian', 'vegan'],
    image: 'https://images.pexels.com/photos/2253643/pexels-photo-2253643.jpeg'
  },
  {
    id: '3',
    name: 'Fruit Smoothie Bowl',
    description: 'Nutritious breakfast bowl with fresh fruits',
    ingredients: ['bananas', 'berries', 'yogurt', 'honey', 'granola', 'nuts'],
    instructions: [
      'Blend frozen bananas with yogurt until smooth',
      'Pour into a bowl',
      'Top with fresh berries',
      'Drizzle with honey',
      'Sprinkle granola and nuts on top',
      'Serve immediately'
    ],
    prepTime: 10,
    cookTime: 0,
    servings: 1,
    category: 'breakfast',
    cuisine: 'American',
    dietaryRestrictions: ['vegetarian', 'gluten-free'],
    image: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg'
  }
];

const sampleFoodBanks: FoodBank[] = [
  {
    id: '1',
    name: 'Community Food Bank',
    address: '123 Main St, City, State 12345',
    phone: '(555) 123-4567',
    email: 'contact@communityfoodbank.org',
    acceptedItems: ['vegetables', 'fruits', 'canned', 'grains'],
    operatingHours: 'Mon-Fri: 9AM-5PM, Sat: 10AM-2PM',
    website: 'https://communityfoodbank.org'
  },
  {
    id: '2',
    name: 'Local Harvest Pantry',
    address: '456 Oak Ave, City, State 12345',
    phone: '(555) 987-6543',
    email: 'info@localharvestpantry.org',
    acceptedItems: ['vegetables', 'fruits', 'dairy', 'meats'],
    operatingHours: 'Tue-Thu: 10AM-6PM, Sat: 9AM-1PM',
    website: 'https://localharvestpantry.org'
  }
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(defaultNotificationSettings);

  useEffect(() => {
    if (user) {
      const savedItems = localStorage.getItem(`foodsaver_items_${user.id}`);
      if (savedItems) {
        setFoodItems(JSON.parse(savedItems).map((item: any) => ({
          ...item,
          purchaseDate: new Date(item.purchaseDate),
          expirationDate: new Date(item.expirationDate),
          consumedDate: item.consumedDate ? new Date(item.consumedDate) : undefined
        })));
      }

      const savedDonations = localStorage.getItem(`foodsaver_donations_${user.id}`);
      if (savedDonations) {
        setDonations(JSON.parse(savedDonations).map((donation: any) => ({
          ...donation,
          pickupDate: new Date(donation.pickupDate),
          createdAt: new Date(donation.createdAt)
        })));
      }

      const savedSettings = localStorage.getItem(`foodsaver_settings_${user.id}`);
      if (savedSettings) {
        setNotificationSettings(JSON.parse(savedSettings));
      }
    }
  }, [user]);

  const addFoodItem = (item: Omit<FoodItem, 'id' | 'userId'>) => {
    if (!user) return;
    
    const newItem: FoodItem = {
      ...item,
      id: Date.now().toString(),
      userId: user.id
    };
    
    const updatedItems = [...foodItems, newItem];
    setFoodItems(updatedItems);
    localStorage.setItem(`foodsaver_items_${user.id}`, JSON.stringify(updatedItems));
  };

  const updateFoodItem = (id: string, updates: Partial<FoodItem>) => {
    if (!user) return;
    
    const updatedItems = foodItems.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    setFoodItems(updatedItems);
    localStorage.setItem(`foodsaver_items_${user.id}`, JSON.stringify(updatedItems));
  };

  const deleteFoodItem = (id: string) => {
    if (!user) return;
    
    const updatedItems = foodItems.filter(item => item.id !== id);
    setFoodItems(updatedItems);
    localStorage.setItem(`foodsaver_items_${user.id}`, JSON.stringify(updatedItems));
  };

  const consumeFoodItem = (id: string, quantity: number) => {
    if (!user) return;
    
    const updatedItems = foodItems.map(item => {
      if (item.id === id) {
        const remainingQuantity = item.quantity - quantity;
        if (remainingQuantity <= 0) {
          return { ...item, quantity: 0, isConsumed: true, consumedDate: new Date() };
        } else {
          return { ...item, quantity: remainingQuantity };
        }
      }
      return item;
    });
    setFoodItems(updatedItems);
    localStorage.setItem(`foodsaver_items_${user.id}`, JSON.stringify(updatedItems));
  };

  const addDonation = (donation: Omit<Donation, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    
    const newDonation: Donation = {
      ...donation,
      id: Date.now().toString(),
      userId: user.id,
      createdAt: new Date()
    };
    
    const updatedDonations = [...donations, newDonation];
    setDonations(updatedDonations);
    localStorage.setItem(`foodsaver_donations_${user.id}`, JSON.stringify(updatedDonations));
  };

  const updateNotificationSettings = (settings: Partial<NotificationSettings>) => {
    if (!user) return;
    
    const updatedSettings = { ...notificationSettings, ...settings };
    setNotificationSettings(updatedSettings);
    localStorage.setItem(`foodsaver_settings_${user.id}`, JSON.stringify(updatedSettings));
  };

  const getExpiringItems = (days: number): FoodItem[] => {
    const today = new Date();
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + days);
    
    return foodItems.filter(item => 
      !item.isConsumed && 
      item.expirationDate <= targetDate && 
      item.expirationDate >= today
    );
  };

  const getRecipeRecommendations = (): Recipe[] => {
    const availableIngredients = foodItems
      .filter(item => !item.isConsumed && item.quantity > 0)
      .map(item => item.name.toLowerCase());
    
    return sampleRecipes.filter(recipe =>
      recipe.ingredients.some(ingredient =>
        availableIngredients.some(available =>
          available.includes(ingredient.toLowerCase()) || 
          ingredient.toLowerCase().includes(available)
        )
      )
    );
  };

  return (
    <AppContext.Provider value={{
      foodItems,
      recipes: sampleRecipes,
      donations,
      foodBanks: sampleFoodBanks,
      notificationSettings,
      addFoodItem,
      updateFoodItem,
      deleteFoodItem,
      consumeFoodItem,
      addDonation,
      updateNotificationSettings,
      getExpiringItems,
      getRecipeRecommendations
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};