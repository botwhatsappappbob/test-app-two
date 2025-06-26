import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authAPI } from '../lib/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, userType: 'household' | 'business') => Promise<boolean>;
  logout: () => void;
  upgradeSubscription: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('foodsaver_token');
      if (token) {
        try {
          const response = await authAPI.getCurrentUser();
          setUser(response.data.user);
        } catch (error) {
          // Token is invalid, clear it
          localStorage.removeItem('foodsaver_token');
          localStorage.removeItem('foodsaver_user');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await authAPI.login(email, password);
      const { token, user: userData } = response.data;
      
      localStorage.setItem('foodsaver_token', token);
      localStorage.setItem('foodsaver_user', JSON.stringify(userData));
      setUser(userData);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (
    email: string, 
    password: string, 
    name: string, 
    userType: 'household' | 'business'
  ): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await authAPI.register(email, password, name, userType);
      const { token, user: userData } = response.data;
      
      localStorage.setItem('foodsaver_token', token);
      localStorage.setItem('foodsaver_user', JSON.stringify(userData));
      setUser(userData);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('foodsaver_token');
    localStorage.removeItem('foodsaver_user');
  };

  const upgradeSubscription = async () => {
    try {
      await authAPI.upgradeSubscription();
      if (user) {
        const updatedUser = { ...user, subscriptionPlan: 'premium' as const };
        setUser(updatedUser);
        localStorage.setItem('foodsaver_user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      upgradeSubscription,
      isAuthenticated: !!user,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};