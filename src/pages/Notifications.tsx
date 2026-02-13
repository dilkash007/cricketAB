
import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Skull,
  Globe,
  Activity,
  Trash2,
  ExternalLink,
  Clock,
  Filter,
  Zap,
  Search,
  CheckCircle2,
  XCircle,
  Ban,
  Eye,
  Loader2,
  RefreshCw,
  ShieldX,
  Target
} from 'lucide-react';
import { ApiService } from '../api_service';

const RiskAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any>(null);
  const [heuristics, setHeuristics] = useState<any[]>([]);
  const [blacklist, setBlacklist] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('All');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [a, k, h, b] = await Promise.all([
        ApiService.getRiskAlerts(),
        ApiService.getRiskKPIs(),
        ApiService.getRiskHeuristics(),
        ApiService.getBlacklistedIps()
      ]);
      setAlerts(a);
      setKpis(k);
      setHeuristics(h);
      setBlacklist(b);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'OMEGA': return { border: 'border-l-rose-600', text: 'text-rose-600', bg: 'bg-rose-50', icon: Skull };
      case 'ALPHA': return { border: 'border-l-orange-500', text: 'text-orange-500', bg: 'bg-orange-50', icon: AlertTriangle };
      case 'BETA': return { border: 'border-l-amber-500', text: 'text-amber-500', bg: 'bg-amber-50', icon: ShieldAlert };
      default: return { border: 'border-l-indigo-400', text: 'text-indigo-400', bg: 'bg-indigo-50', icon: Activity };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header Forensic Context */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Risk Surveillance</h1>
          <p className="text-slate-500 text-xs md:text-sm font-medium">Real-time heuristic detection and fraud mitigation console</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={fetchData}
            className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3.5 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-100 hover:bg-rose-700 transition-all border-b-4 border-rose-900 active:border-b-0 active:translate-y-1">
            <ShieldX size={18} /> Global System Freeze
          </button>
        </div>
      </div>

      {/* Risk KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <RiskStat label="Global Risk Vector" value={`${kpis?.globalRiskScore || '0'}%`} sub="Current Network Threat" icon={Target} color="text-rose-600" bg="bg-rose-50" />
        <RiskStat label="Suspect Players" value={kpis?.flaggedUsers || '0'} sub="Pending Triage" icon={Ban} color="text-orange-500" bg="bg-orange-50" />
        <RiskStat label="Blacklisted IPs" value={kpis?.blockedIps || '0'} sub="Firewall Blocked" icon={Globe} color="text-indigo-600" bg="bg-indigo-50" />
        <RiskStat label="Critical Alerts" value={kpis?.pendingTriage || '0'} sub="Immediate Action Required" icon={Zap} color="text-amber-600" bg="bg-amber-50" />
      </div>

      {/* Main Alert Feed Interface */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left: Alerts List */}
        <div className="xl:col-span-8 space-y-4">
          {/* Filters Toolbar */}
          <div className="bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex gap-2 p-1 bg-slate-50 rounded-xl">
              {['All', 'OMEGA', 'ALPHA', 'BETA'].map(s => (
                <button
                  key={s}
                  onClick={() => setFilterSeverity(s)}
                  className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filterSeverity === s ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4 bg-slate-50 px-6 py-2 rounded-xl w-full md:w-64 border border-slate-100 shadow-inner">
              <Search size={16} className="text-slate-300" />
              <input type="text" placeholder="Search Alert Nodes..." className="bg-transparent border-none outline-none text-xs font-bold w-full text-slate-700 placeholder:text-slate-400" />
            </div>
          </div>

          {/* Dynamic Alerts Feed */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="p-32 text-center bg-white rounded-[3rem] border border-slate-200">
                <Loader2 className="animate-spin mx-auto text-indigo-600 mb-4" size={48} />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Risk Database...</p>
              </div>
            ) : alerts.filter(a => filterSeverity === 'All' || a.severity === filterSeverity).map(alert => {
              const styles = getSeverityStyles(alert.severity);
              const Icon = styles.icon;
              return (
                <div key={alert.id} className={`group bg-white p-8 rounded-[2.5rem] border border-slate-200 border-l-8 ${styles.border} shadow-sm transition-all hover:shadow-xl hover:-translate-y-1`}>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className={`p-5 rounded-[1.5rem] h-fit ${styles.bg} ${styles.text} shadow-inner`}>
                      <Icon size={32} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${styles.bg} ${styles.text} border-current/10`}>
                            {alert.severity} • {alert.type}
                          </span>
                          <span className="text-[10px] font-black text-slate-300 flex items-center gap-1">
                            <Clock size={12} /> {alert.timestamp}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black text-slate-400 uppercase">Confidence:</span>
                          <span className={`text-sm font-black ${alert.confidence > 80 ? 'text-rose-600' : 'text-emerald-500'}`}>{alert.confidence}%</span>
                        </div>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">{alert.reason}</h3>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mt-6">
                        <div className="flex gap-4">
                          <div className="px-4 py-2 bg-slate-50 rounded-xl">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Entity Trace</p>
                            <p className="text-xs font-black text-slate-700">{alert.entityName} ({alert.entityId})</p>
                          </div>
                          <div className="px-4 py-2 bg-slate-50 rounded-xl">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Alert Node</p>
                            <p className="text-xs font-black text-slate-700">{alert.id}</p>
                          </div>
                        </div>
                        <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                          <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                            <Eye size={16} /> Investigate
                          </button>
                          <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                            <CheckCircle2 size={16} /> Resolve
                          </button>
                          <button className="flex items-center justify-center p-2.5 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 hover:bg-rose-600 hover:text-white transition-all">
                            <Ban size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Heuristics & Live Feed */}
        <div className="xl:col-span-4 space-y-8">
          {/* Risk Distribution Card */}
          <div className="bg-slate-950 p-8 rounded-[3rem] text-white border border-slate-800 shadow-2xl relative overflow-hidden">
            <h3 className="text-lg font-black tracking-tight mb-2">Pattern Heuristics</h3>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-10">Historical Anomaly Breakdown</p>

            <div className="space-y-6">
              {heuristics && heuristics.length > 0 ? (
                heuristics.map((h, idx) => (
                  <PatternRow key={idx} label={h.label} percent={h.percentage} color={h.color} />
                ))
              ) : (
                <p className="text-[10px] text-slate-500 italic">Calculating heuristics...</p>
              )}
            </div>

            <div className="mt-12 pt-8 border-t border-white/10 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Global Heat</p>
                <p className="text-2xl font-black text-white">
                  {kpis?.globalRiskScore > 70 ? 'CRITICAL' : kpis?.globalRiskScore > 40 ? 'MEDIUM' : 'LOW'}
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-3xl border border-white/10">
                <Activity size={24} className={kpis?.globalRiskScore > 40 ? 'text-rose-400' : 'text-emerald-400'} />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
          </div>

          {/* Live IP Block List */}
          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Node Firewall</h3>
              <button
                onClick={fetchData}
                className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-indigo-600 transition-colors"
              >
                <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
              </button>
            </div>
            <div className="space-y-4">
              {blacklist && blacklist.length > 0 ? (
                blacklist.map((ip, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                      <div>
                        <p className="text-xs font-black text-slate-800 tracking-tight">{ip.ip}</p>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Reason: {ip.reason}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase">{ip.time}</span>
                  </div>
                ))
              ) : (
                <p className="text-center py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-slate-400">No active threats</p>
              )}
            </div>
            <button className="w-full mt-8 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm">
              View All Blacklisted Nodes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RiskStat = ({ label, value, sub, icon: Icon, color, bg }: any) => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
    <div className="flex justify-between items-start mb-6 relative z-10">
      <div className={`p-4 ${bg} ${color} rounded-2xl group-hover:scale-110 transition-transform`}><Icon size={24} /></div>
      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
    </div>
    <div className="relative z-10">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
      <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase opacity-60">{sub}</p>
    </div>
    <div className={`absolute -bottom-6 -right-6 w-24 h-24 ${bg} rounded-full opacity-30 blur-2xl group-hover:scale-150 transition-transform`}></div>
  </div>
);

const PatternRow = ({ label, percent, color }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
      <span>{label}</span>
      <span className="text-white">{percent}%</span>
    </div>
    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
      <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${percent}%` }}></div>
    </div>
  </div>
);

export default RiskAlerts;
