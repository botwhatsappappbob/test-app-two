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
  searchFoodBanks: (location: string) => FoodBank[];
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
    description: 'A refreshing salad with mixed vegetables and herbs',
    ingredients: ['lettuce', 'tomatoes', 'cucumbers', 'carrots', 'onions', 'olive oil', 'lemon'],
    instructions: [
      'Wash all vegetables thoroughly under cold running water',
      'Chop lettuce into bite-sized pieces and place in a large bowl',
      'Slice tomatoes and cucumbers into rounds',
      'Grate carrots using a coarse grater',
      'Thinly slice onions for a mild flavor',
      'Combine all vegetables in the bowl',
      'Drizzle with olive oil and fresh lemon juice',
      'Toss gently and season with salt and pepper to taste'
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
    ingredients: ['broccoli', 'carrots', 'bell peppers', 'onions', 'garlic', 'soy sauce', 'ginger', 'sesame oil'],
    instructions: [
      'Heat sesame oil in a large wok or pan over high heat',
      'Add minced garlic and ginger, cook for 30 seconds until fragrant',
      'Add harder vegetables first (carrots, broccoli stems)',
      'Stir fry for 3-4 minutes until slightly tender',
      'Add softer vegetables (bell peppers, broccoli florets, onions)',
      'Continue cooking for another 2-3 minutes',
      'Add soy sauce and toss to combine',
      'Cook for 1 more minute until vegetables are crisp-tender',
      'Serve immediately over rice or noodles'
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
    description: 'Nutritious breakfast bowl with fresh fruits and toppings',
    ingredients: ['bananas', 'berries', 'yogurt', 'honey', 'granola', 'nuts', 'chia seeds'],
    instructions: [
      'Freeze bananas overnight for best texture',
      'Blend frozen bananas with yogurt until smooth and creamy',
      'Add a splash of milk if needed for consistency',
      'Pour smoothie mixture into a bowl',
      'Arrange fresh berries on top in rows',
      'Drizzle with honey in decorative patterns',
      'Sprinkle granola, nuts, and chia seeds',
      'Add any additional toppings as desired',
      'Serve immediately with a spoon'
    ],
    prepTime: 10,
    cookTime: 0,
    servings: 1,
    category: 'breakfast',
    cuisine: 'American',
    dietaryRestrictions: ['vegetarian', 'gluten-free'],
    image: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg'
  },
  {
    id: '4',
    name: 'Banana Bread',
    description: 'Moist and delicious banana bread perfect for overripe bananas',
    ingredients: ['bananas', 'flour', 'sugar', 'eggs', 'butter', 'baking soda', 'vanilla', 'salt'],
    instructions: [
      'Preheat oven to 350°F (175°C)',
      'Mash overripe bananas in a large bowl',
      'Mix in melted butter, sugar, egg, and vanilla',
      'Combine flour, baking soda, and salt in separate bowl',
      'Gradually add dry ingredients to wet ingredients',
      'Mix until just combined, do not overmix',
      'Pour into greased loaf pan',
      'Bake for 60-65 minutes until golden brown',
      'Cool in pan for 10 minutes before removing'
    ],
    prepTime: 15,
    cookTime: 65,
    servings: 8,
    category: 'snack',
    cuisine: 'American',
    dietaryRestrictions: ['vegetarian'],
    image: 'https://images.pexels.com/photos/830894/pexels-photo-830894.jpeg'
  }
];

