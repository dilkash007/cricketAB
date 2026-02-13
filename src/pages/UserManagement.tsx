import React, { useState, useEffect } from 'react';
import {
  Plus, Search, MoreVertical, Wallet, Shield,
  TrendingUp, Edit3, Trash2, Ban, CheckCircle,
  Loader2, AlertCircle, RefreshCw, DollarSign, X
} from 'lucide-react';
import { ApiService } from '../api_service';
import { User } from '../types';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<User | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await ApiService.getSite3Users();
      console.log('Users fetched:', data);
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as any;

    const userData = {
      user_id: form.user_id.value,
      username: form.username.value,
      password: form.password.value, // Admin sets password
      balance: parseFloat(form.balance.value) || 0,
      vendor_id: form.vendor_id.value || null
    };

    const result = await ApiService.createSite3User(userData);

    if (result.success) {
      setShowCreateModal(false);
      fetchUsers();
      alert(`✅ User created successfully!\n\nLogin Credentials:\nUser ID: ${userData.user_id}\nPassword: ${userData.password}\n\n⚠️ Share these credentials with the user.`);
    } else {
      alert('❌ Error: ' + result.error);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal) return;

    const form = e.target as any;

    const userData = {
      username: form.username.value,
      balance: parseFloat(form.balance.value),
      exposure: parseFloat(form.exposure.value),
      vendor_id: form.vendor_id.value || null
    };

    const result = await ApiService.updateSite3User(showEditModal.id, userData);

    if (result.success) {
      setShowEditModal(null);
      fetchUsers();
      alert('✅ User updated successfully!');
    } else {
      alert('❌ Error: ' + result.error);
    }
  };

  const handleDeleteUser = async () => {
    if (!showDeleteModal) return;

    const result = await ApiService.deleteSite3User(showDeleteModal.id);

    if (result.success) {
      setShowDeleteModal(null);
      fetchUsers();
      alert('✅ User deleted successfully!');
    } else {
      alert('❌ Error: ' + result.error);
    }
  };

  const handleStatusToggle = async (user: User) => {
    const newStatus = user.status === 'Active' ? 'Blocked' : 'Active';

    const result = await ApiService.updateSite3User(user.id, { status: newStatus });

    if (result.success) {
      fetchUsers();
    }
  };

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.user_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Player Management</h1>
          <p className="text-slate-500 text-xs md:text-sm font-medium">Monitor active players and betting accounts</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg"
        >
          <Plus size={18} /> ADD NEW PLAYER
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SmallStat label="TOTAL PLAYERS" value={users.length} icon={Shield} color="text-indigo-500" bg="bg-indigo-50" />
        <SmallStat label="ACTIVE PLAYERS" value={users.filter(u => u.status === 'Active').length} icon={CheckCircle} color="text-emerald-500" bg="bg-emerald-50" />
        <SmallStat label="TOTAL BALANCE" value={`$${users.reduce((sum, u) => sum + parseFloat(u.balance || '0'), 0).toLocaleString()}`} icon={DollarSign} color="text-blue-500" bg="bg-blue-50" />
        <SmallStat label="TOTAL EXPOSURE" value={`$${users.reduce((sum, u) => sum + parseFloat(u.exposure || '0'), 0).toLocaleString()}`} icon={TrendingUp} color="text-amber-500" bg="bg-amber-50" />
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex items-center gap-4 bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm">
          <Search size={18} className="text-slate-300" />
          <input
            type="text"
            placeholder="Search by username or ID..."
            className="bg-transparent border-none outline-none text-sm w-full text-slate-800 placeholder:text-slate-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={fetchUsers}
          className="p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
        >
          <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">USER PROFILE</th>
                <th className="px-8 py-5">BALANCE</th>
                <th className="px-8 py-5">EXPOSURE</th>
                <th className="px-8 py-5">AVAILABLE</th>
                <th className="px-8 py-5">STATUS</th>
                <th className="px-8 py-5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-indigo-600 mb-4" size={48} strokeWidth={1.5} />
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading Players...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <AlertCircle className="mx-auto text-slate-200 mb-4" size={60} strokeWidth={1} />
                    <p className="text-slate-400 font-bold uppercase text-sm tracking-wider">NO USERS FOUND.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const balance = parseFloat(user.balance || '0');
                  const exposure = parseFloat(user.exposure || '0');
                  const available = balance - exposure;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/30 transition-all duration-200 group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
                            {user.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{user.username}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-slate-400 font-medium">{user.user_id}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <Wallet size={16} className="text-emerald-500" />
                          <span className="text-sm font-black text-slate-900">${balance.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <TrendingUp size={16} className="text-amber-500" />
                          <span className="text-sm font-black text-slate-900">${exposure.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`text-sm font-black ${available >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          ${available.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <button
                          onClick={() => handleStatusToggle(user)}
                          className={`px-4 py-2 rounded-xl text-xs font-black border inline-flex items-center gap-2 transition-all ${user.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100'
                            }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {user.status}
                        </button>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() => setShowEditModal(user)}
                            className="p-3 bg-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => setShowDeleteModal(user)}
                            className="p-3 bg-slate-100 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-900">Create New Player</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">User ID</label>
                  <input name="user_id" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="USR-001" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">Username</label>
                  <input name="username" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="playeruser" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">Initial Balance</label>
                  <input name="balance" type="number" step="0.01" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="5000.00" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">Password *</label>
                  <input
                    name="password"
                    type="text"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    placeholder="Min 6 characters"
                  />
                  <p className="text-xs text-slate-400 mt-1">⚠️ Save this password to give to user for login</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">Vendor ID (Optional)</label>
                  <input name="vendor_id" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="VND-001" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-all font-bold">
                  Create Player
                </button>
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-6 bg-slate-100 text-slate-600 py-3 rounded-xl hover:bg-slate-200 transition-all font-bold">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-900">Edit Player</h2>
              <button onClick={() => setShowEditModal(null)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">Username</label>
                  <input name="username" defaultValue={showEditModal.username} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">Balance</label>
                  <input name="balance" type="number" step="0.01" defaultValue={showEditModal.balance} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">Exposure</label>
                  <input name="exposure" type="number" step="0.01" defaultValue={showEditModal.exposure} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">Vendor ID</label>
                  <input name="vendor_id" defaultValue={showEditModal.vendor_id || ''} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-all font-bold">
                  Save Changes
                </button>
                <button type="button" onClick={() => setShowEditModal(null)} className="px-6 bg-slate-100 text-slate-600 py-3 rounded-xl hover:bg-slate-200 transition-all font-bold">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="text-rose-600" size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Delete Player?</h2>
              <p className="text-slate-500 mb-6">
                Are you sure you want to delete <strong>{showDeleteModal.username}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteUser}
                  className="flex-1 bg-rose-600 text-white py-3 rounded-xl hover:bg-rose-700 transition-all font-bold"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl hover:bg-slate-200 transition-all font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SmallStat = ({ label, value, icon: Icon, color, bg }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-lg transition-all duration-300">
    <div className={`p-4 rounded-xl ${bg} ${color}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <h4 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h4>
    </div>
  </div>
);

export default UserManagement;
