import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  MapPin, 
  Trash2, 
  Edit3,
  AlertCircle,
  Check
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { FoodItem, FoodCategory, StorageLocation } from '../../types';
import { format, differenceInDays } from 'date-fns';

interface InventoryListProps {
  onAddItem: () => void;
}

export const InventoryList: React.FC<InventoryListProps> = ({ onAddItem }) => {
  const { foodItems, deleteFoodItem, consumeFoodItem } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<FoodCategory | 'all'>('all');
  const [filterLocation, setFilterLocation] = useState<StorageLocation | 'all'>('all');
  const [showConsumed, setShowConsumed] = useState(false);

  const filteredItems = foodItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesLocation = filterLocation === 'all' || item.storageLocation === filterLocation;
    const matchesConsumedFilter = showConsumed ? true : !item.isConsumed;
    
    return matchesSearch && matchesCategory && matchesLocation && matchesConsumedFilter;
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

  const handleConsume = (item: FoodItem) => {
    consumeFoodItem(item.id, item.quantity);
  };

  const categories: (FoodCategory | 'all')[] = ['all', 'vegetables', 'fruits', 'meats', 'dairy', 'grains', 'canned', 'frozen', 'snacks', 'beverages', 'other'];
  const locations: (StorageLocation | 'all')[] = ['all', 'refrigerator', 'freezer', 'pantry', 'counter'];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Food Inventory</h1>
          <p className="text-gray-600 mt-1">Manage your food items and track expiration dates</p>
        </div>
        <button
          onClick={onAddItem}
          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Item
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as FoodCategory | 'all')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            {locations.map(location => (
              <option key={location} value={location}>
                {location === 'all' ? 'All Locations' : location.charAt(0).toUpperCase() + location.slice(1)}
              </option>
            ))}
          </select>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showConsumed}
              onChange={(e) => setShowConsumed(e.target.checked)}
              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm text-gray-700">Show consumed</span>
          </label>
        </div>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Filter className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-600 mb-4">
            {foodItems.length === 0 
              ? "You haven't added any food items yet." 
              : "Try adjusting your filters or search terms."
            }
          </p>
          <button
            onClick={onAddItem}
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Your First Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const status = getExpirationStatus(item);
            const statusColor = getStatusColor(status);
            
            return (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{item.category}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!item.isConsumed && (
                      <button
                        onClick={() => handleConsume(item)}
                        className="p-1 text-gray-400 hover:text-emerald-600 transition-colors"
                        title="Mark as consumed"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteFoodItem(item.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">{item.quantity} {item.unit}</span>
                    {item.cost && <span className="ml-2">• ${item.cost.toFixed(2)}</span>}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="capitalize">{item.storageLocation}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Expires {format(item.expirationDate, 'MMM dd, yyyy')}</span>
                  </div>
                </div>
                
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
                  {status === 'expired' || status === 'critical' ? (
                    <AlertCircle className="h-3 w-3 mr-1" />
                  ) : null}
                  {getStatusText(item)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};