'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Transaction {
  _id: string;
  type: string;
  timestamp: string;
  recorded_by_user_id: {
    username: string;
  };
  equipment_type_id: {
    name: string;
    category: string;
  };
  quantity: number;
  from_base_id?: {
    name: string;
  };
  to_base_id?: {
    name: string;
  };
  assigned_to_personnel?: string;
  notes?: string;
}

interface Base {
  _id: string;
  name: string;
}

interface EquipmentType {
  _id: string;
  name: string;
  category: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bases, setBases] = useState<Base[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'PURCHASE',
    equipment_type_id: '',
    quantity: 1,
    from_base_id: '',
    to_base_id: '',
    assigned_to_personnel: '',
    notes: ''
  });
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [transactionsRes, basesRes, equipmentRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/bases'),
        fetch('/api/equipment-types')
      ]);

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        setTransactions(transactionsData);
      }

      if (basesRes.ok) {
        const basesData = await basesRes.json();
        setBases(basesData);
      }

      if (equipmentRes.ok) {
        const equipmentData = await equipmentRes.json();
        setEquipmentTypes(equipmentData);
      }

      if (transactionsRes.status === 401 || basesRes.status === 401 || equipmentRes.status === 401) {
        router.push('/login');
      }
    } catch (err) {
      setError('An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setFormData({
          type: 'PURCHASE',
          equipment_type_id: '',
          quantity: 1,
          from_base_id: '',
          to_base_id: '',
          assigned_to_personnel: '',
          notes: ''
        });
        setShowForm(false);
        fetchData();
      } else {
        setError('Failed to create transaction');
      }
    } catch (err) {
      setError('An error occurred while creating transaction');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Military Asset Management System
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push('/bases')}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Bases
              </button>
              <button
                onClick={() => router.push('/equipment')}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Equipment
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Transactions</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              {showForm ? 'Cancel' : 'Add Transaction'}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {showForm && (
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Transaction</h3>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="PURCHASE">Purchase</option>
                      <option value="TRANSFER">Transfer</option>
                      <option value="ASSIGNMENT">Assignment</option>
                      <option value="EXPENDITURE">Expenditure</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Equipment Type</label>
                    <select
                      required
                      value={formData.equipment_type_id}
                      onChange={(e) => setFormData({ ...formData, equipment_type_id: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">Select Equipment Type</option>
                      {equipmentTypes.map((eq) => (
                        <option key={eq._id} value={eq._id}>{eq.name} ({eq.category})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  {(formData.type === 'TRANSFER' || formData.type === 'ASSIGNMENT' || formData.type === 'EXPENDITURE') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">From Base</label>
                      <select
                        required
                        value={formData.from_base_id}
                        onChange={(e) => setFormData({ ...formData, from_base_id: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="">Select Base</option>
                        {bases.map((base) => (
                          <option key={base._id} value={base._id}>{base.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {(formData.type === 'PURCHASE' || formData.type === 'TRANSFER') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">To Base</label>
                      <select
                        required
                        value={formData.to_base_id}
                        onChange={(e) => setFormData({ ...formData, to_base_id: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="">Select Base</option>
                        {bases.map((base) => (
                          <option key={base._id} value={base._id}>{base.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {formData.type === 'ASSIGNMENT' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Assigned to Personnel</label>
                      <input
                        type="text"
                        required
                        value={formData.assigned_to_personnel}
                        onChange={(e) => setFormData({ ...formData, assigned_to_personnel: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Create Transaction
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <li key={transaction._id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {transaction.type.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.type} - {transaction.equipment_type_id.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              Quantity: {transaction.quantity} | By: {transaction.recorded_by_user_id.username}
                            </div>
                            {(transaction.from_base_id || transaction.to_base_id) && (
                              <div className="text-sm text-gray-500">
                                {transaction.from_base_id && `From: ${transaction.from_base_id.name}`}
                                {transaction.from_base_id && transaction.to_base_id && ' | '}
                                {transaction.to_base_id && `To: ${transaction.to_base_id.name}`}
                              </div>
                            )}
                            {transaction.assigned_to_personnel && (
                              <div className="text-sm text-gray-500">
                                Assigned to: {transaction.assigned_to_personnel}
                              </div>
                            )}
                            {transaction.notes && (
                              <div className="text-sm text-gray-500">
                                Notes: {transaction.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(transaction.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
