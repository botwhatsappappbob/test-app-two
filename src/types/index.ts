export interface User {
  id: string;
  email: string;
  name: string;
  userType: 'household' | 'business';
  subscriptionPlan: 'free' | 'premium';
  createdAt: Date;
}

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  quantity: number;
  unit: string;
  purchaseDate: Date;
  expirationDate: Date;
  storageLocation: StorageLocation;
  cost?: number;
  barcode?: string;
  userId: string;
  isConsumed: boolean;
  consumedDate?: Date;
}

export type FoodCategory = 
  | 'vegetables'
  | 'fruits'
  | 'meats'
  | 'dairy'
  | 'grains'
  | 'canned'
  | 'frozen'
  | 'snacks'
  | 'beverages'
  | 'other';

export type StorageLocation = 'refrigerator' | 'freezer' | 'pantry' | 'counter';

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';
  cuisine: string;
  dietaryRestrictions: string[];
  image?: string;
}

export interface Donation {
  id: string;
  userId: string;
  foodItems: string[];
  recipientOrganization: string;
  pickupDate: Date;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
}

export interface FoodBank {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  acceptedItems: FoodCategory[];
  operatingHours: string;
  website?: string;
  country: string;
  city: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface NotificationSettings {
  expirationAlerts: boolean;
  alertDaysBefore: number;
  recipeRecommendations: boolean;
  donationReminders: boolean;
  weeklyReports: boolean;
}