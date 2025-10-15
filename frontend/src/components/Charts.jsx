import React from 'react';

// Simple Bar Chart Component
export const BarChart = ({ data, title, height = 300 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Tidak ada data untuk ditampilkan
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => Math.max(item.income, item.expense)));
  
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
      <div className="space-y-4" style={{ height: `${height}px` }}>
        {data.map((item, index) => {
          const incomeHeight = maxValue > 0 ? (item.income / maxValue) * (height - 100) : 0;
          const expenseHeight = maxValue > 0 ? (item.expense / maxValue) * (height - 100) : 0;
          
          return (
            <div key={index} className="flex items-end space-x-2 h-full">
              <div className="text-xs text-slate-600 w-16 text-center">
                {item.label}
              </div>
              <div className="flex-1 flex items-end space-x-1 h-full">
                {/* Income Bar */}
                <div className="flex-1 bg-gray-100 rounded-t relative" style={{ height: `${height - 50}px` }}>
                  <div 
                    className="bg-slate-800 rounded-t transition-all duration-500 absolute bottom-0 w-full"
                    style={{ height: `${incomeHeight}px` }}
                  ></div>
                </div>
                {/* Expense Bar */}
                <div className="flex-1 bg-gray-100 rounded-t relative" style={{ height: `${height - 50}px` }}>
                  <div 
                    className="bg-red-500 rounded-t transition-all duration-500 absolute bottom-0 w-full"
                    style={{ height: `${expenseHeight}px` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex justify-center space-x-6 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-slate-800 rounded mr-2"></div>
          <span className="text-slate-600">Pemasukan</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
          <span className="text-slate-600">Pengeluaran</span>
        </div>
      </div>
    </div>
  );
};

// Progress Ring Component
export const ProgressRing = ({ percentage, size = 120, strokeWidth = 8, color = "slate" }) => {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  
  const colorMap = {
    slate: 'stroke-slate-800',
    green: 'stroke-green-500',
    red: 'stroke-red-500',
    blue: 'stroke-blue-500'
  };

  return (
    <div className="relative">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`transition-all duration-1000 ${colorMap[color] || colorMap.slate}`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-slate-800">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
};

// Donut Chart Component
export const DonutChart = ({ data, title, size = 200 }) => {
  if (!data || data.length === 0) return null;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercentage = 0;

  const colors = ['#1e293b', '#ef4444', '#3b82f6', '#10b981', '#f59e0b'];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">{title}</h3>
      <div className="flex flex-col items-center">
        <div className="relative">
          <svg width={size} height={size} className="transform -rotate-90">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const strokeDasharray = `${percentage * 3.14159} 314.159`;
              const strokeDashoffset = -cumulativePercentage * 3.14159;
              
              cumulativePercentage += percentage;
              
              return (
                <circle
                  key={index}
                  cx={size / 2}
                  cy={size / 2}
                  r={50}
                  fill="transparent"
                  stroke={colors[index % colors.length]}
                  strokeWidth="20"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-sm font-medium text-slate-600">Total</div>
              <div className="text-lg font-bold text-slate-800">{total.toLocaleString()}</div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded" 
                style={{ backgroundColor: colors[index % colors.length] }}
              ></div>
              <span className="text-sm text-slate-600">{item.label}</span>
              <span className="text-sm font-medium text-slate-800">
                {((item.value / total) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Statistics Card Component
export const StatCard = ({ title, value, change, changeType, icon }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${
              changeType === 'positive' ? 'text-green-600' : 
              changeType === 'negative' ? 'text-red-600' : 'text-slate-600'
            }`}>
              {changeType === 'positive' ? '↗' : changeType === 'negative' ? '↘' : '→'} {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

// Trend Line Component (Simple)
export const TrendLine = ({ data, title, height = 200 }) => {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map(item => item.value));
  const minValue = Math.min(...data.map(item => item.value));
  const range = maxValue - minValue || 1;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
      <div className="relative" style={{ height: `${height}px` }}>
        <svg width="100%" height={height} className="absolute inset-0">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#1e293b" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(percent => (
            <line
              key={percent}
              x1="0"
              y1={`${percent}%`}
              x2="100%"
              y2={`${percent}%`}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}
          
          {/* Trend line */}
          <polyline
            fill="none"
            stroke="#1e293b"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={data.map((item, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - ((item.value - minValue) / range) * 100;
              return `${x}%,${y}%`;
            }).join(' ')}
            className="transition-all duration-1000"
          />
          
          {/* Fill area */}
          <polygon
            fill="url(#gradient)"
            points={`0,100% ${data.map((item, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - ((item.value - minValue) / range) * 100;
              return `${x}%,${y}%`;
            }).join(' ')} 100%,100%`}
            className="transition-all duration-1000"
          />
          
          {/* Data points */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - ((item.value - minValue) / range) * 100;
            return (
              <circle
                key={index}
                cx={`${x}%`}
                cy={`${y}%`}
                r="4"
                fill="#1e293b"
                className="transition-all duration-1000"
              />
            );
          })}
        </svg>
      </div>
      
      <div className="flex justify-between mt-4 text-sm text-slate-600">
        {data.map((item, index) => (
          <span key={index}>{item.label}</span>
        ))}
      </div>
    </div>
  );
};

// Default export object dengan semua chart components
const Charts = {
  BarChart,
  ProgressRing,
  DonutChart,
  StatCard,
  TrendLine
};

export default Charts;