// Comprehensive global food bank database
const globalFoodBanks: FoodBank[] = [
  // United States
  {
    id: '1',
    name: 'Feeding America - Central Food Bank',
    address: '123 Main St, New York, NY 10001, USA',
    phone: '+1 (555) 123-4567',
    email: 'contact@feedingamerica-central.org',
    acceptedItems: ['vegetables', 'fruits', 'canned', 'grains', 'dairy'],
    operatingHours: 'Mon-Fri: 8AM-6PM, Sat: 9AM-3PM',
    website: 'https://feedingamerica.org',
    country: 'United States',
    city: 'New York',
    coordinates: { lat: 40.7128, lng: -74.0060 }
  },
  {
    id: '2',
    name: 'Los Angeles Regional Food Bank',
    address: '1734 E 41st St, Los Angeles, CA 90058, USA',
    phone: '+1 (323) 234-3030',
    email: 'info@lafoodbank.org',
    acceptedItems: ['vegetables', 'fruits', 'dairy', 'meats', 'canned'],
    operatingHours: 'Mon-Thu: 7AM-4PM, Fri: 7AM-3PM',
    website: 'https://lafoodbank.org',
    country: 'United States',
    city: 'Los Angeles',
    coordinates: { lat: 34.0522, lng: -118.2437 }
  },
  // United Kingdom
  {
    id: '3',
    name: 'The Trussell Trust - London',
    address: '52 Camberwell Church St, London SE5 8QZ, UK',
    phone: '+44 20 7394 5200',
    email: 'london@trusselltrust.org',
    acceptedItems: ['canned', 'grains', 'snacks', 'beverages'],
    operatingHours: 'Mon-Fri: 9AM-5PM, Sat: 10AM-2PM',
    website: 'https://trusselltrust.org',
    country: 'United Kingdom',
    city: 'London',
    coordinates: { lat: 51.5074, lng: -0.1278 }
  },
  {
    id: '4',
    name: 'FareShare Manchester',
    address: 'Unit 9, Guinness Rd, Manchester M17 1SD, UK',
    phone: '+44 161 888 1003',
    email: 'manchester@fareshare.org.uk',
    acceptedItems: ['vegetables', 'fruits', 'dairy', 'meats', 'frozen'],
    operatingHours: 'Mon-Fri: 8AM-4PM',
    website: 'https://fareshare.org.uk',
    country: 'United Kingdom',
    city: 'Manchester',
    coordinates: { lat: 53.4808, lng: -2.2426 }
  },
  // Canada
  {
    id: '5',
    name: 'Food Banks Canada - Toronto',
    address: '5025 Orbitor Dr, Mississauga, ON L4W 4Y5, Canada',
    phone: '+1 (905) 602-5234',
    email: 'toronto@foodbankscanada.ca',
    acceptedItems: ['vegetables', 'fruits', 'canned', 'grains', 'dairy'],
    operatingHours: 'Mon-Fri: 9AM-5PM, Sat: 10AM-2PM',
    website: 'https://foodbankscanada.ca',
    country: 'Canada',
    city: 'Toronto',
    coordinates: { lat: 43.6532, lng: -79.3832 }
  },
  // Australia
  {
    id: '6',
    name: 'Foodbank Australia - Sydney',
    address: '50 Owen St, Glendenning NSW 2761, Australia',
    phone: '+61 2 9756 3099',
    email: 'sydney@foodbank.org.au',
    acceptedItems: ['vegetables', 'fruits', 'canned', 'grains', 'snacks'],
    operatingHours: 'Mon-Fri: 8AM-4PM',
    website: 'https://foodbank.org.au',
    country: 'Australia',
    city: 'Sydney',
    coordinates: { lat: -33.8688, lng: 151.2093 }
  },
  // Germany
  {
    id: '7',
    name: 'Berliner Tafel e.V.',
    address: 'Beusselstraße 44 N-Q, 10553 Berlin, Germany',
    phone: '+49 30 68815200',
    email: 'info@berliner-tafel.de',
    acceptedItems: ['vegetables', 'fruits', 'dairy', 'meats', 'canned'],
    operatingHours: 'Mon-Fri: 8AM-6PM, Sat: 9AM-1PM',
    website: 'https://berliner-tafel.de',
    country: 'Germany',
    city: 'Berlin',
    coordinates: { lat: 52.5200, lng: 13.4050 }
  },
  // France
  {
    id: '8',
    name: 'Banques Alimentaires - Paris',
    address: '21 Rue de Stalingrad, 92000 Nanterre, France',
    phone: '+33 1 47 24 30 30',
    email: 'paris@banquealimentaire.org',
    acceptedItems: ['vegetables', 'fruits', 'canned', 'grains', 'dairy'],
    operatingHours: 'Lun-Ven: 9h-17h, Sam: 9h-13h',
    website: 'https://banquealimentaire.org',
    country: 'France',
    city: 'Paris',
    coordinates: { lat: 48.8566, lng: 2.3522 }
  },
  // Japan
  {
    id: '9',
    name: 'Second Harvest Japan - Tokyo',
    address: '2-2-12 Osaki, Shinagawa-ku, Tokyo 141-0032, Japan',
    phone: '+81 3-5728-3373',
    email: 'info@2hj.org',
    acceptedItems: ['vegetables', 'fruits', 'canned', 'grains'],
    operatingHours: 'Mon-Fri: 9AM-6PM',
    website: 'https://2hj.org',
    country: 'Japan',
    city: 'Tokyo',
    coordinates: { lat: 35.6762, lng: 139.6503 }
  },
  // Brazil
  {
    id: '10',
    name: 'Banco de Alimentos - São Paulo',
    address: 'Rua Voluntários da Pátria, 547, São Paulo, SP 02010-000, Brazil',
    phone: '+55 11 3225-0055',
    email: 'contato@bancodealimentos.org.br',
    acceptedItems: ['vegetables', 'fruits', 'grains', 'canned'],
    operatingHours: 'Seg-Sex: 8h-17h, Sáb: 8h-12h',
    website: 'https://bancodealimentos.org.br',
    country: 'Brazil',
    city: 'São Paulo',
    coordinates: { lat: -23.5505, lng: -46.6333 }
  },
  // India
  {
    id: '11',
    name: 'Feeding India - Mumbai',
    address: 'Andheri East, Mumbai, Maharashtra 400069, India',
    phone: '+91 22 6789 1234',
    email: 'mumbai@feedingindia.org',
    acceptedItems: ['vegetables', 'fruits', 'grains', 'canned'],
    operatingHours: 'Mon-Sat: 9AM-6PM',
    website: 'https://feedingindia.org',
    country: 'India',
    city: 'Mumbai',
    coordinates: { lat: 19.0760, lng: 72.8777 }
  },
  // South Africa
  {
    id: '12',
    name: 'FoodForward SA - Cape Town',
    address: '7 Voortrekker Rd, Goodwood, Cape Town, 7460, South Africa',
    phone: '+27 21 447 8444',
    email: 'capetown@foodforwardsa.org',
    acceptedItems: ['vegetables', 'fruits', 'canned', 'grains'],
    operatingHours: 'Mon-Fri: 8AM-5PM',
    website: 'https://foodforwardsa.org',
    country: 'South Africa',
    city: 'Cape Town',
    coordinates: { lat: -33.9249, lng: 18.4241 }
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
    ).sort((a, b) => {
      // Sort by number of matching ingredients
      const aMatches = a.ingredients.filter(ingredient =>
        availableIngredients.some(available =>
          available.includes(ingredient.toLowerCase()) || 
          ingredient.toLowerCase().includes(available)
        )
      ).length;
      const bMatches = b.ingredients.filter(ingredient =>
        availableIngredients.some(available =>
          available.includes(ingredient.toLowerCase()) || 
          ingredient.toLowerCase().includes(available)
        )
      ).length;
      return bMatches - aMatches;
    });
  };

  const searchFoodBanks = (location: string): FoodBank[] => {
    if (!location.trim()) return globalFoodBanks;
    
    const searchTerm = location.toLowerCase();
    return globalFoodBanks.filter(bank =>
      bank.city.toLowerCase().includes(searchTerm) ||
      bank.country.toLowerCase().includes(searchTerm) ||
      bank.address.toLowerCase().includes(searchTerm) ||
      bank.name.toLowerCase().includes(searchTerm)
    );
  };

  return (
    <AppContext.Provider value={{
      foodItems,
      recipes: sampleRecipes,
      donations,
      foodBanks: globalFoodBanks,
      notificationSettings,
      addFoodItem,
      updateFoodItem,
      deleteFoodItem,
      consumeFoodItem,
      addDonation,
      updateNotificationSettings,
      getExpiringItems,
      getRecipeRecommendations,
      searchFoodBanks
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