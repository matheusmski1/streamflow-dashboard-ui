import React from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Database } from 'lucide-react';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <Layout title="Settings">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account and application preferences</p>
        </div>

        {/* User Profile Section */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center mb-4">
            <User className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={user?.name || ''}
                readOnly
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-900"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-900"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <input
                type="text"
                value={user?.role || ''}
                readOnly
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center mb-4">
            <Bell className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive email updates about orders</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-600">Receive browser push notifications</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center mb-4">
            <Shield className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Security</h3>
          </div>
          
          <div className="space-y-4">
            <button className="w-full text-left p-3 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <p className="text-sm font-medium text-gray-900">Change Password</p>
              <p className="text-sm text-gray-600">Update your account password</p>
            </button>
            
            <button 
              onClick={logout}
              className="w-full text-left p-3 border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 text-red-600"
            >
              <p className="text-sm font-medium">Sign Out</p>
              <p className="text-sm text-red-500">Sign out of your account</p>
            </button>
          </div>
        </div>

        {/* System Section */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center mb-4">
            <Database className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">System Information</h3>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600">
            <p><span className="font-medium">Application:</span> Streamflow Dashboard</p>
            <p><span className="font-medium">Version:</span> 1.0.0</p>
            <p><span className="font-medium">Environment:</span> {process.env.NODE_ENV}</p>
            <p><span className="font-medium">API URL:</span> {process.env.NEXT_PUBLIC_API_URL}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
} 