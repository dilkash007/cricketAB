
import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Trash2,
  Download,
  AlertTriangle,
  Info,
  ShieldCheck,
  UserCheck,
  Zap,
  Lock,
  Eye,
  RefreshCw,
  Clock,
  ChevronDown,
  Terminal,
  Activity,
  FileCode,
  X,
  History,
  Smartphone,
  Server,
  Fingerprint,
  Loader2
} from 'lucide-react';
import { ApiService } from '../api_service';
import { AuditLog } from '../types';

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [kpis, setKpis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [logPayload, setLogPayload] = useState<any>(null);
  const [isLive, setIsLive] = useState(false);
  const [filterCat, setFilterCat] = useState('All');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [l, k] = await Promise.all([
        ApiService.getAuditLogs({ category: filterCat }),
        ApiService.getAuditKPIs()
      ]);
      setLogs(l);
      setKpis(k);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterCat]);

  // Live monitoring effect
  useEffect(() => {
    let interval: any;
    if (isLive) {
      interval = setInterval(() => {
        ApiService.getAuditLogs({ category: filterCat }).then(l => setLogs(l));
        ApiService.getAuditKPIs().then(k => setKpis(k));
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isLive, filterCat]);

  const handleInspect = async (log: AuditLog) => {
    setSelectedLog(log);
    const payload = await ApiService.getLogPayload(log.id);
    setLogPayload(payload);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Header forensic context */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Security ledger</h1>
          <p className="text-slate-500 text-xs md:text-sm font-medium">Forensic trace of every administrative mutation on the system</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isLive ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-white border border-slate-200 text-slate-400'
              }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-white animate-ping' : 'bg-slate-300'}`} />
            {isLive ? 'LIVE MONITORING ON' : 'ENABLE LIVE FEED'}
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-black transition-all border-b-4 border-slate-700 active:border-b-0 active:translate-y-1">
            <Download size={18} /> Export Forensic Report
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <SecurityStat label="Audit Density" value={kpis?.totalLogs24h || '---'} sub="Events / 24h" icon={Activity} color="text-indigo-600" bg="bg-indigo-50" />
        <SecurityStat label="Security Flags" value={kpis?.securityAlerts || '---'} sub="Critical Triage Required" icon={ShieldAlert} color="text-rose-600" bg="bg-rose-50" />
        <SecurityStat label="Unauthorized Attempts" value={kpis?.failedLogins || '---'} sub="Brute-force Blocked" icon={Lock} color="text-amber-600" bg="bg-amber-50" />
        <SecurityStat label="System Integrity" value={kpis?.systemStability || '---'} sub="SQL Node Consistency" icon={ShieldCheck} color="text-emerald-600" bg="bg-emerald-50" />
      </div>

      {/* Main Table Interface */}
      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
        {/* Advanced Toolbar */}
        <div className="px-8 py-6 border-b border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-50/20">
          <div className="flex gap-1.5 p-1 bg-white border border-slate-200 rounded-2xl shadow-sm">
            {['All', 'Security', 'Finance', 'Vendor', 'System'].map(c => (
              <button
                key={c}
                onClick={() => setFilterCat(c)}
                className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filterCat === c ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 bg-white border border-slate-200 px-6 py-3 rounded-2xl w-full md:w-96 shadow-inner">
            <Search size={18} className="text-slate-300" />
            <input type="text" placeholder="Search by Admin ID, IP or Event..." className="bg-transparent border-none outline-none text-xs font-bold w-full text-slate-700" />
          </div>
        </div>

        {/* Dense Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <tr>
                <th className="px-10 py-5">Event Mutation</th>
                <th className="px-10 py-5">Classification</th>
                <th className="px-10 py-5">Admin Node</th>
                <th className="px-10 py-5">Forensic Context</th>
                <th className="px-10 py-5 text-right">Data Drill</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan={5} className="p-32 text-center"><Loader2 className="animate-spin mx-auto text-indigo-600" size={48} /></td></tr>
              ) : logs.filter(l => filterCat === 'All' || l.category === filterCat).map(log => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-10 py-6">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-800 text-sm tracking-tight">{log.action}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-1.5">
                        <Clock size={12} /> {log.timestamp}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${log.category === 'Security' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        log.category === 'Finance' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          log.category === 'Vendor' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                            'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                      {log.category}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <Fingerprint size={16} />
                      </div>
                      <span className="font-black text-slate-700 text-sm">{log.admin}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                        <Server size={12} className="text-slate-300" /> 192.168.1.1
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-medium text-slate-400 uppercase">
                        <Smartphone size={10} className="text-slate-300" /> Chrome / MacOS
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button
                      onClick={() => handleInspect(log)}
                      className="p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-indigo-600 hover:border-indigo-200 shadow-sm transition-all active:scale-95"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex justify-between items-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Displaying 100 of 14,200 trace nodes</p>
          <div className="flex gap-2">
            <button className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600 shadow-sm">Load More Forensic Logs</button>
            <button
              onClick={() => ApiService.archiveLogs('2024-05-01')}
              className="px-6 py-2 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-[10px] font-black uppercase shadow-sm hover:bg-rose-100"
            >
              Archive Old Data
            </button>
          </div>
        </div>
      </div>

      {/* Forensic Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl rounded-[4rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row h-[80vh]">
            {/* Modal Sidebar */}
            <div className="md:w-72 bg-slate-900 p-10 text-white flex flex-col">
              <div className="p-5 bg-indigo-600 rounded-[2rem] w-fit mb-8 shadow-2xl shadow-indigo-500/20">
                <Terminal size={32} />
              </div>
              <h2 className="text-xl font-black tracking-tight mb-2">Event Payload</h2>
              <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-[0.2em] mb-10">Forensic Drildown</p>

              <div className="mt-auto space-y-6">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Mutation Time</p>
                  <p className="text-sm font-bold">{selectedLog.timestamp}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Security Token</p>
                  <p className="text-xs font-mono text-slate-400 break-all">{selectedLog.id}</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 flex flex-col p-10 overflow-y-auto bg-slate-50/50">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{selectedLog.action}</h3>
                  <p className="text-sm font-medium text-slate-500 mt-1">{selectedLog.details}</p>
                </div>
                <button onClick={() => setSelectedLog(null)} className="p-3 bg-white rounded-2xl border border-slate-200 text-slate-300 hover:text-slate-900 transition-colors"><X size={24} /></button>
              </div>

              <div className="space-y-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <FileCode size={14} className="text-indigo-600" /> Raw SQL Execution
                  </h4>
                  <div className="bg-slate-950 p-6 rounded-3xl overflow-hidden group relative">
                    <pre className="text-emerald-400 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      {logPayload ? logPayload.sql_query : '-- Fetching SQL Ledger...'}
                    </pre>
                    <button className="absolute top-4 right-4 p-2 bg-white/5 text-white/20 hover:text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      <History size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <Activity size={14} className="text-rose-500" /> State Diff (Before)
                    </h4>
                    <div className="bg-slate-50 p-6 rounded-3xl">
                      <pre className="text-slate-600 font-mono text-[10px] leading-relaxed">
                        {logPayload ? JSON.stringify(logPayload.prev_state, null, 2) : '{}'}
                      </pre>
                    </div>
                  </div>
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <Activity size={14} className="text-emerald-500" /> State Diff (After)
                    </h4>
                    <div className="bg-slate-50 p-6 rounded-3xl">
                      <pre className="text-slate-600 font-mono text-[10px] leading-relaxed">
                        {logPayload ? JSON.stringify(logPayload.new_state, null, 2) : '{}'}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SecurityStat = ({ label, value, sub, icon: Icon, color, bg }: any) => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
    <div className="flex justify-between items-start mb-6 relative z-10">
      <div className={`p-4 ${bg} ${color} rounded-2xl group-hover:scale-110 transition-transform`}><Icon size={24} /></div>
      <span className="text-[8px] font-black px-2 py-1 bg-slate-50 text-slate-400 border border-slate-100 rounded-lg uppercase tracking-widest">Audited</span>
    </div>
    <div className="relative z-10">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
      <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase opacity-60">{sub}</p>
    </div>
    <div className={`absolute -bottom-6 -right-6 w-24 h-24 ${bg} rounded-full opacity-30 blur-2xl group-hover:scale-150 transition-transform`}></div>
  </div>
);

export default AuditLogs;
