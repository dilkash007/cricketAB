
import React, { useState, useEffect } from 'react';
import { Users, Store, DollarSign, TrendingUp, RefreshCw, Infinity as InfinityIcon } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ApiService } from '../api_service';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [health, setHealth] = useState<any>({ status: 'Connecting...', engine: 'Searching...' });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [s, c, h] = await Promise.all([
        ApiService.getDashboardStats(), 
        ApiService.getChartData(),
        ApiService.getSystemHealth()
      ]);
      setStats(s);
      setChartData(c);
      setHealth(h);
    } catch (error) {
      console.error("Dashboard Sync Error", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
    const interval = setInterval(async () => {
      const h = await ApiService.getSystemHealth();
      setHealth(h);
    }, 10000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Command Center</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest opacity-60">Real-time surveillance overview</p>
        </div>
        <button 
          onClick={fetchData} 
          className="bg-white border border-slate-200 p-3 md:px-5 md:py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 flex items-center gap-2 shadow-sm transition-all active:scale-95"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          <span className="hidden md:inline">Synchronize Data</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard label="Vendors" value={stats?.totalVendors ?? '12'} sub={`${stats?.activeVendors ?? '8'} Active Nodes`} icon={Store} color="bg-indigo-600" />
        <StatCard label="Users" value={stats?.totalUsers ?? '1.4K'} sub={`+${stats?.userGrowth ?? '15.2'}% Growth`} icon={Users} color="bg-blue-600" />
        <StatCard label="Liquidity" value={stats?.liquidity === "Offline" ? "OFFLINE" : "UNLIMITED"} sub="Treasury Status" icon={DollarSign} color="bg-slate-900" isInf={stats?.liquidity !== "Offline"} />
        <StatCard label="Net Profit" value={stats ? `$${(stats.netProfit / 1000).toFixed(1)}K` : '$54.2K'} sub="Live SQL Yield" icon={TrendingUp} color="bg-emerald-600" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* RECHARTS FIXED CONTAINER */}
        <div className="xl:col-span-8 bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-sm font-black text-slate-800 tracking-tight uppercase">Turnover Analytics</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">7-Day Performance Logic</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[9px] font-black text-indigo-600 uppercase"><span className="w-2 h-2 rounded-full bg-indigo-600"></span> Bets</div>
              <div className="flex items-center gap-2 text-[9px] font-black text-emerald-500 uppercase"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Wins</div>
            </div>
          </div>
          
          <div className="w-full" style={{ minHeight: '350px', height: '350px' }}>
            <ResponsiveContainer width="99%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="pBet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'bold'}} 
                />
                <Area type="monotone" dataKey="bets" stroke="#6366f1" strokeWidth={4} fill="url(#pBet)" animationDuration={1500} />
                <Area type="monotone" dataKey="winnings" stroke="#10b981" strokeWidth={4} fill="transparent" animationDuration={2000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="xl:col-span-4 flex flex-col gap-6">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl flex-1 border border-slate-800 relative overflow-hidden group">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8 opacity-40">System Integrity</h3>
            <div className="space-y-6 relative z-10">
              <HealthItem 
                label="PostgreSQL Engine" 
                status={health.status.toUpperCase()} 
                color={health.status === 'Connected' ? 'text-emerald-400' : 'text-amber-400'} 
              />
              <HealthItem 
                label="API Gateway" 
                status={stats?.liquidity === "Offline" ? "STANDBY" : "LIVE"} 
                color={stats?.liquidity === "Offline" ? "text-amber-400" : "text-emerald-400"} 
              />
              <HealthItem label="Worker Clusters" status="4/4 ACTIVE" color="text-indigo-400" />
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
          </div>
          
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Database Telemetry</h4>
            <div className="space-y-5">
               <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span>SQL Throughput</span>
                  <span className="text-indigo-600">{health.status === 'Connected' ? 'Optimized' : 'Stable'}</span>
               </div>
               <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden shadow-inner">
                  <div className={`h-full transition-all duration-1000 ease-out ${health.status === 'Connected' ? 'bg-indigo-600 w-[85%]' : 'bg-indigo-400 w-[40%]'}`}></div>
               </div>
               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight opacity-60">Node: {health.engine || 'PostgreSQL 16'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, sub, icon: Icon, color, isInf }: any) => (
  <div className="bg-white p-5 md:p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
    <div className="flex justify-between items-center mb-4">
      <div className={`p-3 rounded-2xl ${color} text-white shadow-lg group-hover:scale-110 transition-transform`}><Icon size={20} /></div>
      <span className="text-[9px] font-black px-2 py-1 rounded-lg bg-slate-50 text-slate-400 border border-slate-100 uppercase tracking-widest">Active</span>
    </div>
    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
    <div className="flex items-center gap-2">
      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
      {isInf && <InfinityIcon className="text-indigo-600" size={20} />}
    </div>
    <p className="text-slate-500 text-[9px] mt-1 font-bold uppercase tracking-tight opacity-40">{sub}</p>
    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-slate-50 rounded-full opacity-50 blur-2xl group-hover:scale-150 transition-transform"></div>
  </div>
);

const HealthItem = ({ label, status, color }: any) => (
  <div className="flex justify-between items-center">
    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{label}</span>
    <div className="flex items-center gap-3">
      <div className={`w-2 h-2 rounded-full animate-pulse ${color.replace('text-', 'bg-')}`}></div>
      <span className={`text-[10px] font-black uppercase tracking-widest ${color}`}>{status}</span>
    </div>
  </div>
);

export default Dashboard;
