import React, { useState, useEffect } from 'react';
import {
    Wallet, TrendingDown, TrendingUp, DollarSign, Shield,
    AlertCircle, CheckCircle, RefreshCw, Loader2, ArrowUpRight,
    Clock, FileText, X
} from 'lucide-react';
import { ApiService } from '../api_service';

const WalletFinances: React.FC = () => {
    const [overview, setOverview] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [settlements, setSettlements] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'withdrawals' | 'master' | 'vendor'>('withdrawals');

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [overviewData, transactionsData, settlementsData] = await Promise.all([
                ApiService.getSite1FinancesOverview(),
                ApiService.getSite1Transactions(),
                ApiService.getSite1VendorSettlements()
            ]);

            console.log('Financial Overview:', overviewData);
            setOverview(overviewData);
            setTransactions(transactionsData);
            setSettlements(settlementsData);
        } catch (error) {
            console.error('Failed to fetch financial data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (isLoading || !overview) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
            </div>
        );
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Financial Command</h1>
                    <p className="text-slate-500 text-xs md:text-sm font-medium">
                        Real-time system monitoring • Vendor settlements • User balances
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchData}
                        className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-2xl hover:bg-rose-700 transition-all shadow-lg">
                        <AlertCircle size={18} /> EMERGENCY FREEZE
                    </button>
                </div>
            </div>

            {/* Main Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Admin Balance Card */}
                <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-3xl p-8 text-white shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/10 rounded-xl backdrop-blur">
                                <Wallet size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider">
                                    SUPERADMIN AUTHORITY
                                </p>
                                <p className="text-sm font-medium text-white/80">System Liquidity Pool</p>
                            </div>
                        </div>
                        <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-400/30 rounded-xl">
                            <p className="text-xs font-bold text-emerald-300">UNLIMITED</p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-6xl font-black mb-2">∞</h2>
                        <p className="text-xl font-bold text-white/90">Unlimited Balance</p>
                        <p className="text-sm text-white/60 mt-2">Admin has infinite funds for all operations</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-xs font-bold text-indigo-200 uppercase mb-2">Total Users Holdings</p>
                            <p className="text-3xl font-black text-emerald-300">
                                {formatCurrency(overview.users?.totalBalance || 0)}
                            </p>
                            <p className="text-xs text-white/60 mt-1">{overview.users?.count || 0} total users</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-indigo-200 uppercase mb-2">Active Bets (Exposure)</p>
                            <p className="text-3xl font-black text-amber-300">
                                {formatCurrency(overview.users?.totalExposure || 0)}
                            </p>
                            <p className="text-xs text-white/60 mt-1">
                                {overview.matches?.live || 0} live matches
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="space-y-4">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-3 bg-emerald-50 rounded-xl">
                                <DollarSign className="text-emerald-600" size={20} />
                            </div>
                            <p className="text-xs font-bold text-slate-400 uppercase">USERS AVAILABLE</p>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900">
                            {formatCurrency(overview.users?.availableBalance || 0)}
                        </h3>
                        <p className="text-xs text-emerald-600 font-bold mt-2">
                            {overview.users?.activeCount || 0} active players
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-3 bg-blue-50 rounded-xl">
                                <TrendingUp className="text-blue-600" size={20} />
                            </div>
                            <p className="text-xs font-bold text-slate-400 uppercase">VENDOR CREDIT USED</p>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900">
                            {formatCurrency(overview.vendors?.usedCredit || 0)}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mt-2">
                            of {formatCurrency(overview.vendors?.totalCreditLimit || 0)} limit
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="TOTAL USERS"
                    value={overview.users?.count || 0}
                    icon={Shield}
                    color="text-indigo-500"
                    bg="bg-indigo-50"
                    subtext={`${overview.users?.activeCount || 0} active`}
                />
                <StatCard
                    label="TOTAL VENDORS"
                    value={overview.vendors?.count || 0}
                    icon={TrendingDown}
                    color="text-amber-500"
                    bg="bg-amber-50"
                    subtext={`${overview.vendors?.activeCount || 0} active`}
                />
                <StatCard
                    label="USER EXPOSURE"
                    value={formatCurrency(overview.users?.totalExposure || 0)}
                    icon={CheckCircle}
                    color="text-rose-500"
                    bg="bg-rose-50"
                    subtext="In active bets"
                />
                <StatCard
                    label="SYSTEM STATUS"
                    value={overview.systemStatus || 'Standby'}
                    icon={Shield}
                    color="text-emerald-500"
                    bg="bg-emerald-50"
                    subtext={overview.systemHealth || 'Healthy'}
                />
            </div>

            {/* System Info */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-emerald-500/20 rounded-2xl">
                            <Shield size={28} className="text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-1">
                                ADMIN AUTHORITY
                            </p>
                            <p className="text-2xl font-black">Unlimited Liquidity Pool</p>
                            <p className="text-sm text-slate-400 mt-1">
                                Admin can create unlimited funds • All transactions from database
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="px-6 py-3 bg-emerald-500/20 border border-emerald-400/30 rounded-xl inline-block">
                            <p className="text-3xl font-black text-emerald-400">100%</p>
                            <p className="text-xs font-bold text-emerald-300 uppercase mt-1">System Ready</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200">
                <TabButton
                    active={activeTab === 'withdrawals'}
                    onClick={() => setActiveTab('withdrawals')}
                    icon={<ArrowUpRight size={16} />}
                    label="Withdrawal Queue"
                    count={transactions.filter(t => t.type === 'withdrawal').length}
                />
                <TabButton
                    active={activeTab === 'master'}
                    onClick={() => setActiveTab('master')}
                    icon={<FileText size={16} />}
                    label="Master Ledger"
                />
                <TabButton
                    active={activeTab === 'vendor'}
                    onClick={() => setActiveTab('vendor')}
                    icon={<DollarSign size={16} />}
                    label="Vendor Settlement"
                    count={settlements.length}
                />
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                {activeTab === 'withdrawals' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-5">Player</th>
                                    <th className="px-8 py-5">Amount</th>
                                    <th className="px-8 py-5">Protocol</th>
                                    <th className="px-8 py-5">Time</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {transactions.filter(t => t.type === 'withdrawal').length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-20 text-center">
                                            <CheckCircle className="mx-auto text-emerald-200 mb-4" size={60} strokeWidth={1} />
                                            <p className="text-slate-400 font-bold uppercase text-sm tracking-wider">
                                                NO PENDING WITHDRAWALS
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.filter(t => t.type === 'withdrawal').map((tx) => (
                                        <tr key={tx.id} className="hover:bg-slate-50/30 transition-all">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white font-black">
                                                        {tx.player.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-bold text-slate-900">{tx.player}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-lg font-black text-rose-600">
                                                    {formatCurrency(tx.amount)}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">
                                                    {tx.protocol}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <Clock size={14} />
                                                    <span className="text-xs font-medium">{formatTime(tx.timestamp)}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all text-xs font-bold">
                                                        APPROVE
                                                    </button>
                                                    <button className="px-4 py-2 bg-rose-100 text-rose-600 rounded-xl hover:bg-rose-200 transition-all text-xs font-bold">
                                                        REJECT
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'vendor' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-5">Vendor</th>
                                    <th className="px-8 py-5">Amount Used</th>
                                    <th className="px-8 py-5">Commission</th>
                                    <th className="px-8 py-5 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {settlements.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-20 text-center">
                                            <CheckCircle className="mx-auto text-emerald-200 mb-4" size={60} strokeWidth={1} />
                                            <p className="text-slate-400 font-bold uppercase text-sm tracking-wider">
                                                ALL VENDORS SETTLED
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    settlements.map((settlement, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/30 transition-all">
                                            <td className="px-8 py-6">
                                                <span className="font-bold text-slate-900">{settlement.vendor}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-lg font-black text-slate-900">
                                                    {formatCurrency(settlement.amount)}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-sm font-bold text-emerald-600">
                                                    {formatCurrency(parseFloat(settlement.commission))}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <span className={`px-4 py-2 rounded-xl text-xs font-black border inline-flex items-center gap-2 ${settlement.status === 'Active'
                                                        ? 'bg-amber-50 text-amber-600 border-amber-100'
                                                        : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                    }`}>
                                                    {settlement.status === 'Active' ? 'PENDING' : 'SETTLED'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'master' && (
                    <div className="p-20 text-center">
                        <FileText className="mx-auto text-slate-200 mb-4" size={60} strokeWidth={1} />
                        <p className="text-slate-400 font-bold uppercase text-sm tracking-wider">
                            MASTER LEDGER COMING SOON
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon, color, bg, subtext }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all">
        <div className="flex items-center justify-between mb-3">
            <div className={`p-3 ${bg} rounded-xl`}>
                <Icon className={color} size={20} />
            </div>
        </div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
        <h4 className="text-2xl font-black text-slate-900">{value}</h4>
        {subtext && <p className="text-xs text-slate-500 font-medium mt-2">{subtext}</p>}
    </div>
);

const TabButton = ({ active, onClick, icon, label, count }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all font-bold text-sm ${active
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
    >
        {icon}
        {label}
        {count !== undefined && (
            <span className={`px-2 py-1 rounded-lg text-xs font-black ${active ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'
                }`}>
                {count}
            </span>
        )}
    </button>
);

export default WalletFinances;
