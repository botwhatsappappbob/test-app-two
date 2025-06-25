import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, DollarSign, Leaf, Clock, Package, Award } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { format, subDays, isAfter } from 'date-fns';

export const Analytics: React.FC = () => {
  const { user } = useAuth();
  const { foodItems, donations } = useApp();

  // Calculate stats
  const totalItems = foodItems.length;
  const consumedItems = foodItems.filter(item => item.isConsumed);
  const expiredItems = foodItems.filter(item => 
    !item.isConsumed && new Date(item.expirationDate) < new Date()
  );
  
  const totalValue = foodItems.reduce((sum, item) => sum + (item.cost || 0), 0);
  const savedValue = consumedItems.reduce((sum, item) => sum + (item.cost || 0), 0);
  const wastedValue = expiredItems.reduce((sum, item) => sum + (item.cost || 0), 0);

  const wasteReduction = totalItems > 0 ? ((consumedItems.length / totalItems) * 100) : 0;

  // Category breakdown
  const categoryData = foodItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryChartData = Object.entries(categoryData).map(([category, count]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: count
  }));

  // Monthly consumption trend (mock data for last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = subDays(new Date(), (5 - i) * 30);
    const monthItems = consumedItems.filter(item => 
      item.consumedDate && isAfter(item.consumedDate, subDays(date, 30)) && 
      !isAfter(item.consumedDate, date)
    );
    
    return {
      month: format(date, 'MMM'),
      consumed: monthItems.length,
      saved: monthItems.reduce((sum, item) => sum + (item.cost || 0), 0)
    };
  });

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

  const statCards = [
    {
      title: 'Total Items Managed',
      value: totalItems,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Items Consumed',
      value: consumedItems.length,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Money Saved',
      value: `$${savedValue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Waste Reduction',
      value: `${wasteReduction.toFixed(1)}%`,
      icon: Leaf,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Insights</h1>
          <p className="text-gray-600 mt-1">Track your food management performance and impact</p>
        </div>
        {user?.subscriptionPlan === 'free' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center text-amber-700 text-sm">
              <Award className="h-4 w-4 mr-2" />
              Upgrade to Premium for advanced analytics
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.title}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Food Category Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Food Category Distribution</h3>
          {categoryChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-72 text-gray-500">
              <div className="text-center">
                <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Monthly Consumption Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Consumption Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="consumed" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Items Consumed"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Waste Prevention */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Waste Prevention</h3>
            <Leaf className="h-6 w-6 text-emerald-600" />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Items Consumed</span>
              <span className="font-semibold text-emerald-600">{consumedItems.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Items Expired</span>
              <span className="font-semibold text-red-600">{expiredItems.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Donations Made</span>
              <span className="font-semibold text-blue-600">{donations.length}</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-900 font-medium">Success Rate</span>
                <span className="font-bold text-emerald-600">{wasteReduction.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Impact */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Financial Impact</h3>
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Investment</span>
              <span className="font-semibold">${totalValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Value Saved</span>
              <span className="font-semibold text-green-600">${savedValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Value Wasted</span>
              <span className="font-semibold text-red-600">${wastedValue.toFixed(2)}</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-900 font-medium">Savings Rate</span>
                <span className="font-bold text-green-600">
                  {totalValue > 0 ? ((savedValue / totalValue) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Environmental Impact */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Environmental Impact</h3>
            <div className="h-6 w-6 text-green-600">🌍</div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">CO₂ Saved (est.)</span>
              <span className="font-semibold text-green-600">{(consumedItems.length * 0.5).toFixed(1)} kg</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Water Saved (est.)</span>
              <span className="font-semibold text-blue-600">{(consumedItems.length * 2.5).toFixed(1)} L</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Meals Donated</span>
              <span className="font-semibold text-orange-600">{donations.reduce((sum, d) => sum + d.foodItems.length, 0)}</span>
            </div>
            <div className="border-t pt-4">
              <div className="text-center">
                <div className="text-2xl">🏆</div>
                <div className="text-sm text-gray-600 mt-1">Food Hero</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {user?.subscriptionPlan === 'free' && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Unlock Advanced Analytics</h3>
              <p className="text-gray-600">
                Get detailed insights, custom reports, and trend analysis with Premium
              </p>
            </div>
            <button className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium">
              Upgrade Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};