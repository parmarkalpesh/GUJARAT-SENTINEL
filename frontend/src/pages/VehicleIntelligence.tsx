import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Car, Search, ShieldAlert, MapPin, Calendar, Clock,
  ArrowRight, ShieldCheck, Download, FileText, Camera,
  CheckCircle2, Play, AlertCircle, AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import { VehicleProfile, RoutePoint, VehicleDetection } from '../types';
import GISMap from '../components/Map/GISMap';

export default function VehicleIntelligence() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPlate = searchParams.get('plate') || 'GJ01AB1234';

  const [inputPlate, setInputPlate] = useState(initialPlate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<VehicleProfile | null>(null);
  const [selectedDetection, setSelectedDetection] = useState<VehicleDetection | null>(null);
  const [incidentCreated, setIncidentCreated] = useState(false);
  const [activeTab, setActiveTab] = useState<'TIMELINE' | 'RAW'>('TIMELINE');

  const fetchProfile = async (plateToSearch: string) => {
    if (!plateToSearch.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.vehicleProfile(plateToSearch.trim());
      setProfile(data);
      if (data.detections.length > 0) {
        setSelectedDetection(data.detections[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Vehicle not found in surveillance network');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialPlate) {
      setInputPlate(initialPlate);
      fetchProfile(initialPlate);
    }
  }, [initialPlate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPlate) return;
    setSearchParams({ plate: inputPlate });
    fetchProfile(inputPlate);
  };

  const handleCreateIncident = async () => {
    if (!profile) return;
    try {
      await api.createIncident({
        title: `Stolen Vehicle Investigation — ${profile.plateNumber}`,
        priority: 'CRITICAL',
        location: profile.detections[profile.detections.length - 1]?.location || 'Gujarat',
        district: profile.detections[profile.detections.length - 1]?.district || 'Gujarat',
        assigned_officer: 'Inspector R. Patel',
        description: `Automated incident generated from cross-camera tracking for target vehicle ${profile.plateNumber}. First seen at ${profile.firstSeen}, last sighted at ${profile.lastSeen} across ${profile.totalCameras} cameras.`,
        related_vehicles: profile.plateNumber,
      });
      setIncidentCreated(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadReport = async () => {
    if (!profile) return;
    try {
      const report = await api.vehicleMovementReport(profile.plateNumber);
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GJ-SENTINEL-REPORT-${profile.plateNumber}.json`;
      a.click();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Search Header ── */}
      <div className="bg-sentinel-dark border border-sentinel-border rounded-xl p-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              <Car className="w-5 h-5 text-sentinel-accent" />
              VEHICLE INTELLIGENCE &amp; CROSS-CAMERA MOVEMENT TRACKER
            </h1>
            <p className="text-xs text-sentinel-muted">
              Trace target vehicle journey across integrated CCTV cameras, VMS platforms &amp; departments
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={inputPlate}
                onChange={(e) => setInputPlate(e.target.value.toUpperCase())}
                placeholder="Enter Plate (e.g. GJ01AB1234)"
                className="w-64 bg-sentinel-panel border border-sentinel-border rounded-xl px-4 py-2 text-xs font-mono font-bold text-white placeholder-sentinel-muted-dark focus:border-sentinel-accent focus:ring-1 focus:ring-sentinel-accent/40 outline-none uppercase"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-sentinel-accent hover:bg-sentinel-accent-dim text-black font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Search className="w-3.5 h-3.5" />
              {loading ? 'Searching...' : 'Trace Vehicle'}
            </button>
          </form>
        </div>

        {/* Quick Priority Plates */}
        <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Priority Watchlist Plates:</span>
          {['GJ01AB1234', 'GJ05GH3456', 'GJ03EF9012', 'GJ06JK7890', 'GJ01MN4567'].map((plate) => (
            <button
              key={plate}
              type="button"
              onClick={() => {
                setInputPlate(plate);
                setSearchParams({ plate });
                fetchProfile(plate);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border transition-all cursor-pointer ${
                inputPlate === plate
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {plate} {plate === 'GJ01AB1234' ? '★ (STOLEN VEHICLE ALERT)' : ''}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-sentinel-red/15 border border-sentinel-red/40 text-sentinel-red text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {profile && (
        <>
          {/* ── Vehicle Profile Summary Banner ── */}
          <div className="bg-sentinel-dark border border-sentinel-border rounded-xl p-4 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
              {/* License Plate Display */}
              <div className="md:col-span-2 flex items-center gap-3 border-r border-sentinel-border/50 pr-4">
                <div className="p-3 bg-yellow-400 text-black font-mono font-black text-2xl tracking-widest rounded-lg border-2 border-black shadow-lg shadow-yellow-400/10">
                  {profile.plateNumber}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    {profile.watchlistMatch ? (
                      <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-extrabold flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" /> WATCHLIST MATCH
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-green-600 text-white text-[10px] font-extrabold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> VERIFIED REGULAR
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-white mt-1">
                    {profile.vehicleColor} {profile.vehicleType}
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:col-span-3 gap-3">
                <div className="bg-sentinel-panel p-2.5 rounded-lg border border-sentinel-border">
                  <span className="text-[10px] text-sentinel-muted font-bold block">TOTAL DETECTIONS</span>
                  <span className="text-lg font-black text-sentinel-accent">{profile.totalDetections}</span>
                </div>
                <div className="bg-sentinel-panel p-2.5 rounded-lg border border-sentinel-border">
                  <span className="text-[10px] text-sentinel-muted font-bold block">CAMERAS CROSSED</span>
                  <span className="text-lg font-black text-white">{profile.totalCameras}</span>
                </div>
                <div className="bg-sentinel-panel p-2.5 rounded-lg border border-sentinel-border">
                  <span className="text-[10px] text-sentinel-muted font-bold block">DEPARTMENTS</span>
                  <span className="text-lg font-black text-sentinel-gold">{profile.departments.length}</span>
                </div>
                <div className="bg-sentinel-panel p-2.5 rounded-lg border border-sentinel-border">
                  <span className="text-[10px] text-sentinel-muted font-bold block">JOURNEY SPAN</span>
                  <span className="text-xs font-mono font-bold text-white mt-1 block">
                    {profile.firstSeen.includes('T') ? profile.firstSeen.split('T')[1].substring(0, 5) : profile.firstSeen} →{' '}
                    {profile.lastSeen.includes('T') ? profile.lastSeen.split('T')[1].substring(0, 5) : profile.lastSeen}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex md:flex-col gap-2">
                <button
                  onClick={handleCreateIncident}
                  disabled={incidentCreated}
                  className={`w-full px-3 py-2 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    incidentCreated
                      ? 'bg-sentinel-green/20 text-sentinel-green border border-sentinel-green/40'
                      : 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white shadow-lg shadow-red-600/30'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  {incidentCreated ? 'Incident Logged' : 'Create Incident'}
                </button>

                <button
                  onClick={handleDownloadReport}
                  className="w-full px-3 py-2 rounded-lg bg-sentinel-panel hover:bg-sentinel-card border border-sentinel-border text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Movement Report
                </button>
              </div>
            </div>

            {/* Watchlist Detail Alert if Matched */}
            {profile.watchlistMatch && (
              <div className="mt-4 p-3 rounded-xl bg-red-950/40 border border-red-500/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-extrabold text-red-300">
                      CRITICAL WATCHLIST RECORD: {profile.watchlistMatch.category.replace(/_/g, ' ')}
                    </div>
                    <div className="text-[11px] text-sentinel-muted">
                      Case #{profile.watchlistMatch.case_number} • {profile.watchlistMatch.notes}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-black px-2 py-1 rounded bg-red-500 text-white">
                  PRIORITY: {profile.watchlistMatch.priority}
                </span>
              </div>
            )}
          </div>

          {/* ── Key Hackathon Demonstration: Movement History & Route Map ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* GIS Route Visualization (7 cols) */}
            <div className="lg:col-span-7 bg-sentinel-dark border border-sentinel-border rounded-xl overflow-hidden shadow-xl flex flex-col h-[560px]">
              <div className="p-3 border-b border-sentinel-border flex items-center justify-between bg-sentinel-panel/60">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-sentinel-accent" />
                  <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                    Full Traversed Route Map ({profile.route.length} Waypoints across Gujarat)
                  </span>
                </div>
                <div className="text-[10px] font-mono text-sentinel-accent font-bold">
                  Ahmedabad → Gandhinagar → Mehsana → Patan
                </div>
              </div>

              <div className="flex-1 relative">
                <GISMap
                  routePoints={profile.route}
                  zoom={8}
                  center={[profile.route[0]?.latitude || 23.0225, profile.route[0]?.longitude || 72.5714]}
                />
              </div>
            </div>

            {/* Timestamped Movement History Timeline (5 cols) */}
            <div className="lg:col-span-5 bg-sentinel-dark border border-sentinel-border rounded-xl overflow-hidden shadow-xl flex flex-col h-[560px]">
              <div className="p-3 border-b border-sentinel-border flex items-center justify-between bg-sentinel-panel/60">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sentinel-gold" />
                  <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                    Timestamped Movement History
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sentinel-accent/15 text-sentinel-accent">
                  {profile.detections.length} SIGHTINGS
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {profile.detections.map((det, idx) => {
                  const isSelected = selectedDetection?.id === det.id;
                  const timeOnly = det.timestamp.includes('T')
                    ? det.timestamp.split('T')[1].substring(0, 8)
                    : det.timestamp;

                  return (
                    <div
                      key={det.id}
                      onClick={() => setSelectedDetection(det)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-sentinel-panel border-sentinel-accent shadow-lg shadow-sentinel-accent/10'
                          : 'bg-sentinel-panel/50 border-sentinel-border hover:border-sentinel-border/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-sentinel-accent/20 text-sentinel-accent font-mono text-[10px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-extrabold text-white font-mono">{det.camera_id}</span>
                          <span className="text-[10px] text-sentinel-muted">• {det.district}</span>
                        </div>
                        <span className="text-xs font-bold text-sentinel-gold font-mono">{timeOnly}</span>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-xs font-semibold text-sentinel-text">{det.location}</div>
                        <span className="text-[10px] font-bold text-sentinel-green">
                          ANPR: {det.confidence.toFixed(1)}%
                        </span>
                      </div>

                      {det.direction && (
                        <div className="mt-1 text-[10px] text-sentinel-muted-dark">
                          Heading: <b className="text-white">{det.direction}</b> | Vehicle: {det.vehicle_color}{' '}
                          {det.vehicle_type}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
