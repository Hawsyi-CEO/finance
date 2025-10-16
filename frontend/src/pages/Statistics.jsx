import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCache } from '../context/CacheContext';
import api from '../services/api';
import Charts from '../components/Charts';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const Statistics = () => {
  const { user } = useAuth();
  const { isCacheValid, getCache, setCache } = useCache();
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [statistics, setStatistics] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netIncome: 0,
    transactionCount: 0,
    topCategories: [],
    monthlyTrend: [],
    dailyTransactions: []
  });

  useEffect(() => {
    fetchStatistics();
  }, [dateFilter, selectedYear, selectedMonth]);

  const fetchStatistics = async () => {
    const cacheKey = { type: dateFilter, year: selectedYear, month: selectedMonth };
    
    // Check if we have valid cached data
    if (isCacheValid('statistics', 5 * 60 * 1000, cacheKey)) {
      const cachedData = getCache('statistics', cacheKey);
      if (cachedData.data) {
        setStatistics(cachedData.data);
        return;
      }
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: dateFilter,
        year: selectedYear,
        ...(dateFilter === 'monthly' && { month: selectedMonth })
      });

      const response = await api.get(`/transactions/reports?${params}`);
      
      if (response.data.success) {
        const data = response.data.data;
        const processedStatistics = {
          totalIncome: data.income || 0,
          totalExpense: data.expenses || 0,
          netIncome: (data.income || 0) - (data.expenses || 0),
          transactionCount: data.transactions?.length || 0,
          topCategories: processTopCategories(data.transactions || []),
          monthlyTrend: processMonthlyTrend(data.transactions || []),
          dailyTransactions: processDailyTransactions(data.transactions || [])
        };
        
        setStatistics(processedStatistics);
        
        // Cache the processed data
        setCache('statistics', { data: processedStatistics }, cacheKey);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processTopCategories = (transactions) => {
    const categoryTotals = {};
    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        const category = transaction.expense_category || 'Lainnya';
        categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(transaction.amount);
      }
    });
    
    return Object.entries(categoryTotals)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  };

  const processMonthlyTrend = (transactions) => {
    const monthlyData = {};
    transactions.forEach(transaction => {
      const month = new Date(transaction.created_at).getMonth();
      const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const monthName = monthNames[month];
      
      if (!monthlyData[monthName]) {
        monthlyData[monthName] = { income: 0, expense: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlyData[monthName].income += transaction.amount;
      } else {
        monthlyData[monthName].expense += Math.abs(transaction.amount);
      }
    });
    
    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      income: data.income,
      expense: data.expense
    }));
  };

  const processDailyTransactions = (transactions) => {
    const dailyData = {};
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    last7Days.forEach(date => {
      dailyData[date] = { income: 0, expense: 0, count: 0 };
    });

    transactions.forEach(transaction => {
      const date = transaction.created_at.split(' ')[0];
      if (dailyData[date]) {
        dailyData[date].count++;
        if (transaction.type === 'income') {
          dailyData[date].income += transaction.amount;
        } else {
          dailyData[date].expense += Math.abs(transaction.amount);
        }
      }
    });

    return Object.entries(dailyData).map(([date, data]) => ({
      date: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      ...data
    }));
  };

  const formatCurrencyFull = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('id-ID').format(number);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-slate-800" />
        <span className="ml-2 text-slate-600">Memuat statistik...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center">
              <ChartBarIcon className="h-8 w-8 mr-3 text-slate-800" />
              Statistik Keuangan
            </h1>
            <p className="text-slate-600 mt-1">
              Analisis mendalam performa keuangan Anda
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
            >
              <option value="monthly">Bulanan</option>
              <option value="yearly">Tahunan</option>
            </select>
            
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            
            {dateFilter === 'monthly' && (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
              >
                {[
                  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
                ].map((month, index) => (
                  <option key={index + 1} value={index + 1}>{month}</option>
                ))}
              </select>
            )}
            
            <button
              onClick={fetchStatistics}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Pemasukan</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrencyFull(statistics.totalIncome)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Pengeluaran</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrencyFull(statistics.totalExpense)}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <ArrowTrendingDownIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Saldo Bersih</p>
              <p className={`text-2xl font-bold ${statistics.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrencyFull(statistics.netIncome)}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${statistics.netIncome >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <CurrencyDollarIcon className={`h-6 w-6 ${statistics.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Transaksi</p>
              <p className="text-2xl font-bold text-slate-800">
                {formatNumber(statistics.transactionCount)}
              </p>
            </div>
            <div className="bg-slate-100 p-3 rounded-lg">
              <CalendarDaysIcon className="h-6 w-6 text-slate-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Tren Bulanan
          </h3>
          <Charts.BarChart 
            data={statistics.monthlyTrend}
            xKey="month"
            yKey="income"
            yKey2="expense"
            height={300}
            formatValue={formatCurrencyFull}
          />
        </div>

        {/* Top Categories Donut Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Kategori Pengeluaran Tertinggi
          </h3>
          <Charts.DonutChart 
            data={statistics.topCategories}
            centerValue={formatCurrencyFull(statistics.totalExpense)}
            centerLabel="Total Pengeluaran"
            height={300}
            formatValue={formatCurrencyFull}
          />
        </div>

        {/* Daily Transactions */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Aktivitas 7 Hari Terakhir
          </h3>
          <Charts.TrendLine 
            data={statistics.dailyTransactions}
            xKey="date"
            yKey="count"
            height={300}
            formatValue={(value) => `${value} transaksi`}
          />
        </div>

        {/* Financial Health Progress */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Kesehatan Keuangan
          </h3>
          <div className="space-y-6">
            <Charts.ProgressRing
              percentage={Math.min((statistics.netIncome / Math.max(statistics.totalIncome, 1)) * 100, 100)}
              size={120}
              strokeWidth={8}
              label="Rasio Tabungan"
              value={`${Math.round(Math.min((statistics.netIncome / Math.max(statistics.totalIncome, 1)) * 100, 100))}%`}
            />
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Charts.StatCard
                label="Efisiensi Pengeluaran"
                value={`${Math.round((statistics.totalExpense / Math.max(statistics.totalIncome, 1)) * 100)}%`}
                trend={statistics.netIncome >= 0 ? 'up' : 'down'}
                color={statistics.netIncome >= 0 ? 'green' : 'red'}
              />
              <Charts.StatCard
                label="Rata-rata Harian"
                value={formatCurrencyFull(statistics.totalIncome / 30)}
                trend="neutral"
                color="blue"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Wawasan Keuangan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <ArrowTrendingUpIcon className="h-5 w-5 text-slate-800" />
              </div>
              <div>
                <h4 className="font-medium text-slate-800">Pemasukan Tertinggi</h4>
                <p className="text-sm text-slate-800 mt-1">
                  {statistics.topCategories.length > 0 
                    ? `Kategori ${statistics.topCategories[0]?.name} dengan ${formatCurrencyFull(statistics.topCategories[0]?.amount)}`
                    : 'Belum ada data kategori'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="bg-amber-100 p-2 rounded-lg mr-3">
                <CurrencyDollarIcon className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-medium text-amber-800">Proyeksi Bulanan</h4>
                <p className="text-sm text-amber-600 mt-1">
                  Berdasarkan pola saat ini: {formatCurrencyFull(statistics.netIncome)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <CalendarDaysIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-green-800">Rekomendasi</h4>
                <p className="text-sm text-green-600 mt-1">
                  {statistics.netIncome >= 0 
                    ? 'Keuangan sehat, pertahankan!' 
                    : 'Kurangi pengeluaran untuk stabilitas'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
