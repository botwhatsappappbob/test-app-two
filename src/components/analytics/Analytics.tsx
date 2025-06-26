import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, DollarSign, Leaf, Clock, Package, Award, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { analyticsAPI } from '../../lib/api';
import { Analytics as AnalyticsType } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { useApi } from '../../hooks/useApi';

export const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  
  const {
    data: analytics,
    isLoading,
    error,
    execute: fetchAnalytics
  } = useApi<AnalyticsType>(analyticsAPI.getOverview);

  const {
    data: wasteReport,
    isLoading: wasteLoading,
    execute: fetchWasteReport
  } = useApi<any>(analyticsAPI.getWasteReport);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    fetchWasteReport(selectedPeriod);
  }, [selectedPeriod]);

  const handleRefresh = () => {
    fetchAnalytics();
    fetchWasteReport(selectedPeriod);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" text="Loading analytics..." className="py-16" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorMessage message={error} onRetry={handleRefresh} />
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

  const statCards = [
    {
      title: 'Total Items Managed',
      value: analytics.overview.totalItems,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Items Consumed',
      value: analytics.overview.consumedItems,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Money Saved',
      value: `$${analytics.financial.savedValue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Waste Reduction',
      value: `${analytics.overview.wasteReduction.toFixed(1)}%`,
      icon: Leaf,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Insights</h1>
          <p className="text-gray-600 mt-1">Track your food management performance and impact</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          {user?.subscriptionPlan === 'free' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center text-amber-700 text-sm">
                <Award className="h-4 w-4 mr-2" />
                Upgrade to Premium for advanced analytics
              </div>
            </div>
          )}
        </div>
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
          {analytics.categoryBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.categoryBreakdown.map((entry, index) => (
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
            <LineChart data={analytics.monthlyTrend}>
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
              <span className="font-semibold text-emerald-600">{analytics.overview.consumedItems}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Items Expired</span>
              <span className="font-semibold text-red-600">{analytics.overview.expiredItems}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Donations Made</span>
              <span className="font-semibold text-blue-600">{analytics.donations.totalDonations}</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-900 font-medium">Success Rate</span>
                <span className="font-bold text-emerald-600">{analytics.overview.wasteReduction.toFixed(1)}%</span>
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
              <span className="font-semibold">${analytics.financial.totalValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Value Saved</span>
              <span className="font-semibold text-green-600">${analytics.financial.savedValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Value Wasted</span>
              <span className="font-semibold text-red-600">${analytics.financial.wastedValue.toFixed(2)}</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-900 font-medium">Savings Rate</span>
                <span className="font-bold text-green-600">{analytics.financial.savingsRate.toFixed(1)}%</span>
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
              <span className="font-semibold text-green-600">{analytics.environmental.co2Saved.toFixed(1)} kg</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Water Saved (est.)</span>
              <span className="font-semibold text-blue-600">{analytics.environmental.waterSaved.toFixed(1)} L</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Meals Donated</span>
              <span className="font-semibold text-orange-600">{analytics.environmental.mealsDonated}</span>
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

      {/* Waste Report */}
      {wasteReport && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Waste Report</h3>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
          
          {wasteLoading ? (
            <LoadingSpinner text="Loading waste report..." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{wasteReport.summary.totalWastedItems}</div>
                <div className="text-sm text-gray-700">Items Wasted</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">${wasteReport.summary.totalWastedValue.toFixed(2)}</div>
                <div className="text-sm text-gray-700">Value Wasted</div>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <div className="text-2xl font-bold text-amber-600">{wasteReport.summary.averageDaysExpired.toFixed(1)}</div>
                <div className="text-sm text-gray-700">Avg Days Expired</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{Object.keys(wasteReport.summary.categoryBreakdown).length}</div>
                <div className="text-sm text-gray-700">Categories Affected</div>
              </div>
            </div>
          )}
        </div>
      )}

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