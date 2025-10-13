import React, { useState, useEffect } from 'react';
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
      
      // Add new group to the list
      setGroups([...groups, response.data.group]);
      
      // Select the newly created group
      onChange(response.data.group.id);
      
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <button
            type="button"
            onClick={() => openCreateForm(type)}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-700"
            title={`Buat kelompok ${type === 'income' ? 'pemasukan' : 'pengeluaran'} baru`}
          >
            <PlusIcon className="h-4 w-4" />
          </button>
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
