
import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  DollarSign,
  Percent,
  History,
  Download,
  AlertOctagon,
  ShieldX,
  Infinity as InfinityIcon,
  CheckCircle2,
  XCircle,
  Loader2,
  Filter,
  Search,
  MoreVertical,
  Banknote,
  ShieldCheck,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { ApiService } from '../api_service';
import { Transaction } from '../types';

const WalletManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'withdrawals' | 'ledger' | 'vendors'>('withdrawals');
  const [stats, setStats] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [ledger, setLedger] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [s, w, l] = await Promise.all([
        ApiService.getFinancialStats(),
        ApiService.getWithdrawalRequests(),
        ApiService.getMasterLedger()
      ]);
      setStats(s);
      setWithdrawals(w);
      setLedger(l);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApproveWithdrawal = async (id: string) => {
    setActionId(id);
    try {
      const res = await ApiService.approveWithdrawal(id);
      if (res.success) {
        setWithdrawals(prev => prev.filter(w => w.id !== id));
      }
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Financial command</h1>
          <p className="text-slate-500 text-xs md:text-sm font-medium">Manage system liquidity, vendor settlements, and master ledger</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-100 hover:bg-rose-700 transition-all border-b-4 border-rose-900 active:border-b-0 active:translate-y-1">
            <AlertOctagon size={18} /> Emergency Freeze
          </button>
        </div>
      </div>

      {/* Hero Financial Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-indigo-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl border border-indigo-800 group">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-10">
              <div className="p-4 bg-white/10 rounded-[1.5rem] backdrop-blur-md border border-white/5 shadow-inner">
                <Wallet size={32} />
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-[9px] font-black px-3 py-1 bg-emerald-500 rounded-full flex items-center gap-1.5 shadow-lg shadow-emerald-500/20">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  MASTER LIQUIDITY LIVE
                </span>
              </div>
            </div>

            <p className="text-indigo-200/80 text-xs font-black uppercase tracking-widest mb-1">Total System Exposure</p>
            <h2 className="text-4xl md:text-5xl font-black mb-10 tracking-tight">
              ${stats ? stats.totalLiquidity.toLocaleString() : '---'}
            </h2>

            <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
              <div>
                <p className="text-indigo-300 text-[9px] uppercase font-black tracking-[0.2em] mb-2 opacity-70">Reserve Cluster</p>
                <p className="text-xl font-black">${stats ? (stats.reserveCluster / 1000000).toFixed(1) : '0'}M</p>
              </div>
              <div>
                <p className="text-indigo-300 text-[9px] uppercase font-black tracking-[0.2em] mb-2 opacity-70">Total User Liability</p>
                <p className="text-xl font-black text-rose-400">${stats ? (stats.userLiability / 1000000).toFixed(1) : '0'}M</p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
        </div>

        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
          <FinancialMiniCard
            label="Pending Withdrawals"
            value={`$${stats ? stats.pendingWithdrawals.toLocaleString() : '0'}`}
            icon={Banknote}
            color="text-amber-500"
            bg="bg-amber-50"
            sub="12 Transactions Waiting"
          />
          <FinancialMiniCard
            label="Daily Turnover"
            value={`$${stats ? (stats.dailyVolume / 1000).toFixed(0) : '0'}K`}
            icon={TrendingUp}
            color="text-indigo-500"
            bg="bg-indigo-50"
            sub="+12.5% vs Yesterday"
          />
          <FinancialMiniCard
            label="Unpaid Commissions"
            value={`$${stats ? stats.unpaidCommissions.toLocaleString() : '0'}`}
            icon={Percent}
            color="text-emerald-500"
            bg="bg-emerald-50"
            sub="Next payout in 24h"
          />
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col justify-center border border-slate-800 shadow-xl shadow-slate-200">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-4 flex items-center gap-2">
              <ShieldCheck size={14} /> Security Status
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-400">Ledger Consistency</span>
                <span className="text-emerald-400">100% Verified</span>
              </div>
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
        {/* Navigation Tabs */}
        <div className="px-8 pt-8 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
            <TabButton
              active={activeTab === 'withdrawals'}
              onClick={() => setActiveTab('withdrawals')}
              label="Withdrawal Queue"
              count={withdrawals.length}
            />
            <TabButton
              active={activeTab === 'ledger'}
              onClick={() => setActiveTab('ledger')}
              label="Master Ledger"
            />
            <TabButton
              active={activeTab === 'vendors'}
              onClick={() => setActiveTab('vendors')}
              label="Vendor Settlements"
            />
          </div>
          <div className="flex items-center gap-4 bg-slate-50 px-6 py-2.5 rounded-2xl mb-2 border border-slate-100">
            <Search size={16} className="text-slate-300" />
            <input type="text" placeholder="Search transactions..." className="bg-transparent border-none outline-none text-xs font-bold w-full md:w-48 text-slate-700" />
          </div>
        </div>

        {/* Dynamic Tab Content */}
        <div className="p-0">
          {activeTab === 'withdrawals' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <tr>
                    <th className="px-10 py-5">Player Entity</th>
                    <th className="px-10 py-5">Amount Requested</th>
                    <th className="px-10 py-5">Risk Protocol</th>
                    <th className="px-10 py-5">Timestamp</th>
                    <th className="px-10 py-5 text-right">Commit Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                    <tr><td colSpan={5} className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-indigo-600" size={32} /></td></tr>
                  ) : withdrawals.length === 0 ? (
                    <tr><td colSpan={5} className="p-20 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">Queue Clear. No Pending Payouts.</td></tr>
                  ) : withdrawals.map(w => (
                    <tr key={w.id} className={`hover:bg-slate-50/80 transition-all group ${actionId === w.id ? 'opacity-50 pointer-events-none' : ''}`}>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600 text-sm">{w.username.charAt(0)}</div>
                          <div>
                            <p className="font-black text-slate-800 text-sm tracking-tight">{w.username}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{w.vendorName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <span className="font-black text-slate-900 text-base">${w.amount.toLocaleString()}</span>
                      </td>
                      <td className="px-10 py-6">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${w.riskScore === 'Low' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                          }`}>
                          {w.riskScore} Risk
                        </span>
                      </td>
                      <td className="px-10 py-6 text-slate-400 font-bold text-[10px] uppercase">{w.timestamp}</td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                          <button className="p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-rose-600 hover:border-rose-100 transition-all"><XCircle size={18} /></button>
                          <button
                            onClick={() => handleApproveWithdrawal(w.id)}
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 border-b-2 border-indigo-900 active:border-b-0 active:translate-y-0.5"
                          >
                            <CheckCircle2 size={16} /> Pay Out
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'ledger' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <tr>
                    <th className="px-10 py-5">Transaction Node</th>
                    <th className="px-10 py-5">Type / Ref</th>
                    <th className="px-10 py-5">Amount</th>
                    <th className="px-10 py-5">Admin Sign</th>
                    <th className="px-10 py-5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {ledger.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-all group">
                      <td className="px-10 py-6">
                        <div>
                          <p className="font-black text-slate-800 text-sm tracking-tight">{tx.id}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{tx.timestamp}</p>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${tx.type === 'Add' ? 'bg-emerald-500 text-white' :
                              tx.type === 'Deduct' ? 'bg-rose-500 text-white' :
                                'bg-indigo-500 text-white'
                            }`}>{tx.type}</span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">{tx.refId}</span>
                        </div>
                      </td>
                      <td className="px-10 py-6 font-black text-slate-900 text-sm">
                        {tx.type === 'Add' ? '+' : '-'}${tx.amount.toLocaleString()}
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center"><ShieldCheck size={12} className="text-indigo-600" /></div>
                          <span className="text-xs font-bold text-slate-600">{tx.admin}</span>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-100">Settled</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'vendors' && (
            <div className="p-20 text-center">
              <AlertTriangle className="mx-auto text-amber-500 mb-4" size={48} />
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Vendor Settlement Sub-Module</h3>
              <p className="text-slate-400 text-sm font-medium mt-2 max-w-md mx-auto">This module synchronizes monthly revenue distributions and automated commission payouts based on node performance.</p>
              <button className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100">Synchronize Nodes</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FinancialMiniCard = ({ label, value, icon: Icon, color, bg, sub }: any) => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden">
    <div className="flex justify-between items-start relative z-10">
      <div className={`p-4 rounded-2xl ${bg} ${color} group-hover:scale-110 transition-transform`}><Icon size={24} /></div>
      <div className="text-right">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <h4 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h4>
        <p className={`text-[8px] font-black uppercase tracking-tight mt-1 ${color} opacity-80`}>{sub}</p>
      </div>
    </div>
    <div className={`absolute -bottom-6 -right-6 w-24 h-24 ${bg} opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform`}></div>
  </div>
);

const TabButton = ({ active, onClick, label, count }: any) => (
  <button
    onClick={onClick}
    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${active ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'
      }`}
  >
    {label}
    {count !== undefined && (
      <span className={`px-2 py-0.5 rounded-full text-[8px] ${active ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
        {count}
      </span>
    )}
  </button>
);

export default WalletManagement;
