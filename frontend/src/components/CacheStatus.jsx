import React from 'react';
import { useCache } from '../context/CacheContext';

const CacheStatus = ({ page, params = null, className = "" }) => {
  const { isCacheValid } = useCache();
  
  const isValid = isCacheValid(page, 5 * 60 * 1000, params);
  
  if (!isValid) return null;
  
  return (
    <span className={`inline-flex items-center text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full ${className}`}>
      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      Cached
    </span>
  );
};

export default CacheStatus;