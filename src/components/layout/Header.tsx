import React from 'react';
import { Bell, Settings, User, LogOut, Crown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';

export const Header: React.FC = () => {
  const { user, logout, upgradeSubscription } = useAuth();
  const { getExpiringItems, notificationSettings } = useApp();
  
  const expiringItems = getExpiringItems(notificationSettings.alertDaysBefore);
  const hasNotifications = expiringItems.length > 0;

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-emerald-600">FoodSaver Connect</h1>
          <div className="hidden md:flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
            Built with <span className="ml-1 font-semibold text-blue-600">Bolt.new</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {user?.subscriptionPlan === 'free' && (
            <button
              onClick={upgradeSubscription}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Crown className="h-4 w-4 mr-2" />
              <span className="font-medium">Upgrade to Premium</span>
            </button>
          )}
          
          <div className="relative">
            <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <Bell className="h-6 w-6" />
              {hasNotifications && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {expiringItems.length}
                </span>
              )}
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                <div className="text-xs text-gray-500 capitalize">
                  {user?.userType} • {user?.subscriptionPlan}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={logout}
                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};