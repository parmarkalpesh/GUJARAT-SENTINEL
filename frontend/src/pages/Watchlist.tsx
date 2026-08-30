import { useState, useEffect } from 'react';
import {
  Shield, Plus, Search, Filter, Trash2, Edit2, AlertTriangle,
  CheckCircle, XCircle, Car, UserCheck, ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';
import { WatchlistEntry } from '../types';

export default function Watchlist() {
  const [entries, setEntries] = useState<WatchlistEntry[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WatchlistEntry | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    category: 'STOLEN_VEHICLE',
    entity_type: 'VEHICLE',
    vehicle_number: '',
    vehicle_type: 'Sedan',
    vehicle_color: 'White',
    case_number: '',
    priority: 'CRITICAL',
    department: 'Gujarat Police',
    notes: '',
  });

  const loadEntries = async () => {
    try {
      const data = await api.watchlist();
      setEntries(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEntry) {
        await api.updateWatchlist(editingEntry.watchlist_id, formData);
      } else {
        await api.createWatchlist(formData);
      }
      setIsModalOpen(false);
      setEditingEntry(null);
      loadEntries();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (wid: string) => {
    if (confirm(`Remove entry ${wid} from watchlist?`)) {
      await api.deleteWatchlist(wid);
      loadEntries();
    }
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesCat = categoryFilter === 'ALL' || entry.category === categoryFilter;
    const matchesSearch =
      (entry.vehicle_number && entry.vehicle_number.toLowerCase().includes(search.toLowerCase())) ||
      (entry.case_number && entry.case_number.toLowerCase().includes(search.toLowerCase())) ||
      (entry.notes && entry.notes.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* ── Top Bar ── */}
      <div className="bg-sentinel-dark border border-sentinel-border rounded-xl p-3.5 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sentinel-panel border border-sentinel-border flex items-center justify-center">
            <Shield className="w-4 h-4 text-sentinel-accent" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-wider">
              Watchlist Correlation &amp; Blacklist Database
            </h1>
            <p className="text-[10px] text-sentinel-muted">
              Live matching against ANPR detections with automated priority alerting
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-sentinel-panel border border-sentinel-border rounded-lg px-2.5 py-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-sentinel-muted" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-xs text-sentinel-text outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-sentinel-dark text-white">All Categories</option>
              <option value="STOLEN_VEHICLE" className="bg-sentinel-dark text-white">Stolen Vehicle</option>
              <option value="BLACKLISTED_VEHICLE" className="bg-sentinel-dark text-white">Blacklisted</option>
              <option value="WANTED_PERSON" className="bg-sentinel-dark text-white">Wanted Person</option>
              <option value="SUSPECT" className="bg-sentinel-dark text-white">Suspect</option>
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-3 h-3 text-sentinel-muted-dark absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search plate or case..."
              className="bg-sentinel-panel border border-sentinel-border rounded-lg pl-7 pr-3 py-1 text-xs text-white placeholder-sentinel-muted-dark outline-none focus:border-sentinel-accent"
            />
          </div>

          <button
            onClick={() => {
              setEditingEntry(null);
              setFormData({
                category: 'STOLEN_VEHICLE',
                entity_type: 'VEHICLE',
                vehicle_number: '',
                vehicle_type: 'Sedan',
                vehicle_color: 'White',
                case_number: '',
                priority: 'CRITICAL',
                department: 'Gujarat Police',
                notes: '',
              });
              setIsModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-lg bg-sentinel-accent hover:bg-sentinel-accent-dim text-black font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add To Watchlist
          </button>
        </div>
      </div>

      {/* ── Watchlist Table ── */}
      <div className="bg-sentinel-dark border border-sentinel-border rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sentinel-panel/80 text-sentinel-muted uppercase font-mono text-[10px] border-b border-sentinel-border">
              <tr>
                <th className="p-3">Watchlist ID</th>
                <th className="p-3">Target Entity</th>
                <th className="p-3">Category</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Case Reference</th>
                <th className="p-3">Department</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sentinel-border/50 text-sentinel-text">
              {filteredEntries.map((item) => (
                <tr key={item.id} className="hover:bg-sentinel-panel/40 transition-colors">
                  <td className="p-3 font-mono font-bold text-sentinel-accent">{item.watchlist_id}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded bg-yellow-400 text-black font-mono font-black text-xs">
                        {item.vehicle_number || item.person_name}
                      </span>
                      <span className="text-[10px] text-sentinel-muted">
                        {item.vehicle_color} {item.vehicle_type}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 font-bold text-white">
                    <span className="px-2 py-0.5 rounded bg-sentinel-panel border border-sentinel-border text-[10px]">
                      {item.category.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${
                        item.priority === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : item.priority === 'HIGH'
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-sentinel-muted">{item.case_number || 'N/A'}</td>
                  <td className="p-3 text-sentinel-muted">{item.department}</td>
                  <td className="p-3">
                    <span className="flex items-center gap-1 text-sentinel-green text-[11px] font-bold">
                      <CheckCircle className="w-3 h-3" /> ACTIVE
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDelete(item.watchlist_id)}
                      className="p-1 text-sentinel-muted hover:text-sentinel-red transition-colors cursor-pointer"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add/Edit Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-sentinel-dark border border-sentinel-border rounded-2xl w-full max-w-lg p-5 shadow-2xl">
            <h3 className="text-base font-black text-white mb-4">Add Entity To Active Watchlist</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-sentinel-muted font-bold block mb-1">Target License Plate</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GJ01AB1234"
                  value={formData.vehicle_number}
                  onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value.toUpperCase() })}
                  className="w-full bg-sentinel-panel border border-sentinel-border rounded-lg p-2 text-white font-mono uppercase outline-none focus:border-sentinel-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sentinel-muted font-bold block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-sentinel-panel border border-sentinel-border rounded-lg p-2 text-white outline-none"
                  >
                    <option value="STOLEN_VEHICLE">Stolen Vehicle</option>
                    <option value="BLACKLISTED_VEHICLE">Blacklisted Vehicle</option>
                    <option value="SUSPECT">Suspect Vehicle</option>
                    <option value="WANTED_PERSON">Wanted Person</option>
                  </select>
                </div>
                <div>
                  <label className="text-sentinel-muted font-bold block mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full bg-sentinel-panel border border-sentinel-border rounded-lg p-2 text-white outline-none"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sentinel-muted font-bold block mb-1">FIR / Case Reference Number</label>
                <input
                  type="text"
                  placeholder="e.g. CR-2026-AHM-4521"
                  value={formData.case_number}
                  onChange={(e) => setFormData({ ...formData, case_number: e.target.value })}
                  className="w-full bg-sentinel-panel border border-sentinel-border rounded-lg p-2 text-white outline-none"
                />
              </div>

              <div>
                <label className="text-sentinel-muted font-bold block mb-1">Investigative Notes</label>
                <textarea
                  rows={2}
                  placeholder="Details of the incident, suspect descriptions, location stolen..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-sentinel-panel border border-sentinel-border rounded-lg p-2 text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-sentinel-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-sentinel-panel hover:bg-sentinel-card text-sentinel-muted font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sentinel-accent hover:bg-sentinel-accent-dim text-black font-extrabold cursor-pointer"
                >
                  Save Watchlist Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
