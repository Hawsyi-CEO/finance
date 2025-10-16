import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const SidebarModal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg', 
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 h-screen w-screen ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ zIndex: 9998 }}
        onClick={onClose}
      />

      {/* Sidebar Modal */}
      <div 
        className={`fixed ${sizeClasses[size]} bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ 
          top: 0,
          bottom: 0,
          right: 0,
          height: '100vh',
          width: '100%',
          zIndex: 9999
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-slate-800 to-slate-700 flex-shrink-0">
          <h2 className="text-xl font-semibold text-white flex items-center">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-600 rounded-xl transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </div>
      </div>
    </>
  );
};

export default SidebarModal;