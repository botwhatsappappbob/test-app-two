import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { InventoryList } from './components/inventory/InventoryList';
import { AddItemForm } from './components/inventory/AddItemForm';
import { RecipeList } from './components/recipes/RecipeList';
import { DonationCenter } from './components/donations/DonationCenter';
import { Analytics } from './components/analytics/Analytics';

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Left side - Hero section */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 to-green-700 p-12 flex-col justify-center">
          <div className="text-white">
            <h1 className="text-4xl font-bold mb-6">FoodSaver Connect</h1>
            <p className="text-xl mb-8 text-emerald-100">
              Reduce food waste, save money, and help your community with our smart inventory management platform.
            </p>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">✓</span>
                </div>
                <span className="text-emerald-100">Smart expiration tracking</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">✓</span>
                </div>
                <span className="text-emerald-100">Recipe recommendations</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">✓</span>
                </div>
                <span className="text-emerald-100">Food donation coordination</span>
              </div>
            </div>
            <div className="mt-8 p-4 bg-white bg-opacity-10 rounded-lg">
              <div className="text-sm text-emerald-100 mb-1">Built with</div>
              <div className="font-semibold text-white">Bolt.new</div>
            </div>
          </div>
        </div>
        
        {/* Right side - Auth form */}
        <div className="w-full lg:w-1/2 p-12 flex items-center justify-center">
          {isLogin ? (
            <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  );
};

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddItemForm, setShowAddItemForm] = useState(false);

  const handleTabChange = (tab: string) => {
    if (tab === 'add-item') {
      setShowAddItemForm(true);
    } else {
      setActiveTab(tab);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'inventory':
        return <InventoryList onAddItem={() => setShowAddItemForm(true)} />;
      case 'recipes':
        return <RecipeList />;
      case 'donations':
        return <DonationCenter />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-gray-600">Settings panel coming soon...</p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
          <main className="flex-1 overflow-y-auto">
            {renderContent()}
          </main>
        </div>
        
        {showAddItemForm && (
          <AddItemForm onClose={() => setShowAddItemForm(false)} />
        )}
      </div>
    </AppProvider>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <MainApp /> : <AuthScreen />;
};

export default App;