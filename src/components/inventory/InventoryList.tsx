import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  MapPin, 
  Trash2, 
  Edit3,
  AlertCircle,
  Check,
  Package2,
  Clock,
  DollarSign
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { FoodItem, FoodCategory, StorageLocation } from '../../types';
import { format, differenceInDays } from 'date-fns';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';

interface InventoryListProps {
  onAddItem: () => void;
}

export const InventoryList: React.FC<InventoryListProps> = ({ onAddItem }) => {
  const { 
    foodItems, 
    deleteFoodItem, 
    consumeFoodItem, 
    isLoading, 
    error, 
    refreshData 
  } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<FoodCategory | 'all'>('all');
  const [filterLocation, setFilterLocation] = useState<StorageLocation | 'all'>('all');
  const [showConsumed, setShowConsumed] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'expiration' | 'category' | 'added'>('expiration');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const filteredItems = foodItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesLocation = filterLocation === 'all' || item.storageLocation === filterLocation;
    const matchesConsumedFilter = showConsumed ? true : !item.isConsumed;
    
    return matchesSearch && matchesCategory && matchesLocation && matchesConsumedFilter;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'expiration':
        return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
      case 'category':
        return a.category.localeCompare(b.category);
      case 'added':
        return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime();
      default:
        return 0;
    }
  });

  const getExpirationStatus = (item: FoodItem) => {
    if (item.isConsumed) return 'consumed';
    const daysLeft = differenceInDays(item.expirationDate, new Date());
    if (daysLeft < 0) return 'expired';
    if (daysLeft <= 1) return 'critical';
    if (daysLeft <= 3) return 'warning';
    return 'good';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'critical': return 'bg-red-50 text-red-700 border-red-200';
      case 'warning': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'consumed': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const getStatusText = (item: FoodItem) => {
    const status = getExpirationStatus(item);
    if (status === 'consumed') return 'Consumed';
    
    const daysLeft = differenceInDays(item.expirationDate, new Date());
    if (daysLeft < 0) return `Expired ${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''} ago`;
    if (daysLeft === 0) return 'Expires today';
    return `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`;
  };

  const handleConsume = async (item: FoodItem) => {
    setActionLoading(item.id);
    try {
      await consumeFoodItem(item.id, item.quantity);
    } catch (error) {
      console.error('Error consuming item:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    setActionLoading(itemId);
    try {
      await deleteFoodItem(itemId);
    } catch (error) {
      console.error('Error deleting item:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const categories: (FoodCategory | 'all')[] = ['all', 'vegetables', 'fruits', 'meats', 'dairy', 'grains', 'canned', 'frozen', 'snacks', 'beverages', 'other'];
  const locations: (StorageLocation | 'all')[] = ['all', 'refrigerator', 'freezer', 'pantry', 'counter'];

  // Statistics
  const activeItems = filteredItems.filter(item => !item.isConsumed);
  const expiringItems = activeItems.filter(item => {
    const daysLeft = differenceInDays(item.expirationDate, new Date());
    return daysLeft <= 7 && daysLeft >= 0;
  });
  const totalValue = activeItems.reduce((sum, item) => sum + (item.cost || 0), 0);

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" text="Loading inventory..." className="py-16" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorMessage message={error} onRetry={refreshData} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Food Inventory</h1>
          <p className="text-gray-600 mt-2">Manage your food items and track expiration dates</p>
        </div>
        <button
          onClick={onAddItem}
          className="flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Item
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{activeItems.length}</div>
              <div className="text-sm text-gray-600">Active Items</div>
            </div>
            <Package2 className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-amber-600">{expiringItems.length}</div>
              <div className="text-sm text-gray-600">Expiring Soon</div>
            </div>
            <Clock className="h-8 w-8 text-amber-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-emerald-600">${totalValue.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Value</div>
            </div>
            <DollarSign className="h-8 w-8 text-emerald-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{foodItems.filter(item => item.isConsumed).length}</div>
              <div className="text-sm text-gray-600">Consumed</div>
            </div>
            <Check className="h-8 w-8 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as FoodCategory | 'all')}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
          
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value as StorageLocation | 'all')}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          >
            {locations.map(location => (
              <option key={location} value={location}>
                {location === 'all' ? 'All Locations' : location.charAt(0).toUpperCase() + location.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'expiration' | 'category' | 'added')}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          >
            <option value="expiration">Sort by Expiration</option>
            <option value="name">Sort by Name</option>
            <option value="category">Sort by Category</option>
            <option value="added">Sort by Date Added</option>
          </select>
          
          <label className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              checked={showConsumed}
              onChange={(e) => setShowConsumed(e.target.checked)}
              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm text-gray-700 font-medium">Show consumed</span>
          </label>
        </div>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            {foodItems.length === 0 ? (
              <Package2 className="h-16 w-16 text-gray-400" />
            ) : (
              <Filter className="h-16 w-16 text-gray-400" />
            )}
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            {foodItems.length === 0 ? "No items in your inventory yet" : "No items found"}
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {foodItems.length === 0 
              ? "Start by adding your first food item to begin tracking expiration dates and reducing waste." 
              : "Try adjusting your filters or search terms to find what you're looking for."
            }
          </p>
          {foodItems.length === 0 && (
            <button
              onClick={onAddItem}
              className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-md hover:shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Item
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const status = getExpirationStatus(item);
            const statusColor = getStatusColor(status);
            const daysLeft = differenceInDays(item.expirationDate, new Date());
            const isActionLoading = actionLoading === item.id;
            
            return (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-600 capitalize font-medium">{item.category}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!item.isConsumed && (
                      <button
                        onClick={() => handleConsume(item)}
                        disabled={isActionLoading}
                        className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 disabled:opacity-50"
                        title="Mark as consumed"
                      >
                        {isActionLoading ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={isActionLoading}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50"
                      title="Delete item"
                    >
                      {isActionLoading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-semibold text-gray-900">{item.quantity} {item.unit}</span>
                  </div>
                  
                  {item.cost && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Cost:</span>
                      <span className="font-semibold text-emerald-600">${item.cost.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="capitalize">{item.storageLocation}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Expires {format(item.expirationDate, 'MMM dd, yyyy')}</span>
                  </div>
                </div>
                
                <div className={`inline-flex items-center px-3 py-2 rounded-full text-xs font-bold border ${statusColor} w-full justify-center`}>
                  {(status === 'expired' || status === 'critical') && (
                    <AlertCircle className="h-3 w-3 mr-1" />
                  )}
                  {status === 'consumed' && (
                    <Check className="h-3 w-3 mr-1" />
                  )}
                  {getStatusText(item)}
                </div>

                {/* Progress bar for expiration */}
                {!item.isConsumed && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          daysLeft <= 1 ? 'bg-red-500' :
                          daysLeft <= 3 ? 'bg-amber-500' :
                          daysLeft <= 7 ? 'bg-blue-500' :
                          'bg-emerald-500'
                        }`}
                        style={{ 
                          width: `${Math.max(0, Math.min(100, (daysLeft / 30) * 100))}%` 
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {filteredItems.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filteredItems.length} of {foodItems.length} items
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-gray-600">
                Active: <span className="font-semibold text-blue-600">{activeItems.length}</span>
              </span>
              <span className="text-gray-600">
                Expiring Soon: <span className="font-semibold text-amber-600">{expiringItems.length}</span>
              </span>
              <span className="text-gray-600">
                Total Value: <span className="font-semibold text-emerald-600">${totalValue.toFixed(2)}</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};