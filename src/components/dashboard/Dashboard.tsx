import React from 'react';
import { AlertTriangle, TrendingUp, DollarSign, Leaf, Clock, Package, Plus, ArrowRight } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { format, differenceInDays } from 'date-fns';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { foodItems, getExpiringItems, donations } = useApp();
  
  const activeItems = foodItems.filter(item => !item.isConsumed && item.quantity > 0);
  const expiringItems = getExpiringItems(7);
  const consumedItems = foodItems.filter(item => item.isConsumed);
  const expiredItems = foodItems.filter(item => 
    !item.isConsumed && new Date(item.expirationDate) < new Date()
  );
  
  const totalValue = activeItems.reduce((sum, item) => sum + (item.cost || 0), 0);
  const savedValue = consumedItems.reduce((sum, item) => sum + (item.cost || 0), 0);
  const wasteReduction = foodItems.length > 0 ? ((consumedItems.length / foodItems.length) * 100) : 0;

  const stats = [
    {
      title: 'Active Items',
      value: activeItems.length,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12% from last month',
      trend: 'up'
    },
    {
      title: 'Expiring Soon',
      value: expiringItems.length,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      change: '-8% from last week',
      trend: 'down'
    },
    {
      title: 'Money Saved',
      value: `$${savedValue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      change: '+24% this month',
      trend: 'up'
    },
    {
      title: 'Waste Reduced',
      value: `${wasteReduction.toFixed(1)}%`,
      icon: Leaf,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+5% improvement',
      trend: 'up'
    }
  ];

  const quickActions = [
    {
      title: 'Add Food Item',
      description: 'Add new items to your inventory',
      icon: Plus,
      color: 'bg-emerald-600 hover:bg-emerald-700',
      action: 'add-item'
    },
    {
      title: 'View Recipes',
      description: 'Get suggestions based on your items',
      icon: ArrowRight,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: 'recipes'
    }
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Here's your food management overview for today
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Current Plan</div>
          <div className={`font-semibold text-lg ${
            user?.subscriptionPlan === 'premium' ? 'text-amber-600' : 'text-gray-600'
          }`}>
            {user?.subscriptionPlan?.toUpperCase()}
            {user?.subscriptionPlan === 'premium' && ' ✨'}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor} ring-1 ring-gray-200`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.title}</div>
                </div>
              </div>
              <div className={`text-sm font-medium flex items-center ${
                stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
              }`}>
                <span className="mr-1">
                  {stat.trend === 'up' ? '↗' : '↘'}
                </span>
                {stat.change}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-6 border border-emerald-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                className={`${action.color} text-white p-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="font-semibold">{action.title}</div>
                    <div className="text-sm opacity-90">{action.description}</div>
                  </div>
                  <Icon className="h-6 w-6" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Expiring Items */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="h-6 w-6 text-amber-500 mr-2" />
              Items Expiring Soon
            </h2>
            {expiringItems.length > 0 && (
              <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium">
                {expiringItems.length} items
              </span>
            )}
          </div>
          
          {expiringItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">All Good! 🎉</h3>
              <p className="text-gray-600">No items expiring in the next 7 days</p>
            </div>
          ) : (
            <div className="space-y-4">
              {expiringItems.slice(0, 5).map((item) => {
                const daysLeft = differenceInDays(item.expirationDate, new Date());
                const isUrgent = daysLeft <= 1;
                const isWarning = daysLeft <= 3;
                
                return (
                  <div key={item.id} className={`p-4 rounded-lg border-l-4 ${
                    isUrgent ? 'bg-red-50 border-red-400' :
                    isWarning ? 'bg-amber-50 border-amber-400' :
                    'bg-blue-50 border-blue-400'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {item.quantity} {item.unit} • {item.storageLocation}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold ${
                          isUrgent ? 'text-red-600' :
                          isWarning ? 'text-amber-600' :
                          'text-blue-600'
                        }`}>
                          {daysLeft <= 0 ? 'Expired!' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {format(item.expirationDate, 'MMM dd, yyyy')}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {expiringItems.length > 5 && (
                <div className="text-center pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-500">
                    +{expiringItems.length - 5} more items expiring soon
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <TrendingUp className="h-6 w-6 text-emerald-500 mr-2" />
              Recent Activity
            </h2>
          </div>
          
          <div className="space-y-4">
            {/* Recent consumed items */}
            {consumedItems.slice(-3).reverse().map((item) => (
              <div key={`consumed-${item.id}`} className="flex items-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                  <Package className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-600">Consumed completely</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-emerald-600 font-semibold">
                    ${(item.cost || 0).toFixed(2)} saved
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.consumedDate && format(item.consumedDate, 'MMM dd')}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Recent donations */}
            {donations.slice(-2).map((donation) => (
              <div key={`donation-${donation.id}`} className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600">❤️</span>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Food Donation</div>
                  <div className="text-sm text-gray-600">{donation.recipientOrganization}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-blue-600 font-semibold capitalize">
                    {donation.status}
                  </div>
                  <div className="text-xs text-gray-500">
                    {format(donation.createdAt, 'MMM dd')}
                  </div>
                </div>
              </div>
            ))}
            
            {consumedItems.length === 0 && donations.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Activity Yet</h3>
                <p className="text-gray-600">Start by adding some food items to your inventory!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Environmental Impact */}
      <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-xl border border-emerald-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <Leaf className="h-8 w-8 text-emerald-600 mr-3" />
              Your Environmental Impact
            </h2>
            <p className="text-gray-600 mt-2">Making a difference, one meal at a time</p>
          </div>
          <div className="text-6xl">🌍</div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-white bg-opacity-60 rounded-lg">
            <div className="text-3xl font-bold text-emerald-600 mb-2">{consumedItems.length}</div>
            <div className="text-sm text-gray-700 font-medium">Items Consumed</div>
            <div className="text-xs text-gray-500 mt-1">vs. wasted</div>
          </div>
          <div className="text-center p-4 bg-white bg-opacity-60 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">{donations.length}</div>
            <div className="text-sm text-gray-700 font-medium">Donations Made</div>
            <div className="text-xs text-gray-500 mt-1">helping community</div>
          </div>
          <div className="text-center p-4 bg-white bg-opacity-60 rounded-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {(consumedItems.length * 0.5).toFixed(1)}kg
            </div>
            <div className="text-sm text-gray-700 font-medium">CO₂ Prevented</div>
            <div className="text-xs text-gray-500 mt-1">emissions saved</div>
          </div>
          <div className="text-center p-4 bg-white bg-opacity-60 rounded-lg">
            <div className="text-3xl font-bold text-teal-600 mb-2">
              {(consumedItems.length * 2.5).toFixed(1)}L
            </div>
            <div className="text-sm text-gray-700 font-medium">Water Saved</div>
            <div className="text-xs text-gray-500 mt-1">resource conservation</div>
          </div>
        </div>
        
        {consumedItems.length > 10 && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-full text-sm font-medium">
              🏆 Food Hero Badge Earned!
            </div>
          </div>
        )}
      </div>

      {/* Getting Started Guide (for new users) */}
      {foodItems.length === 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to FoodSaver Connect! 🎉
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Start your journey to reduce food waste and save money. Add your first food items 
              to get personalized recommendations and track your impact.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">1. Add Food Items</h3>
                <p className="text-sm text-gray-600">Start by adding items from your kitchen with expiration dates</p>
              </div>
              <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600">🍳</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">2. Get Recipe Ideas</h3>
                <p className="text-sm text-gray-600">Discover recipes based on ingredients you already have</p>
              </div>
              <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-rose-600">❤️</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">3. Share & Save</h3>
                <p className="text-sm text-gray-600">Donate excess food and track your positive impact</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};