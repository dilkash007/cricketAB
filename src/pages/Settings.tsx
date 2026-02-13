
import React, { useState, useEffect } from 'react';
import { 
  Save, 
  RotateCcw, 
  Activity, 
  ShieldAlert, 
  Globe, 
  Database,
  Lock,
  Zap,
  RefreshCw,
  Cpu,
  Server,
  CloudLightning,
  ShieldCheck,
  Power,
  HardDrive,
  Terminal,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Key
} from 'lucide-react';
import { ApiService } from '../api_service';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Core Engine');
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      const data = await ApiService.getSettings();
      setSettings(data);
      setIsLoading(false);
    };
    fetchSettings();
  }, []);

  const handleUpdate = (cat: string, key: string, val: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [cat]: { ...prev[cat], [key]: val }
    }));
    setHasChanges(true);
  };

  const handleCommit = async () => {
    setIsSaving(true);
    await ApiService.updateSettings('global', settings);
    setIsSaving(false);
    setHasChanges(false);
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading System Registry...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      {/* Header Context */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">System Infrastructure</h1>
          <p className="text-slate-500 text-xs md:text-sm font-medium">Orchestrate global betting logic, security protocols, and node clusters</p>
        </div>
        <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm">
           <ShieldCheck className="text-emerald-500" size={24} />
           <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Integrity Score</p>
              <p className="text-sm font-black text-slate-800 tracking-tight">98.4 / 100</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <div className="xl:col-span-3 space-y-2">
           {['Core Engine', 'Security & Access', 'API Clusters', 'DevOps Ops'].map(tab => (
             <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' 
                : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'
              }`}
             >
               <div className="flex items-center gap-3">
                  {tab === 'Core Engine' && <Zap size={18} />}
                  {tab === 'Security & Access' && <Lock size={18} />}
                  {tab === 'API Clusters' && <Server size={18} />}
                  {tab === 'DevOps Ops' && <Terminal size={18} />}
                  {tab}
               </div>
               <ChevronRight size={14} className={activeTab === tab ? 'opacity-100' : 'opacity-0'} />
             </button>
           ))}

           <div className="mt-8 p-6 bg-slate-900 rounded-[2.5rem] text-white overflow-hidden relative group">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-4">Instance Health</h4>
              <div className="space-y-4 relative z-10">
                 <HealthMini label="CPU Utilization" percent={18} />
                 <HealthMini label="Memory Pool" percent={42} />
                 <HealthMini label="Disk IOPS" percent={5} />
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>
           </div>
        </div>

        {/* Content Area */}
        <div className="xl:col-span-9 space-y-8">
          
          {activeTab === 'Core Engine' && (
            <div className="grid grid-cols-1 gap-8 animate-in slide-in-from-right-4 duration-300">
              <SettingsCard title="Global Betting Multipliers" icon={Zap}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ConfigInput 
                      label="Global Odd Multiplier" 
                      value={settings.betting.defaultMultiplier} 
                      onChange={(v) => handleUpdate('betting', 'defaultMultiplier', parseFloat(v))}
                      type="number"
                      step="0.01"
                      desc="Affects all market odds across the system."
                    />
                    <ConfigInput 
                      label="Settlement Delay (s)" 
                      value={settings.betting.settlementDelay} 
                      onChange={(v) => handleUpdate('betting', 'settlementDelay', parseInt(v))}
                      type="number"
                      desc="Grace period before payouts are processed."
                    />
                 </div>
              </SettingsCard>

              <SettingsCard title="Exposure Limits" icon={Activity}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ConfigInput 
                      label="Max Single Bet ($)" 
                      value={settings.betting.maxSingleBet} 
                      onChange={(v) => handleUpdate('betting', 'maxSingleBet', parseInt(v))}
                      type="number"
                    />
                    <ConfigInput 
                      label="Max Accumulator Payout ($)" 
                      value={settings.betting.maxAccumulator} 
                      onChange={(v) => handleUpdate('betting', 'maxAccumulator', parseInt(v))}
                      type="number"
                    />
                 </div>
              </SettingsCard>
            </div>
          )}

          {activeTab === 'Security & Access' && (
            <div className="grid grid-cols-1 gap-8 animate-in slide-in-from-right-4 duration-300">
              <SettingsCard title="Access Protocols" icon={Lock}>
                 <div className="space-y-6">
                    <ToggleRow 
                      label="Enforce 2FA for Admins" 
                      desc="Mandatory Google/Authy authentication for all dashboard access."
                      enabled={settings.security.twoFactorEnforced}
                      onChange={(v) => handleUpdate('security', 'twoFactorEnforced', v)}
                    />
                    <ToggleRow 
                      label="IP Whitelisting" 
                      desc="Restrict dashboard access to known corporate network ranges."
                      enabled={settings.security.ipWhitelistEnabled}
                      onChange={(v) => handleUpdate('security', 'ipWhitelistEnabled', v)}
                    />
                    <ConfigInput 
                      label="Session Timeout (Minutes)" 
                      value={settings.security.sessionTimeout} 
                      onChange={(v) => handleUpdate('security', 'sessionTimeout', parseInt(v))}
                      type="number"
                      desc="Automatically kill idle admin sessions."
                    />
                 </div>
              </SettingsCard>

              <div className="bg-rose-50 border border-rose-100 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-8 shadow-sm">
                 <div className="p-5 bg-white rounded-3xl text-rose-600 shadow-sm">
                    <Power size={32} />
                 </div>
                 <div className="flex-1">
                    <h3 className="text-xl font-black text-rose-900 tracking-tight">Maintenance Kill Switch</h3>
                    <p className="text-sm font-medium text-rose-700/70 mt-1 uppercase text-[10px] font-black tracking-widest">Global Production Shutdown</p>
                    <p className="text-xs text-rose-800/60 mt-2">Activating this will disconnect all users, suspend all markets, and enter read-only mode.</p>
                 </div>
                 <button 
                  onClick={() => handleUpdate('security', 'maintenanceMode', !settings.security.maintenanceMode)}
                  className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    settings.security.maintenanceMode 
                    ? 'bg-rose-600 text-white shadow-xl shadow-rose-200' 
                    : 'bg-white border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white'
                  }`}
                 >
                   {settings.security.maintenanceMode ? 'SYSTEM IS SUSPENDED' : 'ACTIVATE KILL SWITCH'}
                 </button>
              </div>
            </div>
          )}

          {activeTab === 'API Clusters' && (
            <div className="grid grid-cols-1 gap-8 animate-in slide-in-from-right-4 duration-300">
               {settings.feeds.map((feed: any) => (
                 <div key={feed.id} className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 group">
                    <div className="flex items-center gap-6">
                       <div className={`p-5 rounded-3xl transition-all group-hover:scale-110 ${feed.status === 'Connected' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          <CloudLightning size={32} />
                       </div>
                       <div>
                          <h3 className="text-xl font-black text-slate-800 tracking-tight">{feed.name}</h3>
                          <div className="flex items-center gap-3 mt-1">
                             <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ${feed.status === 'Connected' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                {feed.status}
                             </span>
                             <span className="text-[10px] font-bold text-slate-400">Latency: {feed.latency}</span>
                          </div>
                       </div>
                    </div>
                    <div className="flex gap-3">
                       <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl border border-slate-100 hover:text-slate-800 transition-all">
                          <Key size={18} />
                       </button>
                       <button 
                        onClick={() => ApiService.testFeedConnection(feed.id)}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100"
                       >
                          Reconnect Feed
                       </button>
                    </div>
                 </div>
               ))}
            </div>
          )}

          {activeTab === 'DevOps Ops' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-right-4 duration-300">
               <MaintenanceCard 
                title="Optimize Database" 
                desc="Re-index tables and clean overhead from deleted rows." 
                icon={Database} 
                action={() => ApiService.performDbMaintenance('Optimize')}
               />
               <MaintenanceCard 
                title="Clear Global Cache" 
                desc="Flush Redis buffers and edge CDN layers immediately." 
                icon={RefreshCw} 
                action={() => ApiService.performDbMaintenance('Purge')}
               />
               <MaintenanceCard 
                title="Trigger Snapshot" 
                desc="Create a cold-storage backup of the entire system state." 
                icon={HardDrive} 
                action={() => ApiService.performDbMaintenance('Backup')}
               />
               <MaintenanceCard 
                title="Purge Audit Logs" 
                desc="Archive security logs older than 90 days to cold storage." 
                icon={FileText} 
                action={() => ApiService.archiveLogs('90')}
               />
            </div>
          )}

        </div>
      </div>

      {/* Floating Save Bar */}
      {hasChanges && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-12 duration-500">
           <div className="bg-slate-900 text-white px-10 py-6 rounded-[3rem] shadow-2xl flex items-center gap-12 border border-slate-800 backdrop-blur-xl bg-slate-900/90">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Uncommitted Mutations</p>
                <p className="text-sm font-medium">Global parameters have been staged.</p>
              </div>
              <div className="flex gap-4">
                 <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all"
                 >
                   Discard
                 </button>
                 <button 
                  onClick={handleCommit}
                  disabled={isSaving}
                  className="px-8 py-3 bg-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center gap-2"
                 >
                   {isSaving ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                   {isSaving ? 'Synching...' : 'Commit Changes'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const SettingsCard = ({ title, icon: Icon, children }: any) => (
  <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
    <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-50">
       <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Icon size={24} /></div>
       <h3 className="text-xl font-black text-slate-800 tracking-tight">{title}</h3>
    </div>
    {children}
  </div>
);

const ConfigInput = ({ label, value, onChange, type = "text", step, desc }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input 
      type={type} 
      step={step}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-700 outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-inner" 
    />
    {desc && <p className="text-[10px] text-slate-400 font-medium italic opacity-60 ml-1">{desc}</p>}
  </div>
);

const ToggleRow = ({ label, desc, enabled, onChange }: any) => (
  <div className="flex items-center justify-between p-6 bg-slate-50/50 border border-slate-100 rounded-3xl">
    <div className="max-w-md">
       <h4 className="text-sm font-black text-slate-800 tracking-tight">{label}</h4>
       <p className="text-xs text-slate-500 mt-1 font-medium">{desc}</p>
    </div>
    <button 
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 ${enabled ? 'bg-indigo-600' : 'bg-slate-300 shadow-inner'}`}
    >
      <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-all duration-300 ${enabled ? 'translate-x-7' : 'translate-x-1'}`} />
    </button>
  </div>
);

const HealthMini = ({ label, percent }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-500">
       <span>{label}</span>
       <span className="text-white">{percent}%</span>
    </div>
    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
       <div className="bg-indigo-500 h-full transition-all duration-1000" style={{ width: `${percent}%` }}></div>
    </div>
  </div>
);

const MaintenanceCard = ({ title, desc, icon: Icon, action }: any) => {
  const [loading, setLoading] = useState(false);
  const handleAction = async () => {
    setLoading(true);
    await action();
    setLoading(false);
  };
  return (
    <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col items-center text-center group">
       <div className="p-5 bg-slate-50 text-slate-400 rounded-[2rem] mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">
          <Icon size={32} />
       </div>
       <h3 className="text-lg font-black text-slate-800 tracking-tight">{title}</h3>
       <p className="text-xs text-slate-500 mt-2 mb-8 font-medium leading-relaxed">{desc}</p>
       <button 
        onClick={handleAction}
        disabled={loading}
        className="mt-auto w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all border-b-4 border-slate-700 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-2"
       >
          {loading ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
          {loading ? 'Running Task...' : 'Execute Operation'}
       </button>
    </div>
  );
};

export default Settings;
