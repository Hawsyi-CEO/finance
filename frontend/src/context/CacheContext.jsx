import React, { createContext, useContext, useRef, useCallback } from 'react';

const CacheContext = createContext();

export const useCache = () => {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useCache must be used within a CacheProvider');
  }
  return context;
};

export const CacheProvider = ({ children }) => {
  const cache = useRef({
    dashboard: {
      stats: null,
      transactions: null,
      lastFetch: null,
      transactionCount: null
    },
    statistics: {
      data: null,
      lastFetch: null
    },
    transactions: {
      data: null,
      lastFetch: null,
      filters: null
    },
    reports: {
      data: null,
      lastFetch: null,
      params: null
    }
  });

  const getCacheKey = useCallback((page, params = null) => {
    if (params) {
      return `${page}_${JSON.stringify(params)}`;
    }
    return page;
  }, []);

  const isCacheValid = useCallback((page, maxAge = 5 * 60 * 1000, params = null) => {
    const key = getCacheKey(page, params);
    const cacheData = cache.current[key];
    
    if (!cacheData || !cacheData.lastFetch) {
      return false;
    }
    
    const now = Date.now();
    return (now - cacheData.lastFetch) < maxAge;
  }, [getCacheKey]);

  const getCache = useCallback((page, params = null) => {
    const key = getCacheKey(page, params);
    return cache.current[key];
  }, [getCacheKey]);

  const setCache = useCallback((page, data, params = null) => {
    const key = getCacheKey(page, params);
    cache.current[key] = {
      ...data,
      lastFetch: Date.now()
    };
  }, [getCacheKey]);

  const clearCache = useCallback((page = null) => {
    if (page) {
      delete cache.current[page];
    } else {
      // Clear all cache
      cache.current = {
        dashboard: { stats: null, transactions: null, lastFetch: null, transactionCount: null },
        statistics: { data: null, lastFetch: null },
        transactions: { data: null, lastFetch: null, filters: null },
        reports: { data: null, lastFetch: null, params: null }
      };
    }
  }, []);

  const shouldRefetchTransactions = useCallback((newTransactionCount) => {
    const dashboardCache = cache.current.dashboard;
    if (!dashboardCache.transactionCount || dashboardCache.transactionCount !== newTransactionCount) {
      // Update transaction count and clear transaction-related caches
      dashboardCache.transactionCount = newTransactionCount;
      clearCache('transactions');
      clearCache('reports');
      clearCache('statistics');
      return true;
    }
    return false;
  }, [clearCache]);

  const value = {
    isCacheValid,
    getCache,
    setCache,
    clearCache,
    shouldRefetchTransactions
  };

  return (
    <CacheContext.Provider value={value}>
      {children}
    </CacheContext.Provider>
  );
};