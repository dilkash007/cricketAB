import React, { useState, useEffect } from 'react';
import {
  Plus, Search, MoreVertical, ExternalLink, Filter,
  DollarSign, TrendingUp, X, Wallet, UserPlus,
  Percent, RefreshCw, Trash2, ShieldAlert,
  Loader2, CheckCircle2, AlertCircle, Ban, Edit2,
  ShieldCheck, Users
} from 'lucide-react';
import { ApiService } from '../api_service';
import { Vendor } from '../types';

const VendorManagement: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<Vendor | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<Vendor | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<Vendor | null>(null);
  const [vendorDetails, setVendorDetails] = useState<any | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const handleViewDetails = async (vendor: Vendor) => {
    setShowDetailModal(vendor);
    setIsLoadingDetails(true);
    try {
      const result = await (ApiService as any).getVendorDetails(vendor.id);
      if (result.success) {
        setVendorDetails(result);
      }
    } catch (error) {
      console.error('Failed to fetch details:', error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const fetchVendors = async () => {
    setIsLoading(true);
    try {
      const data = await ApiService.getSite2Vendors();
      console.log('Vendors fetched:', data);
      setVendors(data);
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as any;

    const vendorData = {
      vendor_id: form.vendor_id.value,
      name: form.name.value,
      email: form.email.value,
      phone: form.phone.value,
      credit_limit: parseFloat(form.credit_limit.value) || 0,
      commission_rate: parseFloat(form.commission_rate.value) || 0,
      password: form.password.value // Add password field
    };

    const result = await ApiService.createSite2Vendor(vendorData);

    if (result.success) {
      setShowCreateModal(false);
      fetchVendors();
      alert(`✅ Vendor created successfully!\n\nLogin Credentials:\nVendor ID: ${vendorData.vendor_id}\nPassword: ${vendorData.password}\n\n⚠️ Share these credentials with the vendor.`);
    } else {
      alert('❌ Error: ' + result.error);
    }
  };

  const handleEditVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal) return;

    const form = e.target as any;

    const vendorData = {
      name: form.name.value,
      email: form.email.value,
      phone: form.phone.value,
      credit_limit: parseFloat(form.credit_limit.value),
      commission_rate: parseFloat(form.commission_rate.value)
    };

    const result = await ApiService.updateSite2Vendor(showEditModal.id as any, vendorData);

    if (result.success) {
      setShowEditModal(null);
      fetchVendors();
      alert('✅ Vendor updated successfully!');
    } else {
      alert('❌ Error: ' + result.error);
    }
  };

  const handleDeleteVendor = async () => {
    if (!showDeleteModal) return;

    const result = await ApiService.deleteSite2Vendor(showDeleteModal.id as any);

    if (result.success) {
      setShowDeleteModal(null);
      fetchVendors();
      alert('✅ Vendor deleted successfully!');
    } else {
      alert('❌ Error: ' + result.error);
    }
  };

  const handleStatusToggle = async (vendor: Vendor) => {
    const newStatus = vendor.status === 'Active' ? 'Inactive' : 'Active';

    const result = await ApiService.updateSite2Vendor(vendor.id as any, { status: newStatus });

    if (result.success) {
      fetchVendors();
    }
  };

  const filteredVendors = vendors.filter(v =>
    v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.vendor_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Partner Ecosystem</h1>
          <p className="text-slate-500 text-xs md:text-sm font-medium">Configure network vendors and financial yields</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg"
        >
          <Plus size={18} /> NEW PARTNER
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SmallStat label="ECOSYSTEM USAGE" value="$0K" icon={DollarSign} color="text-emerald-500" bg="bg-emerald-50" />
        <SmallStat label="AVG MARGIN" value="5.2%" icon={TrendingUp} color="text-blue-500" bg="bg-blue-50" />
        <SmallStat label="ACTIVE NODES" value={vendors.filter(v => v.status === 'Active').length} icon={CheckCircle2} color="text-indigo-500" bg="bg-indigo-50" />
        <SmallStat label="VENDOR STATUS" value="Healthy" icon={ShieldAlert} color="text-green-500" bg="bg-green-50" />
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex items-center gap-4 bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm">
          <Search size={18} className="text-slate-300" />
          <input
            type="text"
            placeholder="Search by name, ID or email..."
            className="bg-transparent border-none outline-none text-sm w-full text-slate-800 placeholder:text-slate-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={fetchVendors}
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
                <th className="px-8 py-5">PARTNER PROFILE</th>
                <th className="px-8 py-5">CREDIT USAGE / LIMIT</th>
                <th className="px-8 py-5">YIELD RATE</th>
                <th className="px-8 py-5">NODE</th>
                <th className="px-8 py-5 text-right">STATE</th>
                <th className="px-8 py-5 text-right">LEDGER CONTROL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-indigo-600 mb-4" size={48} strokeWidth={1.5} />
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Querying Ecosystem...</p>
                  </td>
                </tr>
              ) : filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <AlertCircle className="mx-auto text-slate-200 mb-4" size={60} strokeWidth={1} />
                    <p className="text-slate-400 font-bold uppercase text-sm tracking-wider">NO MATCHING RECORDS FOUND.</p>
                  </td>
                </tr>
              ) : (
                filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-slate-50/30 transition-all duration-200 group">
                    <td className="px-8 py-6 cursor-pointer hover:bg-indigo-50/50 transition-colors" onClick={() => handleViewDetails(vendor)}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
                          {vendor.name?.charAt(0) || 'V'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{vendor.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-400 font-medium">{vendor.vendor_id}</span>
                            {vendor.email && <span className="text-xs text-slate-300">•</span>}
                            {vendor.email && <span className="text-xs text-slate-400">{vendor.email}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-500">Used:</span>
                          <span className="text-sm font-black text-slate-900">${(vendor.used_credit || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-500">Limit:</span>
                          <span className="text-sm font-black text-indigo-600">${(vendor.credit_limit || 0).toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-1.5 rounded-full transition-all"
                            style={{ width: `${Math.min(((vendor.used_credit || 0) / (vendor.credit_limit || 1)) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-100">
                        {vendor.commission_rate}%
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-medium text-slate-400">{vendor.phone || 'N/A'}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={() => handleStatusToggle(vendor)}
                        className={`px-4 py-2 rounded-xl text-xs font-black border inline-flex items-center gap-2 transition-all ${vendor.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100'
                          }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${vendor.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {vendor.status}
                      </button>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => setShowEditModal(vendor)}
                          className="p-3 bg-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setShowDeleteModal(vendor)}
                          className="p-3 bg-slate-100 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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
              <h2 className="text-2xl font-black text-slate-900">Create New Partner</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateVendor} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">Vendor ID</label>
                  <input name="vendor_id" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="VND-001" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">Name</label>
                  <input name="name" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Partner Name" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">Email</label>
                  <input name="email" type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="email@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">Phone</label>
                  <input name="phone" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="+91-9876543210" />
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
                  <p className="text-xs text-slate-400 mt-1">⚠️ Save this password to give to vendor for login</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">Credit Limit</label>
                  <input name="credit_limit" type="number" step="0.01" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="500000.00" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">Commission Rate (%)</label>
                  <input name="commission_rate" type="number" step="0.01" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="5.5" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-all font-bold">
                  Create Partner
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
              <h2 className="text-2xl font-black text-slate-900">Edit Partner</h2>
              <button onClick={() => setShowEditModal(null)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditVendor} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">Name</label>
                  <input name="name" defaultValue={showEditModal.name} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">Email</label>
                  <input name="email" type="email" defaultValue={showEditModal.email} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">Phone</label>
                  <input name="phone" defaultValue={showEditModal.phone} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">Credit Limit</label>
                  <input name="credit_limit" type="number" step="0.01" defaultValue={showEditModal.credit_limit} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">Commission Rate (%)</label>
                  <input name="commission_rate" type="number" step="0.01" defaultValue={showEditModal.commission_rate} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
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
              <h2 className="text-2xl font-black text-slate-900 mb-2">Delete Partner?</h2>
              <p className="text-slate-500 mb-6">
                Are you sure you want to delete <strong>{showDeleteModal.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteVendor}
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
      {/* DOWNLINE MODAL */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[3rem] p-10 max-w-4xl w-full shadow-2xl relative overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-10 relative z-10">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-indigo-200">
                  {showDetailModal.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{showDetailModal.name}</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{showDetailModal.vendor_id} • Downline Analytics</p>
                </div>
              </div>
              <button
                onClick={() => { setShowDetailModal(null); setVendorDetails(null); }}
                className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all"
              >
                <X size={24} className="text-slate-400 hover:text-slate-900" />
              </button>
            </div>

            {isLoadingDetails ? (
              <div className="py-20 text-center">
                <Loader2 size={60} className="animate-spin text-indigo-600 mx-auto mb-6" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Mapping Downline Hierarchy...</p>
              </div>
            ) : vendorDetails ? (
              <div className="space-y-10 relative z-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <DownlineStat
                    label="Masters"
                    value={vendorDetails.stats.masterUsers}
                    icon={ShieldCheck}
                    color="indigo"
                    percentage={(vendorDetails.stats.masterUsers / (vendorDetails.stats.totalUsers || 1) * 100).toFixed(0)}
                  />
                  <DownlineStat
                    label="Agents"
                    value={vendorDetails.stats.agentUsers}
                    icon={UserPlus}
                    color="blue"
                    percentage={(vendorDetails.stats.agentUsers / (vendorDetails.stats.totalUsers || 1) * 100).toFixed(0)}
                  />
                  <DownlineStat
                    label="Members"
                    value={vendorDetails.stats.memberUsers}
                    icon={Users}
                    color="emerald"
                    percentage={(vendorDetails.stats.memberUsers / (vendorDetails.stats.totalUsers || 1) * 100).toFixed(0)}
                  />
                </div>

                {/* Financial Summary */}
                <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Yield & Liquidity</h4>
                    <span className="text-[10px] font-bold text-indigo-500 bg-white px-4 py-1.5 rounded-full border border-slate-100">REAL-TIME SYNC</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Distributed Funds</p>
                      <p className="text-xl font-black text-slate-900">${vendorDetails.stats.totalFundsDistributed.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Available Credit</p>
                      <p className="text-xl font-black text-indigo-600">${(showDetailModal.credit_limit - showDetailModal.used_credit).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Active Nodes</p>
                      <p className="text-xl font-black text-emerald-600">{vendorDetails.stats.activeUsers}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Blocked Nodes</p>
                      <p className="text-xl font-black text-rose-600">{vendorDetails.stats.blockedUsers}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <button className="flex-1 py-5 bg-slate-900 text-white rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl">Download Audit Report</button>
                  <button className="flex-1 py-5 bg-indigo-600 text-white rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl">View User Ledger</button>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400">Failed to load details.</div>
            )}

            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          </div>
        </div>
      )}
    </div>
  );
};

const DownlineStat = ({ label, value, icon: Icon, color, percentage }: any) => {
  const colorMap: any = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };

  const progressColorMap: any = {
    indigo: 'bg-indigo-500',
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
      <div className="flex justify-between items-start mb-6">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${colorMap[color]}`}>
          <Icon size={28} />
        </div>
        <div className="text-right">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{percentage}% OF TOTAL</span>
        </div>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</p>
      <h4 className="text-4xl font-black text-slate-900 tracking-tight mb-6">{value}</h4>
      <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
        <div className={`h-full ${progressColorMap[color]} transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
      </div>
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

export default VendorManagement;
