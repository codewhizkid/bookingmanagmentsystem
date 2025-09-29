import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  Users, 
  Settings, 
  LogOut, 
  Scissors,
  Home,
  Clock,
  DollarSign
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, salon, signOut } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Appointments', href: '/appointments', icon: Clock },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Services', href: '/services', icon: Scissors },
    { name: 'Reports', href: '/reports', icon: DollarSign },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Scissors className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">SalonBook</span>
            </div>
          </div>

          {/* Salon info */}
          {salon && (
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 truncate">{salon.name}</h3>
              <p className="text-sm text-gray-500">{user?.role?.replace('_', ' ').toUpperCase()}</p>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:text-gray-900 hover:bg-gray-100 transition-colors duration-150"
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </a>
            ))}
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.full_name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={signOut}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-150"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-64">
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};