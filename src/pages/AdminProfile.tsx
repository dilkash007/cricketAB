
import React from 'react';
import { 
  UserCircle, 
  ShieldCheck, 
  MapPin, 
  Smartphone, 
  Globe, 
  History,
  Lock,
  Mail,
  Phone
} from 'lucide-react';

const AdminProfile: React.FC = () => {
  const loginActivity = [
    { id: 1, time: '2024-05-20 14:45', ip: '192.168.1.1', device: 'Chrome / MacOS', status: 'Success' },
    { id: 2, time: '2024-05-20 09:12', ip: '103.44.11.2', device: 'Safari / iPhone 14', status: 'Success' },
    { id: 3, time: '2024-05-19 18:30', ip: '192.168.1.1', device: 'Chrome / MacOS', status: 'Success' },
    { id: 4, time: '2024-05-19 11:20', ip: '172.16.0.4', device: 'Edge / Windows 11', status: 'Logout' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-32 bg-indigo-600 relative">
          <div className="absolute -bottom-12 left-8 p-1 bg-white rounded-full">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-indigo-600 border border-slate-200">
              <UserCircle size={64} />
            </div>
          </div>
        </div>
        <div className="pt-16 pb-8 px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Admin User</h1>
            <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
              <ShieldCheck size={18} className="text-indigo-600" /> Super Administrator
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-200 transition-all">
              <Lock size={16} /> Change Password
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
              Edit Profile
            </button>
          </div>
        </div>
        
        <div className="px-8 pb-8 border-t border-slate-50 pt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <ContactItem icon={Mail} label="Email Address" value="superadmin@elitebetting.com" />
          <ContactItem icon={Phone} label="Contact Phone" value="+1 (555) 012-3456" />
          <ContactItem icon={Globe} label="Region" value="Global / Tier 1" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <History size={20} className="text-indigo-600" /> 
              Recent Login & Session Activity
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">IP Address</th>
                  <th className="px-6 py-4">Device</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {loginActivity.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-600 font-medium">{log.time}</td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{log.ip}</td>
                    <td className="px-6 py-4 text-slate-500 flex items-center gap-2">
                      <Smartphone size={14} /> {log.device}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        log.status === 'Success' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-indigo-900 rounded-3xl p-8 text-white space-y-8 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="font-bold text-xl mb-6">Admin Summary</h3>
            <div className="space-y-6">
              <SummaryItem label="Actions Authored" value="1,245" />
              <SummaryItem label="Vendors Managed" value="48" />
              <SummaryItem label="Avg Security Score" value="98%" />
              <div className="pt-6 border-t border-indigo-800 mt-6">
                <p className="text-xs text-indigo-300 mb-2 font-bold uppercase tracking-widest">Active Status</p>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                  <span className="font-bold">Online & Audited</span>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-800 rounded-full -translate-y-1/2 translate-x-1/2 opacity-30"></div>
        </div>
      </div>
    </div>
  );
};

const ContactItem = ({ icon: Icon, label, value }: any) => (
  <div className="flex items-start gap-4">
    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
      <Icon size={18} />
    </div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-0.5">{label}</p>
      <p className="text-sm font-bold text-slate-700">{value}</p>
    </div>
  </div>
);

const SummaryItem = ({ label, value }: any) => (
  <div className="flex justify-between items-center">
    <span className="text-indigo-300 font-medium text-sm">{label}</span>
    <span className="font-bold text-lg">{value}</span>
  </div>
);

export default AdminProfile;
