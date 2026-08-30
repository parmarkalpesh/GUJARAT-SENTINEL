// ============================================================
// Gujarat Sentinel — Main Application & Routing Matrix
// ============================================================
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, createContext, useContext, useCallback, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  LayoutDashboard, Monitor, Map, Car, Shield, AlertTriangle, FileText, Search,
  Camera, Activity, BarChart3, FileBarChart, Link2, Cpu, Users, ScrollText,
  Settings as SettingsIcon, ChevronLeft, ChevronRight, Bell, Menu, LogOut, Zap, Radio,
  Play, Square, X, Award, Layers
} from 'lucide-react';
import { api } from './services/api';

// ── Pages ──
import CommandCenter from './pages/CommandCenter';
import Login from './pages/Login';
import VehicleIntelligence from './pages/VehicleIntelligence';
import LiveCCTV from './pages/LiveCCTV';
import GISIntelligence from './pages/GISIntelligence';
import Watchlist from './pages/Watchlist';
import AlertCenter from './pages/AlertCenter';
import IncidentManagement from './pages/IncidentManagement';
import VideoSearch from './pages/VideoSearch';
import CameraRegistry from './pages/CameraRegistry';
import CameraHealth from './pages/CameraHealth';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import IntegrationHub from './pages/IntegrationHub';
import SystemMonitor from './pages/SystemMonitor';
import UserManagement from './pages/UserManagement';
import AuditLog from './pages/AuditLog';
import Settings from './pages/Settings';
import ChallengeCompliance from './pages/ChallengeCompliance';
import ArchitecturePage from './pages/ArchitecturePage';

// ── Auth Context ──
interface AuthState { user: any | null; token: string | null; }
const AuthContext = createContext<{
  auth: AuthState;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}>({ auth: { user: null, token: null }, login: async () => {}, logout: () => {} });

export const useAuth = () => useContext(AuthContext);

// ── WebSocket Context ──
const SocketContext = createContext<Socket | null>(null);
export const useSocket = () => useContext(SocketContext);

// ── Alert Toast Context ──
interface ToastAlert {
  id: string;
  type: string;
  priority: string;
  message: string;
  entity: string;
  location: string;
  timestamp: string;
}

const ToastContext = createContext<{ toasts: ToastAlert[]; removeToast: (id: string) => void }>({
  toasts: [], removeToast: () => {}
});
export const useToasts = () => useContext(ToastContext);

// ── Demo Context ──
interface DemoState {
  running: boolean;
  phase: number;
  phaseName: string;
  phaseDescription: string;
  totalPhases: number;
  events: Array<{ message: string; icon: string; time: string }>;
}

const DemoContext = createContext<{
  demo: DemoState;
  startDemo: () => void;
  stopDemo: () => void;
}>({ demo: { running: false, phase: 0, phaseName: '', phaseDescription: '', totalPhases: 11, events: [] }, startDemo: () => {}, stopDemo: () => {} });
export const useDemo = () => useContext(DemoContext);

// ── Nav Items (All 19 Modules & Hackathon Views) ──
const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Command Center' },
  { path: '/cctv', icon: Monitor, label: 'Live CCTV Wall' },
  { path: '/gis', icon: Map, label: 'GIS Tactical Map' },
  { path: '/vehicles', icon: Car, label: 'Vehicle Intelligence' },
  { path: '/watchlist', icon: Shield, label: 'Watchlist Match' },
  { path: '/alerts', icon: AlertTriangle, label: 'Alert Dispatch' },
  { path: '/incidents', icon: FileText, label: 'Incident Dossier' },
  { path: '/video-search', icon: Search, label: 'Forensic Search' },
  { path: '/cameras', icon: Camera, label: 'Camera Registry' },
  { path: '/camera-health', icon: Activity, label: 'Camera Health' },
  { path: '/analytics', icon: BarChart3, label: 'AI Analytics' },
  { path: '/reports', icon: FileBarChart, label: 'Reports & Export' },
  { path: '/integrations', icon: Link2, label: 'Integration Hub' },
  { path: '/system', icon: Cpu, label: 'System Monitor' },
  { path: '/compliance', icon: Award, label: 'Statutory Compliance' },
  { path: '/architecture', icon: Layers, label: '80K Scale Architecture' },
  { path: '/users', icon: Users, label: 'Personnel & RBAC' },
  { path: '/audit', icon: ScrollText, label: 'Audit Trail' },
  { path: '/settings', icon: SettingsIcon, label: 'Settings' },
];

