import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FoodItem, Recipe, Donation, FoodBank, NotificationSettings } from '../types';
import { useAuth } from './AuthContext';
import { foodItemsAPI, recipesAPI, donationsAPI, foodBanksAPI } from '../lib/api';

interface AppContextType {
  foodItems: FoodItem[];
  recipes: Recipe[];
  donations: Donation[];
  foodBanks: FoodBank[];
  notificationSettings: NotificationSettings;
  isLoading: boolean;
  error: string | null;
  addFoodItem: (item: Omit<FoodItem, 'id' | 'userId'>) => Promise<void>;
  updateFoodItem: (id: string, updates: Partial<FoodItem>) => Promise<void>;
  deleteFoodItem: (id: string) => Promise<void>;
  consumeFoodItem: (id: string, quantity: number) => Promise<void>;
  addDonation: (donation: Omit<Donation, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  getExpiringItems: (days: number) => FoodItem[];
  getRecipeRecommendations: () => Recipe[];
  searchFoodBanks: (location: string) => FoodBank[];
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultNotificationSettings: NotificationSettings = {
  expirationAlerts: true,
  alertDaysBefore: 3,
  recipeRecommendations: true,
  donationReminders: true,
  weeklyReports: false
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [foodBanks, setFoodBanks] = useState<FoodBank[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(defaultNotificationSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshData();
    } else {
      // Clear data when user logs out
      setFoodItems([]);
      setDonations([]);
      setRecipes([]);
      setFoodBanks([]);
    }
  }, [isAuthenticated, user]);

  const refreshData = async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      // Load all data in parallel
      const [
        foodItemsResponse,
        recipesResponse,
        donationsResponse,
        foodBanksResponse
      ] = await Promise.all([
        foodItemsAPI.getAll(),
        recipesAPI.getAll(),
        donationsAPI.getAll(),
        foodBanksAPI.getAll()
      ]);

      setFoodItems(foodItemsResponse.data.map((item: any) => ({
        ...item,
        purchaseDate: new Date(item.purchaseDate),
        expirationDate: new Date(item.expirationDate),
        consumedDate: item.consumedDate ? new Date(item.consumedDate) : undefined
      })));

      setRecipes(recipesResponse.data);
      
      setDonations(donationsResponse.data.map((donation: any) => ({
        ...donation,
        pickupDate: new Date(donation.pickupDate),
        createdAt: new Date(donation.createdAt)
      })));

      setFoodBanks(foodBanksResponse.data);

    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const addFoodItem = async (item: Omit<FoodItem, 'id' | 'userId'>) => {
    try {
      const response = await foodItemsAPI.create(item);
      const newItem = {
        ...response.data.item,
        purchaseDate: new Date(response.data.item.purchaseDate),
        expirationDate: new Date(response.data.item.expirationDate)
      };
      setFoodItems(prev => [...prev, newItem]);
    } catch (err: any) {
      console.error('Error adding food item:', err);
      throw new Error(err.response?.data?.error || 'Failed to add food item');
    }
  };

  const updateFoodItem = async (id: string, updates: Partial<FoodItem>) => {
    try {
      const response = await foodItemsAPI.update(id, updates);
      const updatedItem = {
        ...response.data.item,
        purchaseDate: new Date(response.data.item.purchaseDate),
        expirationDate: new Date(response.data.item.expirationDate),
        consumedDate: response.data.item.consumedDate ? new Date(response.data.item.consumedDate) : undefined
      };
      setFoodItems(prev => prev.map(item => item.id === id ? updatedItem : item));
    } catch (err: any) {
      console.error('Error updating food item:', err);
      throw new Error(err.response?.data?.error || 'Failed to update food item');
    }
  };

  const deleteFoodItem = async (id: string) => {
    try {
      await foodItemsAPI.delete(id);
      setFoodItems(prev => prev.filter(item => item.id !== id));
    } catch (err: any) {
      console.error('Error deleting food item:', err);
      throw new Error(err.response?.data?.error || 'Failed to delete food item');
    }
  };

  const consumeFoodItem = async (id: string, quantity: number) => {
    try {
      await foodItemsAPI.consume(id, quantity);
      // Refresh the specific item or all items
      await refreshData();
    } catch (err: any) {
      console.error('Error consuming food item:', err);
      throw new Error(err.response?.data?.error || 'Failed to consume food item');
    }
  };

  const addDonation = async (donation: Omit<Donation, 'id' | 'userId' | 'createdAt'>) => {
    try {
      const response = await donationsAPI.create(donation);
      const newDonation = {
        ...response.data.donation,
        pickupDate: new Date(response.data.donation.pickupDate),
        createdAt: new Date(response.data.donation.createdAt)
      };
      setDonations(prev => [...prev, newDonation]);
    } catch (err: any) {
      console.error('Error adding donation:', err);
      throw new Error(err.response?.data?.error || 'Failed to create donation');
    }
  };

  const updateNotificationSettings = (settings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...notificationSettings, ...settings };
    setNotificationSettings(updatedSettings);
    // TODO: Save to backend
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
    // This will be handled by the backend API
    return recipes.filter(recipe => recipe.matchScore && recipe.matchScore > 0)
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  };

  const searchFoodBanks = (location: string): FoodBank[] => {
    if (!location.trim()) return foodBanks;
    
    const searchTerm = location.toLowerCase();
    return foodBanks.filter(bank =>
      bank.city.toLowerCase().includes(searchTerm) ||
      bank.country.toLowerCase().includes(searchTerm) ||
      bank.address.toLowerCase().includes(searchTerm) ||
      bank.name.toLowerCase().includes(searchTerm)
    );
  };

  return (
    <AppContext.Provider value={{
      foodItems,
      recipes,
      donations,
      foodBanks,
      notificationSettings,
      isLoading,
      error,
      addFoodItem,
      updateFoodItem,
      deleteFoodItem,
      consumeFoodItem,
      addDonation,
      updateNotificationSettings,
      getExpiringItems,
      getRecipeRecommendations,
      searchFoodBanks,
      refreshData
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