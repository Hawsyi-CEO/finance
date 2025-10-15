import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  CurrencyDollarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  ChartBarIcon,
  EyeIcon,
  PlusIcon,
  FolderIcon
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '../components/LoadingComponents';

const Dashboard = () => {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [stats, setStats] = useState({
    total_income: 0,
    total_expense: 0,
    balance: 0,
    transaction_count: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchDashboardData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, transactionsResponse] = await Promise.all([
        api.get('/transactions/statistics'),
        api.get('/transactions?limit=5')
      ]);
      
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }
      
      if (transactionsResponse.data.success) {
        setRecentTransactions(transactionsResponse.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
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
                <p className="text-xs md:text-sm font-medium text-slate-600 mb-1">Total Pemasukan</p>
                <p className="text-sm md:text-lg font-bold text-slate-800 break-words leading-tight truncate">{formatCurrency(stats.income)}</p>
                <p className="text-xs text-slate-500 mt-1 hidden sm:block">💰 Bulan ini</p>
              </div>
            </div>
          </div>
        </div>

        {/* Total Pengeluaran */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
          <div className="p-4 md:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-800 rounded-xl flex items-center justify-center shadow-lg">
                  <ArrowTrendingDownIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
              <div className="ml-3 md:ml-4 flex-1 min-w-0 overflow-hidden">
                <p className="text-xs md:text-sm font-medium text-slate-600 mb-1">Total Pengeluaran</p>
                <p className="text-sm md:text-lg font-bold text-slate-800 break-words leading-tight truncate">{formatCurrency(Math.abs(stats.expenses))}</p>
                <p className="text-xs text-slate-500 mt-1 hidden sm:block">💸 Bulan ini</p>
              </div>
            </div>
          </div>
        </div>

        {/* Saldo */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
          <div className="p-4 md:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-800 rounded-xl flex items-center justify-center shadow-lg">
                  <CurrencyDollarIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
              <div className="ml-3 md:ml-4 flex-1 min-w-0 overflow-hidden">
                <p className="text-xs md:text-sm font-medium text-slate-600 mb-1">Saldo Bersih</p>
                <p className={`text-sm md:text-lg font-bold break-words leading-tight truncate ${stats.balance >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
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
        <div className="bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
          <div className="p-4 md:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-800 rounded-xl flex items-center justify-center shadow-lg">
                  <ChartBarIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
              <div className="ml-3 md:ml-4 flex-1 min-w-0 overflow-hidden">
                <p className="text-xs md:text-sm font-medium text-slate-600 mb-1">Total Transaksi</p>
                <p className="text-sm md:text-lg font-bold text-slate-800 break-words leading-tight truncate">{stats.transaction_count}</p>
                <p className="text-xs text-slate-500 mt-1 hidden sm:block">📊 Semua waktu</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Link to="/transactions" className="group">
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-4 md:p-6 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 transform hover:scale-105">
            <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-xl mb-3 md:mb-4 group-hover:bg-blue-500 transition-colors">
              <PlusIcon className="w-5 h-5 md:w-6 md:h-6 text-blue-600 group-hover:text-white" />
            </div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 md:mb-2">Tambah Transaksi</h3>
            <p className="text-gray-600 text-xs md:text-sm">Catat pemasukan atau pengeluaran baru</p>
          </div>
        </Link>

        <Link to="/transaction-groups" className="group">
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-4 md:p-6 hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 transform hover:scale-105">
            <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-xl mb-3 md:mb-4 group-hover:bg-purple-500 transition-colors">
              <FolderIcon className="w-5 h-5 md:w-6 md:h-6 text-purple-600 group-hover:text-white" />
            </div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 md:mb-2">Kelola Kelompok</h3>
            <p className="text-gray-600 text-xs md:text-sm">Atur kelompok transaksi</p>
          </div>
        </Link>

        {(user?.role === 'admin' || user?.role === 'finance') && (
          <Link to="/reports" className="group">
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-slate-500 hover:bg-slate-50 transition-all duration-200 transform hover:scale-105">
              <div className="flex items-center justify-center w-12 h-12 bg-slate-100 rounded-xl mb-4 group-hover:bg-slate-800 transition-colors">
                <ChartBarIcon className="w-6 h-6 text-slate-600 group-hover:text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Laporan Keuangan</h3>
              <p className="text-gray-600 text-sm">Analisis keuangan bulanan & tahunan</p>
            </div>
          </Link>
        )}

        {(user?.role === 'admin') && (
          <Link to="/users" className="group">
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-green-500 hover:bg-green-50 transition-all duration-200 transform hover:scale-105">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-4 group-hover:bg-green-500 transition-colors">
                <UsersIcon className="w-6 h-6 text-green-600 group-hover:text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Kelola User</h3>
              <p className="text-gray-600 text-sm">Manage pengguna sistem</p>
            </div>
          </Link>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg">
        <div className="px-4 md:px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 flex items-center">
              <ChartBarIcon className="w-4 h-4 md:w-5 md:h-5 mr-2 text-blue-600" />
              <span className="hidden sm:inline">Transaksi Terbaru</span>
              <span className="sm:hidden">Transaksi</span>
            </h3>
            <Link 
              to="/transactions" 
              className="text-blue-600 hover:text-blue-800 text-xs md:text-sm font-medium flex items-center"
            >
              <span className="hidden sm:inline">Lihat Semua</span>
              <span className="sm:hidden">Semua</span>
              <EyeIcon className="w-3 h-3 md:w-4 md:h-4 ml-1" />
            </Link>
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
