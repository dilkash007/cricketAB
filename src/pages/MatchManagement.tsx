
import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  RefreshCw, 
  Search, 
  Activity, 
  CheckCircle2, 
  Pause, 
  Edit3, 
  MoreVertical,
  Loader2,
  AlertCircle,
  TrendingUp,
  Globe,
  Settings2,
  Filter,
  BarChart3,
  CalendarClock
} from 'lucide-react';
import { ApiService } from '../api_service';
import { Match } from '../types';

const MatchManagement: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSport, setFilterSport] = useState('All');

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getApprovedMatches();
      setMatches(data);
    } catch (error) {
      console.error("Management Fetch Error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMatches(); }, []);

  const filteredMatches = matches.filter(m => {
    const matchesSearch = m.teams.join(' ').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.tournament.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = filterSport === 'All' || m.sourceApi?.includes(filterSport);
    return matchesSearch && matchesSport;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">GAMES & MARKETS</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mt-1 opacity-60">Master Ledger Intelligence • Global Liquidity</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-[1.5rem] border border-slate-200 shadow-sm w-full md:w-96 focus-within:border-indigo-500 transition-all">
              <Search size={18} className="text-slate-300" />
              <input 
                type="text" 
                placeholder="Filter events, teams or ID..." 
                className="bg-transparent border-none outline-none text-xs font-black w-full text-slate-800 placeholder:text-slate-300 uppercase tracking-widest" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <button 
             onClick={fetchMatches}
             className="p-5 bg-indigo-600 text-white rounded-[1.5rem] hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 active:scale-95"
           >
             <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
           </button>
        </div>
      </div>

      {/* Analytics Mini-Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
         <IntelligenceStat label="Live In-Play" value={matches.filter(m => m.status === 'Live').length} icon={Activity} color="text-emerald-500" bg="bg-emerald-50" />
         <IntelligenceStat label="Pre-Match" value={matches.filter(m => m.status === 'Upcoming').length} icon={CalendarClock} color="text-amber-500" bg="bg-amber-50" />
         <IntelligenceStat label="Active Markets" value={matches.length * 3} icon={BarChart3} color="text-indigo-500" bg="bg-indigo-50" />
         <IntelligenceStat label="Sync Status" value="Healthy" icon={Globe} color="text-blue-500" bg="bg-blue-50" />
      </div>

      <div className="bg-white rounded-[4rem] border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="px-10 py-8 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-50/20">
           <div className="flex gap-2 p-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-x-auto no-scrollbar">
              {['All', 'Cricket', 'Soccer', 'Tennis'].map(s => (
                <button 
                  key={s}
                  onClick={() => setFilterSport(s)}
                  className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    filterSport === s ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {s}
                </button>
              ))}
           </div>
           <button className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-all">
              <Filter size={16} /> Advanced Filters
           </button>
        </div>

        {/* Dynamic Market Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100">
               <tr>
                 <th className="px-12 py-8">Match Entity</th>
                 <th className="px-12 py-8">Tournament Context</th>
                 <th className="px-12 py-8">Live Prices (Back/Lay)</th>
                 <th className="px-12 py-8">Verification</th>
                 <th className="px-12 py-8 text-right">Control</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-40 text-center">
                    <Loader2 className="animate-spin mx-auto text-indigo-600 mb-6" size={64} strokeWidth={1} />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Querying Master Ledger...</p>
                  </td>
                </tr>
              ) : filteredMatches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-40 text-center">
                    <AlertCircle className="mx-auto text-slate-200 mb-6" size={80} strokeWidth={1} />
                    <p className="text-slate-400 font-black uppercase text-xs tracking-[0.3em]">No Active Markets found for selection</p>
                  </td>
                </tr>
              ) : (
                filteredMatches.map((match) => (
                  <tr key={match.id} className="hover:bg-slate-50/50 transition-all duration-300 group">
                    <td className="px-12 py-10">
                       <div className="flex items-center gap-6">
                          <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center font-black text-lg shadow-inner ${match.status === 'Live' ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
                             {match.teams[0].charAt(0)}
                          </div>
                          <div>
                             <p className="font-black text-slate-900 text-lg tracking-tighter leading-tight">{match.teams[0]} <span className="text-slate-200 font-medium italic">v</span> {match.teams[1]}</p>
                             <div className="flex items-center gap-3 mt-1.5">
                                <span className={`w-2 h-2 rounded-full ${match.status === 'Live' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{match.startTime} • {match.sourceApi}</p>
                             </div>
                          </div>
                       </div>
                    </td>
                    <td className="px-12 py-10">
                       <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{match.tournament}</span>
                          <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">Tier: International</span>
                       </div>
                    </td>
                    <td className="px-12 py-10">
                       <div className="flex gap-3">
                          <PriceBox price="1.90" label="BACK" color="bg-indigo-50 text-indigo-700 border-indigo-100" />
                          <PriceBox price="1.92" label="LAY" color="bg-rose-50 text-rose-700 border-rose-100" />
                       </div>
                    </td>
                    <td className="px-12 py-10">
                       <span className={`px-6 py-2.5 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest border shadow-sm ${match.status === 'Live' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                          {match.status}
                       </span>
                    </td>
                    <td className="px-12 py-10 text-right">
                       <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                          <button className="p-4 bg-white border border-slate-200 rounded-[1.2rem] text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"><Edit3 size={18} /></button>
                          <button className="p-4 bg-white border border-slate-200 rounded-[1.2rem] text-slate-400 hover:text-slate-900 transition-all shadow-sm"><Settings2 size={18} /></button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const IntelligenceStat = ({ label, value, icon: Icon, color, bg }: any) => (
  <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex items-center gap-6 hover:shadow-2xl transition-all duration-500 group overflow-hidden relative">
    <div className={`p-5 rounded-[1.8rem] ${bg} ${color} group-hover:scale-110 transition-transform relative z-10 shadow-inner`}><Icon size={32} /></div>
    <div className="relative z-10">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">{label}</p>
      <h4 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h4>
    </div>
    <div className={`absolute -bottom-10 -right-10 w-32 h-32 ${bg} opacity-20 rounded-full blur-[60px] group-hover:scale-150 transition-transform`}></div>
  </div>
);

const PriceBox = ({ price, label, color }: any) => (
  <div className={`px-5 py-3 rounded-2xl border ${color} text-center min-w-[70px] shadow-sm hover:scale-105 transition-transform cursor-pointer`}>
     <p className="text-[8px] font-black opacity-50 mb-0.5 tracking-widest">{label}</p>
     <p className="text-sm font-black tracking-tight">{price}</p>
  </div>
);

export default MatchManagement;
