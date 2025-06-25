import React from 'react';
import { 
  Home, 
  Package, 
  ChefHat, 
  Heart, 
  BarChart3, 
  Settings,
  Plus
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'recipes', label: 'Recipes', icon: ChefHat },
  { id: 'donations', label: 'Donations', icon: Heart },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center px-3 py-3 rounded-lg text-left transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 border-r-2 border-emerald-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => onTabChange('add-item')}
          className="w-full flex items-center justify-center px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Food Item
        </button>
      </div>
    </aside>
  );
};