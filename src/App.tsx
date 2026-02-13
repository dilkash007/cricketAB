
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  Wallet, 
  BarChart3, 
  ShieldCheck, 
  Bell, 
  LogOut, 
  Menu, 
  X,
  Search,
  Settings as SettingsIcon,
  UserCircle,
  AlertCircle,
  Trophy,
  ClipboardList
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import VendorManagement from './pages/VendorManagement';
import UserManagement from './pages/UserManagement';
import WalletManagement from './pages/WalletManagement';
import Reports from './pages/Reports';
import AuditLogs from './pages/AuditLogs';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import MatchManagement from './pages/MatchManagement';
import AdminProfile from './pages/AdminProfile';
import MatchApproval from './pages/MatchApproval';
import Login from './pages/Login';
import Signup from './pages/Signup';

const SidebarLink = ({ to, icon: Icon, label, active, count, onClick }: { to: string; icon: any; label: string; active: boolean; count?: number; onClick?: () => void }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
        : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600'
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </div>
    {count !== undefined && count > 0 && (
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-white text-indigo-600' : 'bg-red-500 text-white'}`}>
        {count}
      </span>
    )}
  </Link>
);

const SidebarRoutes = ({ onItemClick }: { onItemClick?: () => void }) => {
  const location = useLocation();
  return (
    <nav className="space-y-1">
      <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/'} onClick={onItemClick} />
      <SidebarLink to="/approvals" icon={ClipboardList} label="Match Approvals" active={location.pathname === '/approvals'} count={2} onClick={onItemClick} />
      <SidebarLink to="/matches" icon={Trophy} label="Games & Betting" active={location.pathname === '/matches'} onClick={onItemClick} />
      <SidebarLink to="/vendors" icon={Store} label="Vendors" active={location.pathname === '/vendors'} onClick={onItemClick} />
      <SidebarLink to="/users" icon={Users} label="Users" active={location.pathname === '/users'} onClick={onItemClick} />
      <SidebarLink to="/wallet" icon={Wallet} label="Wallet & Finances" active={location.pathname === '/wallet'} onClick={onItemClick} />
      <SidebarLink to="/reports" icon={BarChart3} label="Reports & Analytics" active={location.pathname === '/reports'} onClick={onItemClick} />
      <SidebarLink to="/logs" icon={ShieldCheck} label="Audit Logs" active={location.pathname === '/logs'} onClick={onItemClick} />
      <SidebarLink to="/notifications" icon={AlertCircle} label="Risk Alerts" active={location.pathname === '/notifications'} count={4} onClick={onItemClick} />
    </nav>
  );
};

const MainLayout: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-hidden relative">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:w-64 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200" style={{ boxShadow: '0 8px 16px -4px rgba(79, 70, 229, 0.4)' }}>
                  E
                </div>
                <h1 className="text-xl font-bold tracking-tight text-slate-800">ELITE ADMIN</h1>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-2 text-slate-400 hover:bg-slate-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <SidebarRoutes onItemClick={() => setIsSidebarOpen(false)} />
          </div>

          <div className="mt-auto p-6 space-y-4">
            <Link 
              to="/settings" 
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${location.pathname === '/settings' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <SettingsIcon size={20} />
              <span className="font-medium">System Settings</span>
            </Link>
            <button 
              onClick={onLogout}
              className="flex items-center gap-3 px-4 py-3 w-full text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left"
            >
              <LogOut size={20} />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 md:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center gap-4 bg-slate-100 px-4 py-2 rounded-xl w-64 lg:w-96">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search everything..." 
                className="bg-transparent border-none outline-none text-sm w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-6">
            <Link to="/notifications" className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative">
              <Bell size={22} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </Link>

            <Link to="/profile" className="flex items-center gap-2 md:gap-3 md:pl-6 md:border-l md:border-slate-200 group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Admin User</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Super Admin</p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-indigo-600 overflow-hidden group-hover:border-indigo-200 transition-all">
                <UserCircle size={24} className="md:size-28" />
              </div>
            </Link>
          </div>
        </header>

        {/* Page View */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/approvals" element={<MatchApproval />} />
            <Route path="/vendors" element={<VendorManagement />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/wallet" element={<WalletManagement />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/logs" element={<AuditLogs />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/matches" element={<MatchManagement />} />
            <Route path="/profile" element={<AdminProfile />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleLogin = (email: string, pass: string) => {
    if (email === 'demo123@gmail.com' && pass === 'demo123') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid administrative credentials. Access denied.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <HashRouter>
      {!isAuthenticated ? (
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} error={authError} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      ) : (
        <MainLayout onLogout={handleLogout} />
      )}
    </HashRouter>
  );
};

export default App;
