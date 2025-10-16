import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bars3Icon } from '@heroicons/react/24/outline';

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'finance':
        return 'bg-slate-100 text-slate-800';
      case 'user':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors mr-3"
          >
            <Bars3Icon className="w-6 h-6 text-gray-600" />
          </button>
          
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-800">
              Selamat Datang, {user?.name}!
            </h2>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          <span className={`hidden sm:inline px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${getRoleBadgeColor(user?.role)}`}>
            {user?.role?.toUpperCase()}
          </span>
          
          <div className="hidden md:flex items-center space-x-2">
            <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <span className="text-gray-700 font-medium">{user?.name}</span>
          </div>
          
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white px-2 md:px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-1 md:space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
