
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  RefreshCw, 
  Loader2, 
  Globe, 
  Activity, 
  Server, 
  Network, 
  ShieldCheck,
  AlertTriangle,
  Zap,
  Cpu,
  Unplug
} from 'lucide-react';
import { ApiService, SportStatus } from '../api_service';
import { Match } from '../types';

const MatchApproval: React.FC = () => {
  const [feeds, setFeeds] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [reports, setReports] = useState<SportStatus[]>([]);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const { matches, reports } = await ApiService.getDiamondQueue();
      setFeeds(matches);
      setReports(reports);
    } catch (error) {
      console.error("Critical Sync Failure", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQueue(); }, []);

  const handleApprove = async (id: string) => {
    setActionId(id);
    try {
      await ApiService.approveMatch(id);
      setFeeds(prev => prev.filter(f => f.id !== id));
    } finally { setActionId(null); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">API FEED VERIFICATION</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mt-1 opacity-60 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            Cluster: 130.250.191.174 • Mode: Direct Bridge
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchQueue}
            disabled={loading}
            className="px-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] text-slate-500 hover:text-indigo-600 transition-all shadow-sm flex items-center gap-3 group"
          >
            <RefreshCw size={20} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Probe Cluster</span>
          </button>
          <div className="hidden md:flex items-center gap-4 bg-slate-900 px-6 py-4 rounded-[1.5rem] border border-slate-800 shadow-2xl">
            <Globe size={18} className="text-indigo-400 animate-pulse" />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Protocol: TREE-JSON</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Verification Queue */}
        <div className="xl:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-4">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Pending Verification ({feeds.length})</h3>
             <span className="text-[10px] font-bold text-slate-300 italic">Source: /tree endpoint</span>
          </div>

          {loading ? (
            <div className="bg-white rounded-[4rem] p-32 flex flex-col items-center justify-center border border-slate-200 shadow-sm">
               <div className="relative mb-10">
                 <Loader2 className="animate-spin text-indigo-600" size={80} strokeWidth={1} />
                 <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300" size={32} />
               </div>
               <p className="text-slate-400 font-black text-[11px] uppercase tracking-[0.5em]">Synchronizing API Map...</p>
            </div>
          ) : feeds.length === 0 ? (
            <div className="bg-white rounded-[4rem] border-2 border-dashed border-slate-200 p-32 text-center group">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-100 group-hover:scale-110 transition-transform">
                <ShieldCheck size={48} className="text-slate-200" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Queue Depleted</h3>
              <p className="text-slate-400 text-sm mt-3 max-w-xs mx-auto font-medium">The cluster returned zero matches. Check the Sports List filters or API Key status.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {feeds.map((match) => (
                <div key={match.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden group">
                  <div className="p-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                     <div className="flex items-center gap-8">
                        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner">
                           <Zap size={36} />
                        </div>
                        <div>
                           <div className="flex items-center gap-3 mb-2">
                              <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em] bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">{match.sourceApi}</span>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{match.tournament}</span>
                           </div>
                           <h3 className="font-black text-slate-900 text-2xl tracking-tighter leading-none">
                             {match.teams[0]} <span className="text-slate-200 font-medium mx-1 italic">vs</span> {match.teams[1]}
                           </h3>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Node ID: GM-{match.id}</p>
                        </div>
                     </div>
                     <button 
                      onClick={() => handleApprove(match.id)}
                      disabled={actionId === match.id}
                      className="px-10 py-6 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-[1.8rem] hover:bg-indigo-600 shadow-2xl hover:shadow-indigo-200 transition-all flex items-center justify-center gap-4 active:scale-95"
                     >
                       {actionId === match.id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                       {actionId === match.id ? 'COMMITING...' : 'Verify & Push'}
                     </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Diagnostic Sidebar */}
        <div className="xl:col-span-4 space-y-8">
           <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl border border-slate-800 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-black text-xs mb-12 flex items-center gap-3 tracking-[0.3em] uppercase text-indigo-400">
                   <Cpu size={20} /> CLUSTER HEALTH
                </h3>
                <div className="space-y-10">
                  {reports.length > 0 ? reports.map((r, i) => (
                    <div key={i} className="space-y-4">
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{r.name}</span>
                          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${r.status === 'Online' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{r.status}</span>
                       </div>
                       {r.errorMsg && (
                         <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-[10px] font-mono text-slate-400 leading-relaxed italic">{r.errorMsg}</p>
                         </div>
                       )}
                       <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-1000 ${r.status === 'Online' ? 'bg-emerald-500 w-full shadow-[0_0_10px_#10b981]' : 'bg-rose-500 w-[15%]'}`}></div>
                       </div>
                    </div>
                  )) : (
                    <div className="text-center py-10">
                      <Unplug className="mx-auto text-slate-700 mb-4" size={40} />
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No active heartbeat detected</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
           </div>

           <div className="bg-white rounded-[3rem] border border-slate-200 p-12 shadow-sm">
              <div className="flex items-center gap-4 mb-10">
                 <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600"><Network size={24} /></div>
                 <div>
                    <h4 className="font-black text-slate-900 tracking-tight">Injection Logic</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Protocol v1.4.2</p>
                 </div>
              </div>
              <div className="space-y-6">
                 <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100 flex gap-4">
                    <AlertTriangle size={24} className="text-amber-600 shrink-0" />
                    <p className="text-[10px] font-black text-amber-900 leading-relaxed uppercase tracking-tight">System automatically polls the Diamond Tree every 60 seconds. Matches approved here become visible in the Betting Markets instantly.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MatchApproval;
