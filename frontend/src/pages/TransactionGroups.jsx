import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { transactionGroupService } from '../services/transactionGroupService';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  FolderIcon,
  TagIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

const TransactionGroups = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'income', 'expense'
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'income',
    color: '#3B82F6'
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await transactionGroupService.getAll();
      setGroups(response.data.data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGroup) {
        await transactionGroupService.update(editingGroup.id, formData);
        showSuccessMessage('Kelompok berhasil diperbarui!');
      } else {
        await transactionGroupService.create(formData);
        showSuccessMessage('Kelompok baru berhasil ditambahkan!');
      }
      
      await fetchGroups();
      resetForm();
    } catch (error) {
      console.error('Error saving group:', error);
      alert('Terjadi kesalahan saat menyimpan kelompok');
    }
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description || '',
      type: group.type,
      color: group.color || '#3B82F6'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kelompok ini?')) {
      try {
        await transactionGroupService.delete(id);
        await fetchGroups();
        showSuccessMessage('Kelompok berhasil dihapus!');
      } catch (error) {
        console.error('Error deleting group:', error);
        alert('Terjadi kesalahan saat menghapus kelompok');
      }
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingGroup(null);
    setFormData({
      name: '',
      description: '',
      type: 'income',
      color: '#3B82F6'
    });
  };

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const filteredGroups = groups.filter(group => {
    if (activeTab === 'all') return true;
    return group.type === activeTab;
  });

  const incomeGroups = groups.filter(g => g.type === 'income');
  const expenseGroups = groups.filter(g => g.type === 'expense');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Notification */}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3 animate-fade-in">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-green-800 font-medium">{successMessage}</p>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
              <FolderIcon className="h-8 w-8 text-blue-600" />
              <span>Kelompok Transaksi</span>
            </h1>
            <p className="text-gray-600 mt-1">Kelola kategori pemasukan dan pengeluaran</p>
          </div>
          
          {(user?.role === 'admin' || user?.role === 'finance') && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Tambah Kelompok</span>
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="flex items-center">
              <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-900">Kelompok Pemasukan</p>
                <p className="text-2xl font-bold text-green-700">{incomeGroups.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
            <div className="flex items-center">
              <ArrowTrendingDownIcon className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-red-900">Kelompok Pengeluaran</p>
                <p className="text-2xl font-bold text-red-700">{expenseGroups.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-900">Total Kelompok</p>
                <p className="text-2xl font-bold text-blue-700">{groups.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { key: 'all', name: 'Semua', count: groups.length },
              { key: 'income', name: 'Pemasukan', count: incomeGroups.length },
              { key: 'expense', name: 'Pengeluaran', count: expenseGroups.length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === tab.key 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Groups Grid */}
        <div className="p-6">
          {filteredGroups.length === 0 ? (
            <div className="text-center py-12">
              <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada kelompok</h3>
              <p className="mt-1 text-sm text-gray-500">
                Mulai dengan membuat kelompok transaksi pertama Anda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGroups.map((group) => (
                <div
                  key={group.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: group.color || '#3B82F6' }}
                      ></div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          group.type === 'income' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {group.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                        </span>
                      </div>
                    </div>
                    
                    {(user?.role === 'admin' || user?.role === 'finance') && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(group)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(group.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {group.description && (
                    <p className="mt-3 text-sm text-gray-600">{group.description}</p>
                  )}
                  
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <TagIcon className="h-4 w-4 mr-1" />
                    <span>Dibuat: {new Date(group.created_at).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingGroup ? 'Edit Kelompok' : 'Tambah Kelompok Baru'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Kelompok *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Masukkan nama kelompok"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipe Transaksi *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                >
                  <option value="income">Pemasukan</option>
                  <option value="expense">Pengeluaran</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Deskripsi kelompok (opsional)"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warna
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105"
                >
                  {editingGroup ? 'Perbarui' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionGroups;