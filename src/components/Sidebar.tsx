'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Activity, BarChart3, Settings, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { logout, isDevelopmentMode } = useAuth();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    onToggle();
  };

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Activity,
    },
    {
      name: 'Orders',
      href: '/orders',
      icon: Package,
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-center h-16 bg-blue-600">
          <div className="text-center">
            <Link href="/dashboard" className="text-white text-xl font-bold hover:text-blue-100 transition-colors">
              StreamFlow
            </Link>
            {isDevelopmentMode && (
              <div className="text-xs text-blue-200 mt-1">
                🚧 Dev Mode
              </div>
            )}
          </div>
        </div>

        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-700'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                  onClick={() => {
                    // Close sidebar on mobile when link is clicked
                    if (window.innerWidth < 1024) {
                      onToggle();
                    }
                  }}
                >
                  <Icon className="mr-3" size={20} />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
            >
              <LogOut className="mr-3" size={20} />
              Logout
            </button>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar; 