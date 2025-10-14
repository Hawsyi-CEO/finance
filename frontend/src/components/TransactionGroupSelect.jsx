import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import { transactionGroupService } from '../services/transactionGroupService';
import TransactionGroupForm from './TransactionGroupForm';

const TransactionGroupSelect = ({ 
  value, 
  onChange, 
  type = 'both', // 'income', 'expense', or 'both'
  placeholder = 'Pilih kelompok transaksi...',
  required = false 
}) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedType, setSelectedType] = useState('income');

  useEffect(() => {
    fetchGroups();
  }, [type]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await transactionGroupService.getOptions(type);
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching transaction groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (formData) => {
    try {
      const response = await transactionGroupService.create(formData);
      
      // Refresh the groups list to get updated data
      await fetchGroups();
      
      // Select the newly created group
      if (response.data.group) {
        onChange(response.data.group.id);
      }
      
      // Close form
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating transaction group:', error);
      throw error;
    }
  };

  const openCreateForm = (groupType) => {
    setSelectedType(groupType);
    setShowCreateForm(true);
  };

  const renderGroupsByType = (groupType) => {
    const filteredGroups = groups.filter(group => group.type === groupType);
    
    if (filteredGroups.length === 0) return null;

    return (
      <optgroup label={groupType === 'income' ? 'Kelompok Pemasukan' : 'Kelompok Pengeluaran'}>
        {filteredGroups.map(group => (
          <option key={group.id} value={group.id}>
            {group.name}
          </option>
        ))}
        <option value={`create-${groupType}`} className="font-medium italic">
          + Buat kelompok {groupType === 'income' ? 'pemasukan' : 'pengeluaran'} baru
        </option>
      </optgroup>
    );
  };

  const handleSelectChange = (e) => {
    const selectedValue = e.target.value;
    
    if (selectedValue.startsWith('create-')) {
      const groupType = selectedValue.split('-')[1];
      openCreateForm(groupType);
      return;
    }
    
    onChange(selectedValue);
  };

  if (loading) {
    return (
      <select disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100">
        <option>Loading...</option>
      </select>
    );
  }

  return (
    <>
      <div className="relative">
        <select
          value={value || ''}
          onChange={handleSelectChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
          required={required}
        >
          <option value="">{placeholder}</option>
          {type === 'both' && (
            <>
              {renderGroupsByType('income')}
              {renderGroupsByType('expense')}
            </>
          )}
          {type !== 'both' && renderGroupsByType(type)}
        </select>
        
        {/* Quick add buttons for specific types */}
        {type !== 'both' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-2">
            <button
              type="button"
              onClick={() => openCreateForm(type)}
              className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
              title={`Buat kelompok ${type === 'income' ? 'pemasukan' : 'pengeluaran'} baru`}
            >
              <PlusIcon className="h-4 w-4" />
            </button>
            <Link
              to="/transaction-groups"
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors"
              title="Kelola semua kelompok"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
          </div>
        )}
      </div>

      <TransactionGroupForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateGroup}
        type={selectedType}
      />
    </>
  );
};

export default TransactionGroupSelect;
