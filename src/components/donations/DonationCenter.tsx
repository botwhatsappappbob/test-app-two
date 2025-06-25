import React, { useState } from 'react';
import { Heart, Plus, Calendar, MapPin, Phone, Globe, Clock, Search, Filter, Users } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { format } from 'date-fns';

export const DonationCenter: React.FC = () => {
  const { foodBanks, donations, foodItems, addDonation, searchFoodBanks } = useApp();
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedFoodBank, setSelectedFoodBank] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [notes, setNotes] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [filteredFoodBanks, setFilteredFoodBanks] = useState(foodBanks);

  const availableForDonation = foodItems.filter(item => 
    !item.isConsumed && 
    item.quantity > 0 &&
    !donations.some(donation => 
      donation.foodItems.includes(item.id) && 
      ['pending', 'confirmed'].includes(donation.status)
    )
  );

  const handleLocationSearch = (location: string) => {
    setSearchLocation(location);
    const results = searchFoodBanks(location);
    setFilteredFoodBanks(results);
  };

  const handleSubmitDonation = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0 || !selectedFoodBank || !pickupDate) return;

    const selectedBank = filteredFoodBanks.find(bank => bank.id === selectedFoodBank);
    if (!selectedBank) return;

    addDonation({
      foodItems: selectedItems,
      recipientOrganization: selectedBank.name,
      pickupDate: new Date(pickupDate),
      status: 'pending',
      notes: notes || undefined
    });

    // Reset form
    setSelectedItems([]);
    setSelectedFoodBank('');
    setPickupDate('');
    setNotes('');
    setShowDonationForm(false);
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const groupedFoodBanks = filteredFoodBanks.reduce((acc, bank) => {
    const country = bank.country;
    if (!acc[country]) acc[country] = [];
    acc[country].push(bank);
    return acc;
  }, {} as Record<string, typeof filteredFoodBanks>);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Food Donation Center</h1>
          <p className="text-gray-600 mt-2">Connect with food banks worldwide and share your excess food</p>
        </div>
        {availableForDonation.length > 0 && (
          <button
            onClick={() => setShowDonationForm(true)}
            className="flex items-center px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Donation
          </button>
        )}
      </div>

      {/* Global Impact Stats */}
      <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Global Food Bank Network</h2>
            <p className="text-gray-600">Connecting communities worldwide</p>
          </div>
          <Heart className="h-8 w-8 text-rose-600" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white bg-opacity-60 rounded-lg">
            <div className="text-2xl font-bold text-rose-600">{foodBanks.length}</div>
            <div className="text-sm text-gray-700">Food Banks</div>
          </div>
          <div className="text-center p-4 bg-white bg-opacity-60 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{Object.keys(groupedFoodBanks).length}</div>
            <div className="text-sm text-gray-700">Countries</div>
          </div>
          <div className="text-center p-4 bg-white bg-opacity-60 rounded-lg">
            <div className="text-2xl font-bold text-emerald-600">{donations.length}</div>
            <div className="text-sm text-gray-700">Your Donations</div>
          </div>
          <div className="text-center p-4 bg-white bg-opacity-60 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{availableForDonation.length}</div>
            <div className="text-sm text-gray-700">Items Available</div>
          </div>
        </div>
      </div>

      {/* Location Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Find Food Banks Near You</h2>
          <div className="text-sm text-gray-500">
            Showing {filteredFoodBanks.length} of {foodBanks.length} food banks
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by city, country, or organization name..."
            value={searchLocation}
            onChange={(e) => handleLocationSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
          />
        </div>
      </div>

      {/* Donation Form Modal */}
      {showDonationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Create Food Donation</h2>
              <button
                onClick={() => setShowDonationForm(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmitDonation} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Items to Donate ({selectedItems.length} selected)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4">
                  {availableForDonation.map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedItems.includes(item.id)
                          ? 'border-rose-500 bg-rose-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                        className="sr-only"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-600">
                          {item.quantity} {item.unit} • {item.category}
                        </div>
                        <div className="text-xs text-gray-500">
                          Expires {format(item.expirationDate, 'MMM dd, yyyy')}
                        </div>
                      </div>
                      {selectedItems.includes(item.id) && (
                        <div className="w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center">
                          ✓
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="foodBank" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Food Bank
                </label>
                <select
                  id="foodBank"
                  value={selectedFoodBank}
                  onChange={(e) => setSelectedFoodBank(e.target.value)}
                  required
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                >
                  <option value="">Choose a food bank...</option>
                  {Object.entries(groupedFoodBanks).map(([country, banks]) => (
                    <optgroup key={country} label={country}>
                      {banks.map((bank) => (
                        <option key={bank.id} value={bank.id}>
                          {bank.name} - {bank.city}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="pickupDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Pickup Date
                </label>
                <input
                  id="pickupDate"
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  placeholder="Any special instructions, dietary information, or pickup preferences..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDonationForm(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedItems.length === 0}
                  className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Donation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Available Items for Donation */}
      {availableForDonation.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Items Available for Donation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableForDonation.slice(0, 6).map((item) => (
              <div key={item.id} className="flex items-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-600">
                    {item.quantity} {item.unit} • {item.category}
                  </div>
                  <div className="text-xs text-gray-500">
                    Expires {format(item.expirationDate, 'MMM dd, yyyy')}
                  </div>
                </div>
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Heart className="h-4 w-4 text-emerald-600" />
                </div>
              </div>
            ))}
            {availableForDonation.length > 6 && (
              <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg text-gray-600 border border-gray-200">
                <div className="text-center">
                  <div className="font-medium">+{availableForDonation.length - 6} more items</div>
                  <div className="text-sm">available for donation</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* My Donations */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Donations</h2>
        
        {donations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-rose-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No donations yet</h3>
            <p className="text-gray-600 mb-6">Start sharing your excess food with those in need!</p>
            {availableForDonation.length > 0 && (
              <button
                onClick={() => setShowDonationForm(true)}
                className="inline-flex items-center px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Donation
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {donations.map((donation) => (
              <div key={donation.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{donation.recipientOrganization}</h3>
                    <p className="text-gray-600">
                      {donation.foodItems.length} item{donation.foodItems.length !== 1 ? 's' : ''} donated
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    donation.status === 'completed' ? 'bg-green-100 text-green-700' :
                    donation.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                    donation.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Pickup: {format(donation.pickupDate, 'MMM dd, yyyy')}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Created: {format(donation.createdAt, 'MMM dd, yyyy')}
                  </div>
                </div>
                
                {donation.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-900 mb-1">Notes:</div>
                    <div className="text-sm text-gray-600">{donation.notes}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Global Food Banks Directory */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Global Food Banks Directory</h2>
        
        {Object.entries(groupedFoodBanks).map(([country, banks]) => (
          <div key={country} className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <span className="mr-2">🌍</span>
              {country} ({banks.length} organizations)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {banks.map((bank) => (
                <div key={bank.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-gray-900 mb-3">{bank.name}</h4>
                  
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{bank.address}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{bank.phone}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{bank.operatingHours}</span>
                    </div>
                    
                    {bank.website && (
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-2 flex-shrink-0" />
                        <a 
                          href={bank.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-rose-600 hover:text-rose-700 underline"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <div className="text-sm font-medium text-gray-900 mb-2">Accepted Items:</div>
                    <div className="flex flex-wrap gap-1">
                      {bank.acceptedItems.map((item, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-rose-100 text-rose-700 rounded text-xs font-medium"
                        >
                          {item.charAt(0).toUpperCase() + item.slice(1)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};