// ── Sidebar ──
function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const location = useLocation();

  return (
    <aside
      style={{
        backgroundColor: '#0f172a',
        borderRight: '1px solid #1e293b',
        color: '#e2e8f0',
      }}
      className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 flex flex-col ${collapsed ? 'w-16' : 'w-60'}`}
    >
      {/* Brand */}
      <div
        style={{ borderBottom: '1px solid #1e293b' }}
        className="p-3.5 flex items-center gap-2.5 min-h-[64px]"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
          <Shield className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="text-xs font-black text-white tracking-wider leading-tight">GUJARAT</div>
            <div className="text-[10px] font-bold text-sky-400 tracking-widest">SENTINEL</div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="ml-auto text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                backgroundColor: isActive ? '#1e293b' : 'transparent',
                color: isActive ? '#38bdf8' : '#94a3b8',
                border: isActive ? '1px solid #334155' : '1px solid transparent',
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all group hover:text-white hover:bg-slate-800/60"
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-400 group-hover:text-white'}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* System Status */}
      <div style={{ borderTop: '1px solid #1e293b' }} className={`p-3 ${collapsed ? 'text-center' : ''}`}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {!collapsed && <span className="text-[10px] text-slate-400 font-bold tracking-wider">STATE NETWORK SECURE</span>}
        </div>
      </div>
    </aside>
  );
}

// ── Top Bar ──
function TopBar({ onMenuToggle, sidebarCollapsed }: { onMenuToggle: () => void; sidebarCollapsed: boolean }) {
  const { auth, logout } = useAuth();
  const { demo, startDemo, stopDemo } = useDemo();
  const { toasts } = useToasts();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const navigate = useNavigate();

  const handleSearch = useCallback(async (q: string) => {
    setSearchQuery(q);
    if (q.length >= 2) {
      try {
        const { results } = await api.globalSearch(q);
        setSearchResults(results);
      } catch { setSearchResults([]); }
    } else {
      setSearchResults([]);
    }
  }, []);

  const handleResultClick = (result: any) => {
    setSearchOpen(false);
    setSearchQuery('');
    if (result.type === 'vehicle') navigate(`/vehicles?plate=${result.id}`);
    else if (result.type === 'camera') navigate(`/cameras`);
    else if (result.type === 'alert') navigate(`/alerts`);
    else if (result.type === 'incident') navigate(`/incidents`);
  };

  return (
    <header
      style={{ height: '64px' }}
      className={`fixed top-0 right-0 bg-white border-b border-slate-200 shadow-sm z-40 flex items-center justify-between px-6 transition-all duration-300 ${sidebarCollapsed ? 'left-16' : 'left-60'}`}
    >
      {/* Left */}
      <div className="flex items-center gap-4">
        <button onClick={onMenuToggle} className="lg:hidden text-slate-500 hover:text-slate-900">
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden md:block">
          <h1 className="text-sm font-black text-slate-900 tracking-wider flex items-center gap-2">
            GUJARAT <span className="text-blue-600">SENTINEL</span>
            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              OPERATIONAL C2
            </span>
          </h1>
          <p className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">
            State Crime Records Bureau • Unified Surveillance Platform
          </p>
        </div>
      </div>

      {/* Center — Search */}
      <div className="relative flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search license plate, camera ID, FIR..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setSearchOpen(true)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          />
        </div>
        {searchOpen && searchResults.length > 0 && (
          <div className="absolute top-full mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden z-50">
            {searchResults.map((r, i) => (
              <button key={i} onClick={() => handleResultClick(r)} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 border-b border-slate-100 last:border-0 cursor-pointer">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${r.type === 'vehicle' ? 'bg-blue-50 text-blue-700 border border-blue-200' : r.type === 'alert' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-purple-50 text-purple-700 border border-purple-200'}`}>
                  {r.type.toUpperCase()}
                </span>
                <div>
                  <div className="text-xs font-semibold text-slate-900">{r.title}</div>
                  <div className="text-[10px] text-slate-500">{r.subtitle}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Intercept Runner */}
        {!demo.running ? (
          <button
            onClick={startDemo}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-extrabold tracking-wider shadow-sm transition-all cursor-pointer"
          >
            <Play className="w-3 h-3" />
            SIMULATE TARGET INTERCEPT
          </button>
        ) : (
          <button
            onClick={stopDemo}
            className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-extrabold tracking-wider transition-all cursor-pointer"
          >
            <Square className="w-3 h-3" />
            STOP SIMULATION
          </button>
        )}

        {/* System */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200">
          <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
          <span className="text-[10px] font-extrabold text-emerald-700">50 NODES ONLINE</span>
        </div>

        {/* User */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-xs font-bold text-white shadow-sm">
            {auth.user?.full_name?.charAt(0) || 'A'}
          </div>
          <div className="hidden lg:block">
            <div className="text-xs font-bold text-slate-900">{auth.user?.full_name || 'Admin'}</div>
            <div className="text-[10px] text-slate-500 font-semibold">{auth.user?.role?.replace(/_/g, ' ') || 'SUPER ADMIN'}</div>
          </div>
          <button onClick={logout} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Clock */}
        <div className="hidden xl:block text-right pl-3 border-l border-slate-200">
          <ClockDisplay />
        </div>
      </div>
    </header>
  );
}

