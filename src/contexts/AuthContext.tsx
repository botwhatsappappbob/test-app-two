import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, userType: 'household' | 'business') => Promise<boolean>;
  logout: () => void;
  upgradeSubscription: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('foodsaver_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user exists in localStorage
    const savedUsers = JSON.parse(localStorage.getItem('foodsaver_users') || '[]');
    const existingUser = savedUsers.find((u: User) => u.email === email);
    
    if (existingUser) {
      setUser(existingUser);
      localStorage.setItem('foodsaver_user', JSON.stringify(existingUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const register = async (
    email: string, 
    password: string, 
    name: string, 
    userType: 'household' | 'business'
  ): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      userType,
      subscriptionPlan: 'free',
      createdAt: new Date()
    };
    
    // Save to localStorage
    const savedUsers = JSON.parse(localStorage.getItem('foodsaver_users') || '[]');
    savedUsers.push(newUser);
    localStorage.setItem('foodsaver_users', JSON.stringify(savedUsers));
    
    setUser(newUser);
    localStorage.setItem('foodsaver_user', JSON.stringify(newUser));
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('foodsaver_user');
  };

  const upgradeSubscription = () => {
    if (user) {
      const updatedUser = { ...user, subscriptionPlan: 'premium' as const };
      setUser(updatedUser);
      localStorage.setItem('foodsaver_user', JSON.stringify(updatedUser));
      
      // Update in users list
      const savedUsers = JSON.parse(localStorage.getItem('foodsaver_users') || '[]');
      const updatedUsers = savedUsers.map((u: User) => 
        u.id === user.id ? updatedUser : u
      );
      localStorage.setItem('foodsaver_users', JSON.stringify(updatedUsers));
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