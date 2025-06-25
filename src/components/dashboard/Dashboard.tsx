import React from 'react';
import { AlertTriangle, TrendingUp, DollarSign, Leaf, Clock, Package } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { format, differenceInDays } from 'date-fns';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { foodItems, getExpiringItems, donations } = useApp();
  
  const activeItems = foodItems.filter(item => !item.isConsumed && item.quantity > 0);
  const expiringItems = getExpiringItems(7);
  const consumedItems = foodItems.filter(item => item.isConsumed);
  
  const totalValue = activeItems.reduce((sum, item) => sum + (item.cost || 0), 0);
  const savedValue = consumedItems.reduce((sum, item) => sum + (item.cost || 0), 0);
  const wasteReduction = ((consumedItems.length / (consumedItems.length + expiringItems.length)) * 100) || 0;

  const stats = [
    {
      title: 'Active Items',
      value: activeItems.length,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12% from last month'
    },
    {
      title: 'Expiring Soon',
      value: expiringItems.length,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      change: '-8% from last week'
    },
    {
      title: 'Money Saved',
      value: `$${savedValue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      change: '+24% this month'
    },
    {
      title: 'Waste Reduced',
      value: `${wasteReduction.toFixed(1)}%`,
      icon: Leaf,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+5% improvement'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600 mt-1">Here's your food management overview</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Current Plan</div>
          <div className={`font-semibold ${user?.subscriptionPlan === 'premium' ? 'text-amber-600' : 'text-gray-600'}`}>
            {user?.subscriptionPlan?.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.title}</div>
                </div>
              </div>
              <div className="text-sm text-emerald-600 font-medium">{stat.change}</div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiring Items */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Items Expiring Soon</h2>
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          
          {expiringItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No items expiring soon!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expiringItems.slice(0, 4).map((item) => {
                const daysLeft = differenceInDays(item.expirationDate, new Date());
                return (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-600">
                        {item.quantity} {item.unit} • {item.storageLocation}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${
                        daysLeft <= 1 ? 'text-red-600' : daysLeft <= 3 ? 'text-amber-600' : 'text-gray-600'
                      }`}>
                        {daysLeft <= 0 ? 'Expired' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''}`}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(item.expirationDate, 'MMM dd')}
                      </div>
                    </div>
                  </div>
                );
              })}
              {expiringItems.length > 4 && (
                <div className="text-center pt-2">
                  <span className="text-sm text-gray-500">
                    +{expiringItems.length - 4} more items
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>
          
          <div className="space-y-3">
            {consumedItems.slice(-4).reverse().map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-600">Used completely</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-emerald-600 font-medium">
                    ${(item.cost || 0).toFixed(2)} saved
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.consumedDate && format(item.consumedDate, 'MMM dd')}
                  </div>
                </div>
              </div>
            ))}
            
            {donations.slice(-2).map((donation) => (
              <div key={donation.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Food Donation</div>
                  <div className="text-sm text-gray-600">{donation.recipientOrganization}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-blue-600 font-medium capitalize">{donation.status}</div>
                  <div className="text-xs text-gray-500">
                    {format(donation.createdAt, 'MMM dd')}
                  </div>
                </div>
              </div>
            ))}
            
            {consumedItems.length === 0 && donations.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-sm">No recent activity</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Environmental Impact */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Environmental Impact</h2>
            <p className="text-gray-600">Your contribution to reducing food waste</p>
          </div>
          <Leaf className="h-8 w-8 text-emerald-600" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">{consumedItems.length}</div>
            <div className="text-sm text-gray-600">Items Consumed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">{donations.length}</div>
            <div className="text-sm text-gray-600">Donations Made</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {(consumedItems.length * 0.5).toFixed(1)} kg
            </div>
            <div className="text-sm text-gray-600">CO₂ Emissions Prevented</div>
          </div>
        </div>
      </div>
    </div>
  );
};