function ClockDisplay() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <>
      <div className="text-xs font-bold text-slate-900 font-mono">{time.toLocaleTimeString('en-IN', { hour12: false })}</div>
      <div className="text-[10px] text-slate-500 font-medium">{time.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
    </>
  );
}

// ── Alert Toasts ──
function AlertToasts() {
  const { toasts, removeToast } = useToasts();

  return (
    <div className="fixed top-16 right-4 z-[100] space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <div key={toast.id} className={`alert-toast-enter rounded-xl border shadow-xl p-3.5 ${
          toast.priority === 'CRITICAL' ? 'bg-red-50 border-red-200 text-red-900 shadow-red-100' :
          toast.priority === 'HIGH' ? 'bg-amber-50 border-amber-200 text-amber-900 shadow-amber-100' :
          'bg-white border-slate-200 text-slate-900 shadow-slate-100'
        }`}>
          <div className="flex items-start gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              toast.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                  toast.priority === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
                }`}>
                  {toast.priority}
                </span>
                <span className="text-xs font-bold text-slate-900">{toast.type.replace(/_/g, ' ')}</span>
              </div>
              <div className="text-xs font-extrabold text-slate-900 mt-1">{toast.entity}</div>
              <div className="text-[10px] text-slate-500">{toast.location} • {new Date(toast.timestamp).toLocaleTimeString()}</div>
            </div>
            <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Demo Overlay ──
