import React from 'react';

const LoadingSpinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`inline-block ${sizeClasses[size]} border-2 border-gray-100 border-t-2 border-t-slate-800 rounded-full animate-spin`}></div>
  );
};

const LoadingCard = () => (
  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 animate-pulse">
    <div className="flex items-center space-x-4">
      <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded-lg w-3/4"></div>
        <div className="h-3 bg-gray-100 rounded-lg w-1/2"></div>
      </div>
    </div>
  </div>
);

const LoadingTable = ({ rows = 5 }) => (
  <div className="bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl border border-white/20">
    <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200/50">
      <div className="flex space-x-4">
        {[1, 2, 3, 4].map((col) => (
          <div key={col} className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded flex-1 animate-pulse"></div>
        ))}
      </div>
    </div>
    <div className="divide-y divide-slate-100/50">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="px-6 py-4">
          <div className="flex space-x-4">
            {[1, 2, 3, 4].map((col) => (
              <div key={col} className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded flex-1 animate-pulse"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const LoadingPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header skeleton */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-3xl p-8 text-white shadow-2xl animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="h-8 bg-white/20 rounded-lg w-64"></div>
            <div className="h-4 bg-white/20 rounded-lg w-48"></div>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-2xl"></div>
        </div>
      </div>
      
      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((card) => (
          <LoadingCard key={card} />
        ))}
      </div>
      
      {/* Table skeleton */}
      <div className="space-y-4">
        <div className="h-6 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg w-48 animate-pulse"></div>
        <LoadingTable />
      </div>
    </div>
  </div>
);

export { LoadingSpinner, LoadingCard, LoadingTable, LoadingPage };