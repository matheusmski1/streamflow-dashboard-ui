
import React from 'react';
import { LogOut, Activity, BarChart3, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-gray-900 text-white z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        w-64 lg:translate-x-0 lg:static lg:z-0
      `}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-8">Stream Dashboard</h2>
          
          <nav className="space-y-4">
            <a href="#" className="flex items-center space-x-3 p-3 rounded-lg bg-blue-600 text-white">
              <Activity size={20} />
              <span>Live Stream</span>
            </a>
            <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
              <BarChart3 size={20} />
              <span>Analytics</span>
            </a>
            <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
              <Settings size={20} />
              <span>Settings</span>
            </a>
          </nav>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700">
          <div className="mb-4">
            <p className="text-sm text-gray-300">{user?.name}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-red-600 transition-colors text-red-400 hover:text-white"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
