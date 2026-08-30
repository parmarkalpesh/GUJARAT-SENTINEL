import { useState, useEffect } from 'react';
import {
  FileText, Plus, Search, Filter, ShieldAlert, CheckCircle,
  Clock, User, MapPin, AlertTriangle, ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { Incident } from '../types';

export default function IncidentManagement() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    priority: 'CRITICAL',
    location: 'Ahmedabad',
    district: 'Ahmedabad',
    assigned_officer: 'Inspector R. Patel',
    description: '',
    related_vehicles: 'GJ01AB1234',
  });

  const loadIncidents = async () => {
    try {
      const data = await api.incidents();
      setIncidents(data);
      if (data.length > 0 && !selectedIncident) {
        setSelectedIncident(data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createIncident(formData);
      setIsModalOpen(false);
      loadIncidents();
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.updateIncident(id, { status });
      loadIncidents();
      if (selectedIncident?.incident_id === id) {
        setSelectedIncident((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Top Bar ── */}
      <div className="bg-sentinel-dark border border-sentinel-border rounded-xl p-3.5 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sentinel-panel border border-sentinel-border flex items-center justify-center">
            <FileText className="w-4 h-4 text-sentinel-accent" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-wider">
              Police Incident &amp; Investigation Dossier
            </h1>
            <p className="text-[10px] text-sentinel-muted">
              Formal case escalation, evidence chain of custody &amp; cross-department investigation
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-1.5 rounded-lg bg-sentinel-accent hover:bg-sentinel-accent-dim text-black font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Log New Incident
        </button>
      </div>

      {/* ── Incident Master-Detail View ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Incident List (5 cols) */}
        <div className="lg:col-span-5 bg-sentinel-dark border border-sentinel-border rounded-xl overflow-hidden shadow-xl flex flex-col h-[620px]">
          <div className="p-3 border-b border-sentinel-border bg-sentinel-panel/60 flex items-center justify-between text-xs">
            <span className="font-extrabold text-white uppercase">Incidents ({incidents.length})</span>
            <span className="text-[10px] text-sentinel-muted font-medium">Select to view investigation log</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {incidents.map((inc) => {
              const isSelected = selectedIncident?.incident_id === inc.incident_id;
              return (
                <div
                  key={inc.incident_id}
                  onClick={() => setSelectedIncident(inc)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sentinel-panel border-sentinel-accent shadow-lg shadow-sentinel-accent/10'
                      : 'bg-sentinel-panel/50 border-sentinel-border hover:border-sentinel-border/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sentinel-accent text-xs">{inc.incident_id}</span>
                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${
                        inc.priority === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-orange-500/20 text-orange-400'
                      }`}
                    >
                      {inc.priority}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white mt-1.5 line-clamp-1">{inc.title}</h4>
                  <div className="text-[10px] text-sentinel-muted mt-1 flex items-center justify-between">
                    <span>Officer: {inc.assigned_officer}</span>
                    <span className="text-sentinel-gold font-semibold uppercase">{inc.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Incident Detail (7 cols) */}
        <div className="lg:col-span-7 bg-sentinel-dark border border-sentinel-border rounded-xl p-5 shadow-xl flex flex-col h-[620px] overflow-y-auto">
          {selectedIncident ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sentinel-border pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-sentinel-accent font-mono">
                      {selectedIncident.incident_id}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                      {selectedIncident.priority}
                    </span>
                  </div>
                  <h2 className="text-base font-black text-white mt-1">{selectedIncident.title}</h2>
                </div>

                {/* Status Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-sentinel-muted font-bold">Status:</span>
                  <select
                    value={selectedIncident.status}
                    onChange={(e) => updateStatus(selectedIncident.incident_id, e.target.value)}
                    className="bg-sentinel-panel border border-sentinel-border rounded-lg px-2.5 py-1 text-xs text-sentinel-accent font-bold outline-none cursor-pointer"
                  >
                    <option value="OPEN">Open</option>
                    <option value="INVESTIGATING">Investigating</option>
                    <option value="ESCALATED">Escalated</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              </div>

              {/* Attributes */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 bg-sentinel-panel rounded-lg border border-sentinel-border">
                  <span className="text-[10px] text-sentinel-muted block font-bold">Location</span>
                  <span className="text-white font-semibold">{selectedIncident.location}, {selectedIncident.district}</span>
                </div>
                <div className="p-2.5 bg-sentinel-panel rounded-lg border border-sentinel-border">
                  <span className="text-[10px] text-sentinel-muted block font-bold">Lead Investigator</span>
                  <span className="text-white font-semibold">{selectedIncident.assigned_officer}</span>
                </div>
                <div className="p-2.5 bg-sentinel-panel rounded-lg border border-sentinel-border">
                  <span className="text-[10px] text-sentinel-muted block font-bold">Related Entity</span>
                  <span className="text-sentinel-accent font-mono font-bold">{selectedIncident.related_vehicles || 'N/A'}</span>
                </div>
              </div>

              {/* Case Brief */}
              <div>
                <h4 className="text-xs font-bold text-sentinel-muted uppercase mb-1.5">Investigation Brief &amp; Notes</h4>
                <div className="p-3.5 rounded-xl bg-sentinel-panel border border-sentinel-border text-xs text-sentinel-text leading-relaxed">
                  {selectedIncident.description}
                </div>
              </div>

              {/* Timeline of CCTV Evidence */}
              <div>
                <h4 className="text-xs font-bold text-sentinel-muted uppercase mb-2">Evidence &amp; Sightings Timeline</h4>
                <div className="space-y-2">
                  {[
                    { time: '10:05:22', text: 'Vehicle first sighted on CAM-001 (SG Highway Junction, Ahmedabad)' },
                    { time: '10:05:24', text: 'ANPR completed. Watchlist match verified: STOLEN VEHICLE' },
                    { time: '10:08:00', text: 'Alert acknowledged by Command Room Operator 1' },
                    { time: '10:16:41', text: 'Vehicle detected on CAM-007 (Ashram Road, Ahmedabad)' },
                    { time: '10:38:17', text: 'Cross-district transition: Detected on CAM-015 (Mehsana)' },
                    { time: '11:04:53', text: 'Detected on CAM-022 (Patan Highway Junction)' },
                  ].map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs p-2 rounded-lg bg-sentinel-panel/60 border border-sentinel-border/50">
                      <span className="font-mono text-[11px] text-sentinel-gold font-bold shrink-0">{step.time}</span>
                      <span className="text-sentinel-text">{step.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-sentinel-muted my-auto">
              Select an incident from the left to view evidence
            </div>
          )}
        </div>
      </div>

      {/* ── Log Incident Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-sentinel-dark border border-sentinel-border rounded-2xl w-full max-w-lg p-5 shadow-2xl">
            <h3 className="text-base font-black text-white mb-4">Open New Police Incident</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-sentinel-muted font-bold block mb-1">Incident Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stolen Vehicle Tracked Across Districts"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-sentinel-panel border border-sentinel-border rounded-lg p-2 text-white outline-none focus:border-sentinel-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
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
                <div>
                  <label className="text-sentinel-muted font-bold block mb-1">Assigned Officer</label>
                  <input
                    type="text"
                    value={formData.assigned_officer}
                    onChange={(e) => setFormData({ ...formData, assigned_officer: e.target.value })}
                    className="w-full bg-sentinel-panel border border-sentinel-border rounded-lg p-2 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-sentinel-muted font-bold block mb-1">Related Vehicle Plate Number</label>
                <input
                  type="text"
                  value={formData.related_vehicles}
                  onChange={(e) => setFormData({ ...formData, related_vehicles: e.target.value.toUpperCase() })}
                  className="w-full bg-sentinel-panel border border-sentinel-border rounded-lg p-2 text-white font-mono uppercase outline-none focus:border-sentinel-accent"
                />
              </div>

              <div>
                <label className="text-sentinel-muted font-bold block mb-1">Incident Summary &amp; Directives</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide investigation details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  Create Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
