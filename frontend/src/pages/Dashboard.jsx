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
  CalendarIcon,
  UsersIcon,
  BanknotesIcon,
  ArrowUpIcon,
  ArrowDownIcon
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
      currency: 'IDR'
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
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Selamat Datang, {user?.name || 'User'}! 👋</h1>
            <p className="text-blue-100">Kelola keuangan Vertinova dengan mudah dan efisien</p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="text-right">
              <p className="text-blue-100 text-sm">Saldo Saat Ini</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.balance)}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Pemasukan */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ArrowTrendingUpIcon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-green-900 mb-1">Total Pemasukan</p>
                <p className="text-2xl font-bold text-green-700">{formatCurrency(stats.total_income)}</p>
                <p className="text-xs text-green-600 mt-1">↗ Bulan ini</p>
              </div>
            </div>
          </div>
        </div>

        {/* Total Pengeluaran */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ArrowTrendingDownIcon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-red-900 mb-1">Total Pengeluaran</p>
                <p className="text-2xl font-bold text-red-700">{formatCurrency(stats.total_expense)}</p>
                <p className="text-xs text-red-600 mt-1">↘ Bulan ini</p>
              </div>
            </div>
          </div>
        </div>

        {/* Saldo */}
        <div className={`bg-gradient-to-br ${stats.balance >= 0 ? 'from-blue-50 to-blue-100 border-blue-200' : 'from-orange-50 to-orange-100 border-orange-200'} border rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105`}>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 bg-gradient-to-br ${stats.balance >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} rounded-xl flex items-center justify-center shadow-lg`}>
                  <CurrencyDollarIcon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className={`text-sm font-medium ${stats.balance >= 0 ? 'text-blue-900' : 'text-orange-900'} mb-1`}>Saldo Bersih</p>
                <p className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                  {formatCurrency(stats.balance)}
                </p>
                <p className={`text-xs ${stats.balance >= 0 ? 'text-blue-600' : 'text-orange-600'} mt-1`}>
                  {stats.balance >= 0 ? '✓ Surplus' : '⚠ Defisit'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Total Transaksi */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ChartBarIcon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-purple-900 mb-1">Total Transaksi</p>
                <p className="text-2xl font-bold text-purple-700">{stats.transaction_count}</p>
                <p className="text-xs text-purple-600 mt-1">📊 Semua waktu</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/transactions" className="group">
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 transform hover:scale-105">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4 group-hover:bg-blue-500 transition-colors">
              <PlusIcon className="w-6 h-6 text-blue-600 group-hover:text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tambah Transaksi</h3>
            <p className="text-gray-600 text-sm">Catat pemasukan atau pengeluaran baru</p>
          </div>
        </Link>

        <Link to="/transaction-groups" className="group">
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 transform hover:scale-105">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-4 group-hover:bg-purple-500 transition-colors">
              <FolderIcon className="w-6 h-6 text-purple-600 group-hover:text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Kelola Kelompok</h3>
            <p className="text-gray-600 text-sm">Atur kategori transaksi Anda</p>
          </div>
        </Link>

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
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <ChartBarIcon className="w-5 h-5 mr-2 text-blue-600" />
              Transaksi Terbaru
            </h3>
            <Link 
              to="/transactions" 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              <span>Lihat Semua</span>
              <EyeIcon className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
