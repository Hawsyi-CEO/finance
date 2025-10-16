import React from 'react';
import { 
  CurrencyDollarIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  FolderIcon,
  UserIcon,
  PencilIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import TransactionGroupSelect from './TransactionGroupSelect';
import ValidationError from './ValidationError';

const ModernTransactionForm = ({ 
  formData, 
  setFormData, 
  onSubmit, 
  saving, 
  validationErrors, 
  editingTransaction,
  onCancel 
}) => {
  const expenseCategories = [
    'Operasional',
    'Marketing',
    'Administrasi', 
    'Transportasi',
    'Konsumsi',
    'Utilitas',
    'Peralatan',
    'Lainnya'
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      <form id="transaction-form" onSubmit={onSubmit} className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Deskripsi */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-semibold text-gray-700">
              <DocumentTextIcon className="w-5 h-5 mr-2 text-slate-600" />
              Deskripsi Transaksi
            </label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-all duration-200 bg-gray-50 focus:bg-white"
              placeholder="Contoh: Pembelian bahan baku, Penjualan produk..."
            />
            <ValidationError field="description" errors={validationErrors} />
          </div>

          {/* Tipe Transaksi */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-semibold text-gray-700">
              <CurrencyDollarIcon className="w-5 h-5 mr-2 text-slate-600" />
              Tipe Transaksi
            </label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-all duration-200 bg-gray-50 focus:bg-white"
            >
              <option value="income">💰 Pemasukan</option>
              <option value="expense">💸 Pengeluaran</option>
            </select>
            <ValidationError field="type" errors={validationErrors} />
          </div>

          {/* Jumlah */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-semibold text-gray-700">
              <CurrencyDollarIcon className="w-5 h-5 mr-2 text-slate-600" />
              Jumlah (IDR)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-500 text-sm font-medium">Rp</span>
              </div>
              <input
                type="number"
                required
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="Masukkan jumlah..."
              />
            </div>
            <ValidationError field="amount" errors={validationErrors} />
          </div>

          {/* Tanggal */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-semibold text-gray-700">
              <CalendarDaysIcon className="w-5 h-5 mr-2 text-slate-600" />
              Tanggal Transaksi
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
            <ValidationError field="date" errors={validationErrors} />
          </div>

          {/* Kelompok Transaksi */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-semibold text-gray-700">
              <FolderIcon className="w-5 h-5 mr-2 text-slate-600" />
              Kelompok Transaksi
            </label>
            <TransactionGroupSelect
              required
              value={formData.transaction_group_id}
              onChange={(value) => setFormData({...formData, transaction_group_id: value})}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
            <ValidationError field="transaction_group_id" errors={validationErrors} />
          </div>

          {/* Kategori Pengeluaran (hanya untuk expense) */}
          {formData.type === 'expense' && (
            <div className="space-y-3">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <TagIcon className="w-5 h-5 mr-2 text-slate-600" />
                Kategori Pengeluaran
              </label>
              <select
                required
                value={formData.expense_category}
                onChange={(e) => setFormData({...formData, expense_category: e.target.value})}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-all duration-200 bg-gray-50 focus:bg-white"
              >
                <option value="">Pilih kategori...</option>
                {expenseCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <ValidationError field="expense_category" errors={validationErrors} />
            </div>
          )}

          {/* Catatan */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-semibold text-gray-700">
              <DocumentTextIcon className="w-5 h-5 mr-2 text-slate-600" />
              Catatan (Opsional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
              placeholder="Tambahkan catatan jika diperlukan..."
            />
            <ValidationError field="notes" errors={validationErrors} />
          </div>

        </div>
      </form>
      
      {/* Action Buttons - Fixed at bottom */}
      <div className="p-6 bg-white border-t border-gray-200 flex space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={saving}
          form="transaction-form"
          className="flex-1 px-6 py-3 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {editingTransaction ? 'Mengupdate...' : 'Menyimpan...'}
            </>
          ) : (
            editingTransaction ? 'Update Transaksi' : 'Simpan Transaksi'
          )}
        </button>
      </div>
    </div>
  );
};

export default ModernTransactionForm;