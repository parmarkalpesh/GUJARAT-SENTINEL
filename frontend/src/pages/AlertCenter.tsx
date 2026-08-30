import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, ShieldAlert, CheckCircle2, XCircle, Search,
  Filter, Car, Camera, ArrowRight, Shield, Clock, FileText
} from 'lucide-react';
import { api } from '../services/api';
import { Alert } from '../types';

export default function AlertCenter() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const loadAlerts = async () => {
    try {
      const data = await api.alerts();
      setAlerts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAcknowledge = async (id: string) => {
    try {
      await api.acknowledgeAlert(id);
      loadAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await api.resolveAlert(id, 'Resolved by operator investigation');
      loadAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    const matchesPriority = priorityFilter === 'ALL' || alert.priority === priorityFilter;
    const matchesStatus = statusFilter === 'ALL' || alert.status === statusFilter;
    const matchesSearch =
      alert.detected_entity?.toLowerCase().includes(search.toLowerCase()) ||
      alert.location?.toLowerCase().includes(search.toLowerCase()) ||
      alert.camera_id?.toLowerCase().includes(search.toLowerCase());
    return matchesPriority && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* ── Top Bar ── */}
      <div className="bg-sentinel-dark border border-sentinel-border rounded-xl p-3.5 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-wider">
              Real-Time Security &amp; AI Alert Dispatch Center
            </h1>
            <p className="text-[10px] text-sentinel-muted">
              Live automated alerts triggered by ANPR, Watchlist Matching &amp; Computer Vision pipelines
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Priority */}
          <div className="flex items-center gap-1.5 bg-sentinel-panel border border-sentinel-border rounded-lg px-2.5 py-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-sentinel-muted" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent text-xs text-sentinel-text outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-sentinel-dark text-white">All Priorities</option>
              <option value="CRITICAL" className="bg-sentinel-dark text-white">Critical</option>
              <option value="HIGH" className="bg-sentinel-dark text-white">High</option>
              <option value="MEDIUM" className="bg-sentinel-dark text-white">Medium</option>
            </select>
          </div>

          {/* Status */}
          <div className="flex items-center gap-1.5 bg-sentinel-panel border border-sentinel-border rounded-lg px-2.5 py-1 text-xs">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-sentinel-text outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-sentinel-dark text-white">All Statuses</option>
              <option value="NEW" className="bg-sentinel-dark text-white">New</option>
              <option value="ACKNOWLEDGED" className="bg-sentinel-dark text-white">Acknowledged</option>
              <option value="RESOLVED" className="bg-sentinel-dark text-white">Resolved</option>
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-3 h-3 text-sentinel-muted-dark absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search alert..."
              className="bg-sentinel-panel border border-sentinel-border rounded-lg pl-7 pr-3 py-1 text-xs text-white placeholder-sentinel-muted-dark outline-none focus:border-sentinel-accent"
            />
          </div>
        </div>
      </div>

      {/* ── Alert Cards Feed ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.alert_id}
            className={`p-4 rounded-xl border transition-all ${
              alert.priority === 'CRITICAL'
                ? 'bg-red-950/30 border-red-500/40'
                : alert.priority === 'HIGH'
                ? 'bg-orange-950/30 border-orange-500/40'
                : 'bg-sentinel-dark border-sentinel-border'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                    alert.priority === 'CRITICAL'
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                      : alert.priority === 'HIGH'
                      ? 'bg-orange-500 text-black'
                      : 'bg-yellow-500 text-black'
                  }`}
                >
                  {alert.priority}
                </span>
                <span className="text-xs font-bold text-sentinel-muted font-mono">{alert.alert_id}</span>
              </div>
              <span className="text-xs text-sentinel-gold font-mono font-bold">
                {alert.timestamp.includes('T') ? alert.timestamp.split('T')[1].substring(0, 8) : alert.timestamp}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-sentinel-accent uppercase tracking-wider block">
                  {alert.type.replace(/_/g, ' ')}
                </span>
                <h3 className="text-base font-black text-white font-mono mt-0.5">{alert.detected_entity}</h3>
              </div>
              {alert.confidence > 0 && (
                <div className="text-right">
                  <span className="text-[10px] text-sentinel-muted block">AI Confidence</span>
                  <span className="text-sm font-black text-sentinel-green">{alert.confidence.toFixed(1)}%</span>
                </div>
              )}
            </div>

            <div className="mt-2 text-xs text-sentinel-muted flex items-center gap-1">
              <Camera className="w-3.5 h-3.5 text-sentinel-muted-dark" />
              <span>{alert.camera_id} • {alert.location}, {alert.district}</span>
            </div>

            {alert.watchlist_category && (
              <div className="mt-2 text-[11px] font-bold text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20">
                🚨 Watchlist Record Match: {alert.watchlist_category.replace(/_/g, ' ')}
              </div>
            )}

            {/* Actions Bar */}
            <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/vehicles?plate=${alert.detected_entity}`)}
                  className="px-2.5 py-1.5 rounded-lg bg-sentinel-accent/20 hover:bg-sentinel-accent text-sentinel-accent hover:text-black font-extrabold text-[10px] flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Car className="w-3 h-3" /> Track Vehicle
                </button>
                <button
                  onClick={() => navigate('/incidents')}
                  className="px-2.5 py-1.5 rounded-lg bg-sentinel-panel hover:bg-sentinel-card border border-sentinel-border text-white text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <FileText className="w-3 h-3" /> Incident
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                {alert.status === 'NEW' && (
                  <button
                    onClick={() => handleAcknowledge(alert.alert_id)}
                    className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold transition-all cursor-pointer"
                  >
                    Acknowledge
                  </button>
                )}
                {alert.status !== 'RESOLVED' && (
                  <button
                    onClick={() => handleResolve(alert.alert_id)}
                    className="px-2.5 py-1.5 rounded-lg bg-sentinel-green/20 hover:bg-sentinel-green text-sentinel-green hover:text-black text-[10px] font-bold transition-all cursor-pointer"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