function DemoOverlay() {
  const { demo } = useDemo();
  if (!demo.running) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[90] w-full max-w-lg">
      <div className="bg-white border border-blue-200 rounded-2xl p-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <Zap className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] font-extrabold text-blue-600 tracking-widest uppercase">AUTOMATED INTERCEPT WORKFLOW</div>
            <div className="text-xs font-bold text-slate-900">Phase {demo.phase}/{demo.totalPhases}: {demo.phaseName}</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-[10px] text-slate-500 font-semibold">Progress</div>
            <div className="text-xs font-black text-blue-600">{Math.round((demo.phase / demo.totalPhases) * 100)}%</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
            style={{ width: `${(demo.phase / demo.totalPhases) * 100}%` }}
          />
        </div>

        <p className="text-[11px] text-slate-600 font-medium">{demo.phaseDescription}</p>

        {demo.events.length > 0 && (
          <div className="mt-2.5 space-y-1.5 max-h-20 overflow-y-auto">
            {demo.events.slice(-3).map((evt, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px]">
                <span>{evt.icon}</span>
                <span className="text-slate-600">{evt.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Layout ──
function MainLayout({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-slate-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <TopBar onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} sidebarCollapsed={sidebarCollapsed} />

      <main className={`pt-[74px] min-h-screen overflow-y-auto transition-all duration-300 bg-slate-50 ${sidebarCollapsed ? 'ml-16' : 'ml-60'}`}>
        <div className="p-6">
          {children}
        </div>
      </main>

      <AlertToasts />
      <DemoOverlay />
    </div>
  );
}

// ── Protected Route ──
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { auth } = useAuth();
  if (!auth.token) return <Navigate to="/login" replace />;
  return <MainLayout>{children}</MainLayout>;
}

// ── App Component with Routes ──
export default function App() {
  const [auth, setAuth] = useState<AuthState>(() => {
    const token = localStorage.getItem('sentinel_token');
    const user = localStorage.getItem('sentinel_user');
    return { token, user: user ? JSON.parse(user) : null };
  });

  const [socket, setSocket] = useState<Socket | null>(null);
  const [toasts, setToasts] = useState<ToastAlert[]>([]);
  const [demo, setDemo] = useState<DemoState>({
    running: false, phase: 0, phaseName: '', phaseDescription: '', totalPhases: 11, events: []
  });

  // Connect socket
  useEffect(() => {
    if (auth.token) {
      const s = io('http://localhost:3001', { transports: ['websocket'] });
      s.on('connect', () => {
        s.emit('join:control-room');
      });

      // Alert events
      s.on('alert:new', (data: any) => {
        const toast: ToastAlert = {
          id: data.alert_id || Date.now().toString(),
          type: data.type || 'ALERT',
          priority: data.priority || 'HIGH',
          message: `${data.type?.replace(/_/g, ' ')} detected`,
          entity: data.detected_entity || 'Unknown',
          location: data.location || 'Unknown',
          timestamp: data.timestamp || new Date().toISOString(),
        };
        setToasts(prev => [toast, ...prev].slice(0, 5));

        // Play subtle alert tone for critical
        if (data.priority === 'CRITICAL') {
          try {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 800;
            gain.gain.value = 0.05;
            osc.start();
            setTimeout(() => { osc.stop(); ctx.close(); }, 250);
          } catch {}
        }
      });

      // Demo events
      s.on('demo:phase', (data: any) => {
        setDemo(prev => ({ ...prev, running: true, phase: data.phase, phaseName: data.name, phaseDescription: data.description, totalPhases: data.totalPhases }));
      });

      s.on('demo:event', (data: any) => {
        setDemo(prev => ({
          ...prev,
          events: [...prev.events, { message: data.message, icon: data.icon, time: new Date().toISOString() }].slice(-10)
        }));
      });

      s.on('demo:complete', () => {
        setDemo({ running: false, phase: 0, phaseName: '', phaseDescription: '', totalPhases: 11, events: [] });
      });

      setSocket(s);
      return () => { s.disconnect(); };
    }
  }, [auth.token]);

  const login = useCallback(async (username: string, password: string) => {
    const { token, user } = await api.login(username, password);
    localStorage.setItem('sentinel_token', token);
    localStorage.setItem('sentinel_user', JSON.stringify(user));
    setAuth({ token, user });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('sentinel_token');
    localStorage.removeItem('sentinel_user');
    setAuth({ token: null, user: null });
    socket?.disconnect();
  }, [socket]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const startDemoFn = useCallback(async () => {
    try { await api.startDemo(); } catch {}
  }, []);

  const stopDemoFn = useCallback(async () => {
    try { await api.stopDemo(); } catch {}
    setDemo({ running: false, phase: 0, phaseName: '', phaseDescription: '', totalPhases: 11, events: [] });
  }, []);

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      <SocketContext.Provider value={socket}>
        <ToastContext.Provider value={{ toasts, removeToast }}>
          <DemoContext.Provider value={{ demo, startDemo: startDemoFn, stopDemo: stopDemoFn }}>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={auth.token ? <Navigate to="/" replace /> : <Login />} />
                <Route path="/" element={<ProtectedRoute><CommandCenter /></ProtectedRoute>} />
                <Route path="/cctv" element={<ProtectedRoute><LiveCCTV /></ProtectedRoute>} />
                <Route path="/gis" element={<ProtectedRoute><GISIntelligence /></ProtectedRoute>} />
                <Route path="/vehicles" element={<ProtectedRoute><VehicleIntelligence /></ProtectedRoute>} />
                <Route path="/watchlist" element={<ProtectedRoute><Watchlist /></ProtectedRoute>} />
                <Route path="/alerts" element={<ProtectedRoute><AlertCenter /></ProtectedRoute>} />
                <Route path="/incidents" element={<ProtectedRoute><IncidentManagement /></ProtectedRoute>} />
                <Route path="/video-search" element={<ProtectedRoute><VideoSearch /></ProtectedRoute>} />
                <Route path="/cameras" element={<ProtectedRoute><CameraRegistry /></ProtectedRoute>} />
                <Route path="/camera-health" element={<ProtectedRoute><CameraHealth /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                <Route path="/integrations" element={<ProtectedRoute><IntegrationHub /></ProtectedRoute>} />
                <Route path="/system" element={<ProtectedRoute><SystemMonitor /></ProtectedRoute>} />
                <Route path="/compliance" element={<ProtectedRoute><ChallengeCompliance /></ProtectedRoute>} />
                <Route path="/architecture" element={<ProtectedRoute><ArchitecturePage /></ProtectedRoute>} />
                <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
                <Route path="/audit" element={<ProtectedRoute><AuditLog /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </DemoContext.Provider>
        </ToastContext.Provider>
      </SocketContext.Provider>
    </AuthContext.Provider>
  );
}
