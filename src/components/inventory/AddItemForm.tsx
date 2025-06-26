import React, { useState } from 'react';
import { X, Calendar, Package, MapPin, Tag, DollarSign, Scan } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { FoodCategory, StorageLocation } from '../../types';
import { BarcodeScanner } from './BarcodeScanner';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface AddItemFormProps {
  onClose: () => void;
}

export const AddItemForm: React.FC<AddItemFormProps> = ({ onClose }) => {
  const { addFoodItem } = useApp();
  const [showScanner, setShowScanner] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'other' as FoodCategory,
    quantity: 1,
    unit: 'pieces',
    purchaseDate: new Date().toISOString().split('T')[0],
    expirationDate: '',
    storageLocation: 'refrigerator' as StorageLocation,
    cost: '',
    barcode: '',
    brand: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      await addFoodItem({
        name: formData.name,
        category: formData.category,
        quantity: formData.quantity,
        unit: formData.unit,
        purchaseDate: new Date(formData.purchaseDate),
        expirationDate: new Date(formData.expirationDate),
        storageLocation: formData.storageLocation,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        barcode: formData.barcode || undefined,
        isConsumed: false
      });
      
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add food item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScanResult = (barcode: string, productData?: any) => {
    setFormData(prev => ({
      ...prev,
      barcode,
      name: productData?.name || prev.name,
      category: productData?.category || prev.category,
      brand: productData?.brand || prev.brand
    }));
    setShowScanner(false);
  };

  const categories: FoodCategory[] = ['vegetables', 'fruits', 'meats', 'dairy', 'grains', 'canned', 'frozen', 'snacks', 'beverages', 'other'];
  const locations: StorageLocation[] = ['refrigerator', 'freezer', 'pantry', 'counter'];
  const units = ['pieces', 'kg', 'g', 'l', 'ml', 'cups', 'tbsp', 'tsp', 'oz', 'lbs', 'cans', 'bottles', 'boxes', 'bags'];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
        <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Add Food Item</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Barcode Scanner Button */}
            <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Quick Add with Barcode</h3>
                  <p className="text-sm text-gray-600">Scan or enter barcode for instant product info</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Scan className="h-4 w-4 mr-2" />
                  Scan
                </button>
              </div>
              {formData.barcode && (
                <div className="mt-3 p-2 bg-white rounded border">
                  <div className="text-xs text-gray-500">Barcode:</div>
                  <div className="font-mono text-sm">{formData.barcode}</div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Item Name *
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., Organic Bananas"
                />
              </div>
            </div>

            {formData.brand && (
              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                  Brand
                </label>
                <input
                  id="brand"
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Brand name"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as FoodCategory }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="storageLocation" className="block text-sm font-medium text-gray-700 mb-2">
                  Storage *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    id="storageLocation"
                    value={formData.storageLocation}
                    onChange={(e) => setFormData(prev => ({ ...prev, storageLocation: e.target.value as StorageLocation }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    {locations.map(location => (
                      <option key={location} value={location}>
                        {location.charAt(0).toUpperCase() + location.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  id="quantity"
                  type="number"
                  min="0.1"
                  step="0.1"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseFloat(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-2">
                  Unit *
                </label>
                <select
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Purchase Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="purchaseDate"
                    type="date"
                    required
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Expiration Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="expirationDate"
                    type="date"
                    required
                    value={formData.expirationDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expirationDate: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-2">
                Cost (Optional)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  'Add Item'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showScanner && (
        <BarcodeScanner
          onScanResult={handleScanResult}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  );
};