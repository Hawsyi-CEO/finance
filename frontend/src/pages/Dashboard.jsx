import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCache } from '../context/CacheContext';
import { 
  CurrencyDollarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  ChartBarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '../components/LoadingComponents';

const Dashboard = () => {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { isCacheValid, getCache, setCache, shouldRefetchTransactions } = useCache();
  const [stats, setStats] = useState({
    total_income: 0,
    total_expense: 0,
    balance: 0,
    transaction_count: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async (force = false) => {
    try {
      // Check if we have valid cached data and not forcing refresh
      if (!force && isCacheValid('dashboard', 5 * 60 * 1000)) {
        const cachedData = getCache('dashboard');
        if (cachedData.stats) {
          setStats(cachedData.stats);
        }
        if (cachedData.transactions) {
          setRecentTransactions(cachedData.transactions);
        }
        setLoading(false);
        return;
      }

      // Always fetch stats to check transaction count
      const statsResponse = await api.get('/transactions/statistics');
      
      if (statsResponse.data.success) {
        const newStats = statsResponse.data.data;
        setStats(newStats);
        
        // Check if we need to refetch transactions based on count change
        const needsTransactionRefetch = shouldRefetchTransactions(newStats.transaction_count);
        
        // Get existing cache
        const existingCache = getCache('dashboard') || {};
        
        // Only fetch transactions if:
        // 1. Never loaded before, OR
        // 2. Transaction count changed, OR  
        // 3. Force refresh requested, OR
        // 4. No cached transactions
        if (needsTransactionRefetch || force || !existingCache.transactions) {
          const transactionsResponse = await api.get('/transactions?limit=1');
          
          if (transactionsResponse.data.success) {
            const newTransactions = transactionsResponse.data.data || [];
            setRecentTransactions(newTransactions);
            
            // Update cache with both stats and transactions
            setCache('dashboard', {
              stats: newStats,
              transactions: newTransactions
            });
          }
        } else {
          // Use cached transactions, update only stats
          if (existingCache.transactions) {
            setRecentTransactions(existingCache.transactions);
          }
          setCache('dashboard', {
            stats: newStats,
            transactions: existingCache.transactions || []
          });
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [isCacheValid, getCache, setCache, shouldRefetchTransactions]);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchDashboardData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading, fetchDashboardData]);

  // Refresh function for manual refresh
  const refreshDashboard = useCallback(() => {
    setLoading(true);
    fetchDashboardData(true);
  }, [fetchDashboardData]);

  // Auto refresh every 10 minutes if user is active
  useEffect(() => {
    if (!isAuthenticated || authLoading) return;
    
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 10 * 60 * 1000); // 10 minutes
    
    return () => clearInterval(interval);
  }, [isAuthenticated, authLoading, fetchDashboardData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-slate-800"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Please login to access dashboard</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-800 rounded-xl shadow-lg p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Selamat Datang, {user?.name || 'User'}! 👋</h1>
            <p className="text-slate-300">Kelola keuangan Vertinova dengan mudah dan efisien</p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="text-right">
              <p className="text-slate-300 text-sm">Saldo Saat Ini</p>
              <p className="text-2xl font-bold truncate">{formatCurrency(stats.balance)}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Pemasukan */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
          <div className="p-4 md:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-800 rounded-xl flex items-center justify-center shadow-lg">
                  <ArrowTrendingUpIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
              <div className="ml-3 md:ml-4 flex-1 min-w-0 overflow-hidden">
                <p className="text-xs font-medium text-slate-600 mb-1 truncate">Total Pemasukan</p>
                <p className="text-xs md:text-sm font-bold text-slate-800 leading-tight truncate">{formatCurrency(stats.total_income || 0)}</p>
                <p className="text-xs text-slate-500 mt-1 hidden sm:block">💰 Bulan ini</p>
              </div>
            </div>
          </div>
        </div>

        {/* Total Pengeluaran */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
          <div className="p-4 md:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-800 rounded-xl flex items-center justify-center shadow-lg">
                  <ArrowTrendingDownIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
              <div className="ml-3 md:ml-4 flex-1 min-w-0 overflow-hidden">
                <p className="text-xs font-medium text-slate-600 mb-1 truncate">Total Pengeluaran</p>
                <p className="text-xs md:text-sm font-bold text-slate-800 leading-tight truncate">{formatCurrency(Math.abs(stats.total_expense || 0))}</p>
                <p className="text-xs text-slate-500 mt-1 hidden sm:block">💸 Bulan ini</p>
              </div>
            </div>
          </div>
        </div>

        {/* Saldo */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
          <div className="p-4 md:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-800 rounded-xl flex items-center justify-center shadow-lg">
                  <CurrencyDollarIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
              <div className="ml-3 md:ml-4 flex-1 min-w-0 overflow-hidden">
                <p className="text-xs font-medium text-slate-600 mb-1 truncate">Saldo Bersih</p>
                <p className={`text-xs md:text-sm font-bold leading-tight truncate ${stats.balance >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
                  {formatCurrency(stats.balance)}
                </p>
                <p className={`text-xs mt-1 hidden sm:block ${stats.balance >= 0 ? 'text-slate-500' : 'text-red-500'}`}>
                  {stats.balance >= 0 ? '✓ Surplus' : '⚠ Defisit'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Total Transaksi */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
          <div className="p-4 md:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-800 rounded-xl flex items-center justify-center shadow-lg">
                  <ChartBarIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
              <div className="ml-3 md:ml-4 flex-1 min-w-0 overflow-hidden">
                <p className="text-xs font-medium text-slate-600 mb-1 truncate">Total Transaksi</p>
                <p className="text-xs md:text-sm font-bold text-slate-800 leading-tight truncate">{stats.transaction_count || 0}</p>
                <p className="text-xs text-slate-500 mt-1 hidden sm:block">📊 Semua waktu</p>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Recent Transactions */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg">
        <div className="px-4 md:px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 flex items-center">
              <ChartBarIcon className="w-4 h-4 md:w-5 md:h-5 mr-2 text-slate-800" />
              <span className="hidden sm:inline">Transaksi Terbaru</span>
              <span className="sm:hidden">Transaksi</span>
              {isCacheValid('dashboard', 5 * 60 * 1000) && (
                <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  📋 Cached
                </span>
              )}
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={refreshDashboard}
                disabled={loading}
                className="text-slate-600 hover:text-slate-800 text-xs font-medium flex items-center disabled:opacity-50"
                title="Refresh data"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <Link 
                to="/transactions" 
                className="text-slate-800 hover:text-slate-700 text-xs md:text-sm font-medium flex items-center"
              >
                <span className="hidden sm:inline">Lihat Semua</span>
                <span className="sm:hidden">Semua</span>
                <EyeIcon className="w-3 h-3 md:w-4 md:h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
        <div className="p-3 md:p-6">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deskripsi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(transaction.date).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transaction.type === 'income' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                      Belum ada transaksi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <div key={transaction.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(transaction.date).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                      transaction.type === 'income' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type === 'income' ? 'Masuk' : 'Keluar'}
                    </span>
                  </div>
                  <div className="flex justify-end">
                    <span className={`text-sm font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                Belum ada transaksi
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
