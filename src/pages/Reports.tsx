
import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import {
  Calendar,
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Trophy,
  Users,
  BarChart3,
  PieChart as PieIcon,
  ChevronDown,
  RefreshCw,
  FileText,
  MousePointer2,
  Zap,
  Star,
  Target
} from 'lucide-react';
import { ApiService } from '../api_service';

const Reports: React.FC = () => {
  const [range, setRange] = useState('This Week');
  const [kpis, setKpis] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [sportData, setSportData] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [k, r, s, l, h] = await Promise.all([
        ApiService.getReportKPIs(),
        ApiService.getRevenueAnalytics(range),
        ApiService.getSportPerformance(),
        ApiService.getVendorLeaderboard(),
        ApiService.getActivityHeatmap()
      ]);
      setKpis(k);
      setRevenueData(r);
      setSportData(s);
      setLeaderboard(l);
      setHeatmapData(h);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [range]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Intelligence center</h1>
          <p className="text-slate-500 text-xs md:text-sm font-medium">Deep-dive into betting volume, yields, and partner performance</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="flex-1 md:flex-none relative">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="w-full pl-12 pr-10 py-3.5 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest appearance-none outline-none focus:border-indigo-600 transition-all shadow-sm"
            >
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
              <option>Year to Date</option>
            </select>
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-black transition-all border-b-4 border-slate-700 active:border-b-0 active:translate-y-1">
            <Download size={18} /> Export Data
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <KPICard label="Gross Turnover" value={`$${kpis ? (kpis.grossTurnover / 1e6).toFixed(2) : '0'}M`} trend="+12.4%" positive icon={BarChart3} />
        <KPICard label="Gross Gaming Rev (GGR)" value={`$${kpis ? (kpis.ggr / 1e3).toFixed(0) : '0'}K`} trend="+8.2%" positive icon={TrendingUp} />
        <KPICard label="Retention Velocity" value="84.2%" trend="+2.1%" positive icon={Zap} />
        <KPICard label="Yield Margin" value={`${kpis?.margin || '0'}%`} trend="-0.4%" positive={false} icon={Target} />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left: Revenue Area Chart */}
        <div className="xl:col-span-8 bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Volume vs Profit Alpha</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Historical Yield Trajectory</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-indigo-600">
                <div className="w-2 h-2 rounded-full bg-indigo-600"></div> Total Volume
              </div>
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-emerald-500">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Net Yield
              </div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient>
                  <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.1} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="volume" stroke="#6366f1" strokeWidth={4} fill="url(#colorVol)" />
                <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={4} fill="url(#colorProf)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Distribution Pie Chart */}
        <div className="xl:col-span-4 bg-slate-900 p-8 rounded-[3rem] text-white border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col">
          <div className="relative z-10">
            <h3 className="text-lg font-black tracking-tight mb-2">Market Spread</h3>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-8">Volume by Sport Category</p>

            <div className="h-[200px] w-full mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sportData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {sportData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              {sportData.map((s, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }}></div>
                    <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">{s.name}</span>
                  </div>
                  <span className="text-sm font-black">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Bottom Section: Vendor Performance & Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Vendor Leaderboard */}
        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Partner Performance</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Node Profitability Ranking</p>
            </div>
            <button className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all"><RefreshCw size={18} /></button>
          </div>
          <div className="p-0 flex-1">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-4">Node Identity</th>
                  <th className="px-8 py-4">Volume</th>
                  <th className="px-8 py-4">Users</th>
                  <th className="px-8 py-4 text-right">Yield Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {leaderboard.map((vendor, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs">{idx + 1}</div>
                        <span className="text-sm font-black text-slate-800 tracking-tight">{vendor.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 font-black text-slate-900 text-sm">${(vendor.volume / 1000).toFixed(0)}K</td>
                    <td className="px-8 py-5 text-xs font-bold text-slate-500">{vendor.users}</td>
                    <td className="px-8 py-5 text-right">
                      <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-500">
                        <TrendingUp size={14} /> {vendor.growth}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-8 bg-slate-50/50 border-t border-slate-50 text-center">
            <button className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] hover:underline">View Deep-Dive Analysis</button>
          </div>
        </div>

        {/* User Heatmap / Peak times */}
        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm p-8 flex flex-col">
          <div className="mb-10">
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Active Heatmap</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Peak Traffic Synchronization</p>
          </div>
          <div className="grid grid-cols-12 lg:grid-cols-24 gap-1 md:gap-2 flex-1 items-end pt-4">
            {heatmapData && heatmapData.length > 0 ? (
              heatmapData.map((data: any, i: number) => {
                const maxCount = Math.max(...heatmapData.map((d: any) => d.count), 1);
                const heightPercent = (data.count / maxCount) * 80 + 5;
                return (
                  <div key={i} className="space-y-2 group cursor-pointer flex-1">
                    <div className="w-full relative bg-slate-100 rounded-full h-[180px] overflow-hidden">
                      <div
                        className="absolute bottom-0 left-0 w-full bg-indigo-600 group-hover:bg-emerald-500 transition-all duration-500 rounded-full"
                        style={{ height: `${heightPercent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="space-y-2 group cursor-pointer flex-1">
                  <div className="w-full relative bg-slate-100 rounded-full h-[180px] overflow-hidden"></div>
                </div>
              ))
            )}
          </div>
          <div className="mt-10 pt-8 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Peak Activity</p>
                <p className="text-sm font-black text-slate-900">
                  {heatmapData?.length > 0
                    ? `${[...heatmapData].sort((a, b) => b.count - a.count)[0].hour}:00 - ${[...heatmapData].sort((a, b) => b.count - a.count)[0].hour + 1}:00`
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Avg Activity</p>
                <p className="text-sm font-black text-slate-900">
                  {heatmapData?.length > 0
                    ? (heatmapData.reduce((acc: any, curr: any) => acc + curr.count, 0) / 24).toFixed(1)
                    : '0'} {heatmapData?.length > 0 ? 'Bets/hr' : ''}
                </p>
              </div>
            </div>
            <button className="p-4 bg-indigo-50 text-indigo-600 rounded-3xl hover:bg-indigo-600 hover:text-white transition-all">
              <FileText size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const KPICard = ({ label, value, trend, positive, icon: Icon }: any) => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
    <div className="flex justify-between items-start mb-6 relative z-10">
      <div className="p-4 bg-slate-50 rounded-2xl text-indigo-600 group-hover:scale-110 transition-transform"><Icon size={24} /></div>
      <div className={`flex items-center gap-1 text-[10px] font-black ${positive ? 'text-emerald-500' : 'text-rose-500'}`}>
        {positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        {trend}
      </div>
    </div>
    <div className="relative z-10">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
    </div>
    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-indigo-50 rounded-full opacity-50 blur-2xl group-hover:scale-150 transition-transform"></div>
  </div>
);

export default Reports;
