import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera, ShieldAlert, Car, Zap, AlertTriangle, Radio,
  Activity, ArrowUpRight, CheckCircle2, Shield, Eye,
  Play, Video, Cpu, Server, HardDrive, Filter, Clock
} from 'lucide-react';
import { api } from '../services/api';
import { Camera as CameraType, Alert, Incident, VehicleDetection, DashboardStats } from '../types';
import GISMap from '../components/Map/GISMap';
import LiveVideoPlayer from '../components/CCTV/LiveVideoPlayer';
import { useSocket, useDemo } from '../App';

export default function CommandCenter() {
  const navigate = useNavigate();
  const socket = useSocket();
  const { startDemo, demo } = useDemo();

  const [stats, setStats] = useState<DashboardStats>({
    totalCameras: 50,
    onlineCameras: 47,
    offlineCameras: 3,
    activeAlerts: 8,
    criticalAlerts: 2,
    vehiclesToday: 12845,
    watchlistMatches: 17,
    aiEvents: 4821,
    activeIncidents: 1,
  });

  const [cameras, setCameras] = useState<CameraType[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [recentDetections, setRecentDetections] = useState<VehicleDetection[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<CameraType | null>(null);
  const [streamModalCamera, setStreamModalCamera] = useState<CameraType | null>(null);
  const [districtFilter, setDistrictFilter] = useState('ALL');

  const loadData = async () => {
    try {
      const [statsData, camerasData, alertsData, incidentsData, detectionsData] = await Promise.all([
        api.dashboardStats(),
        api.cameras(),
        api.recentAlerts(),
        api.incidents(),
        api.recentDetections(),
      ]);
      setStats(statsData);
      setCameras(camerasData);
      setAlerts(alertsData);
      setIncidents(incidentsData);
      setRecentDetections(detectionsData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Listen to WebSocket events
  useEffect(() => {
    if (!socket) return;

    socket.on('alert:new', (newAlert: Alert) => {
      setAlerts((prev) => [newAlert, ...prev]);
      setStats((prev) => ({
        ...prev,
        activeAlerts: prev.activeAlerts + 1,
        criticalAlerts: newAlert.priority === 'CRITICAL' ? prev.criticalAlerts + 1 : prev.criticalAlerts,
      }));
    });

    socket.on('detection:new', (det: VehicleDetection) => {
      setRecentDetections((prev) => [det, ...prev.slice(0, 19)]);
      setStats((prev) => ({ ...prev, vehiclesToday: prev.vehiclesToday + 1 }));
    });

    socket.on('incident:new', (inc: Incident) => {
      setIncidents((prev) => [inc, ...prev]);
      setStats((prev) => ({ ...prev, activeIncidents: prev.activeIncidents + 1 }));
    });

    return () => {
      socket.off('alert:new');
      socket.off('detection:new');
      socket.off('incident:new');
    };
  }, [socket]);

  const handleAcknowledge = async (alertId: string) => {
    try {
      await api.acknowledgeAlert(alertId);
      setAlerts((prev) =>
        prev.map((a) => (a.alert_id === alertId ? { ...a, status: 'ACKNOWLEDGED' } : a))
      );
    } catch (err) {
      console.error('Error acknowledging alert:', err);
    }
  };

  const filteredCameras = districtFilter === 'ALL'
    ? cameras
    : cameras.filter((c) => c.district.toLowerCase() === districtFilter.toLowerCase());

  const districts = ['ALL', 'Ahmedabad', 'Gandhinagar', 'Mehsana', 'Patan', 'Rajkot', 'Surat', 'Vadodara'];

  return (
    <div className="space-y-4 max-w-[1800px] mx-auto pb-10">
      {/* ── Top Priority Operational Alert Banner ── */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm animate-pulse">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded">
                CRITICAL HIT
              </span>
              <span className="text-sm font-black text-red-950 font-mono">
                TARGET VEHICLE: GJ01AB1234
              </span>
            </div>
            <p className="text-xs text-red-800 font-medium mt-0.5">
              White Hyundai Creta • Flagged Stolen (FIR #CR-2026-AHM-4521) • Cross-District Tracking Active (Ahmedabad → Mehsana → Patan)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center">
          <button
            onClick={() => navigate('/vehicles?plate=GJ01AB1234')}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span>Trace Multi-Camera Journey</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Executive Filters & Controls ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-blue-600" /> District Zone:
          </span>
          <div className="flex flex-wrap gap-1">
            {districts.map((d) => (
              <button
                key={d}
                onClick={() => setDistrictFilter(d)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  districtFilter === d
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500">
            Source: <span className="text-slate-900 font-bold">live.corp8.cloud (30 Live Streams)</span>
          </span>
          <button
            onClick={() => navigate('/cctv')}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
          >
            <Video className="w-3.5 h-3.5 text-blue-600" />
            <span>Open CCTV Wall</span>
          </button>
        </div>
      </div>

      {/* ── 8 Operational Metric KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm hover:border-blue-400 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-extrabold uppercase tracking-wider">
            <span className="truncate">Total Cameras</span>
            <Camera className="w-4 h-4 text-blue-600 flex-shrink-0" />
          </div>
          <div className="text-2xl font-black text-slate-900 my-1">{stats.totalCameras}</div>
          <div className="text-[10px] text-blue-600 font-bold">30 Live Streams</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm hover:border-emerald-400 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-extrabold uppercase tracking-wider">
            <span className="truncate">Online Status</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          </div>
          <div className="text-2xl font-black text-emerald-600 my-1">{stats.onlineCameras}</div>
          <div className="text-[10px] text-emerald-700 font-bold">94% Operational</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm hover:border-red-400 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-extrabold uppercase tracking-wider">
            <span className="truncate">Offline Nodes</span>
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          </div>
          <div className="text-2xl font-black text-red-600 my-1">{stats.offlineCameras}</div>
          <div className="text-[10px] text-red-600 font-bold">Auto-Supervised</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm hover:border-amber-400 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-extrabold uppercase tracking-wider">
            <span className="truncate">Active Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          </div>
          <div className="text-2xl font-black text-amber-600 my-1">{stats.activeAlerts}</div>
          <div className="text-[10px] text-amber-700 font-bold">Audio Dispatch</div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-red-700 text-[10px] font-black uppercase tracking-wider">
            <span className="truncate">Critical Hits</span>
            <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
          </div>
          <div className="text-2xl font-black text-red-600 my-1">{stats.criticalAlerts}</div>
          <div className="text-[10px] text-red-700 font-bold">Immediate Action</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm hover:border-indigo-400 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-extrabold uppercase tracking-wider">
            <span className="truncate">Vehicles Today</span>
            <Car className="w-4 h-4 text-indigo-600 flex-shrink-0" />
          </div>
          <div className="text-2xl font-black text-slate-900 my-1">{stats.vehiclesToday.toLocaleString()}</div>
          <div className="text-[10px] text-indigo-600 font-bold">Real-time ANPR</div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3.5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-purple-700 text-[10px] font-black uppercase tracking-wider">
            <span className="truncate">Watchlist Hits</span>
            <Shield className="w-4 h-4 text-purple-600 flex-shrink-0" />
          </div>
          <div className="text-2xl font-black text-purple-700 my-1">{stats.watchlistMatches}</div>
          <div className="text-[10px] text-purple-700 font-bold">Stolen / Wanted</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm hover:border-blue-400 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-extrabold uppercase tracking-wider">
            <span className="truncate">AI Rate</span>
            <Zap className="w-4 h-4 text-blue-600 flex-shrink-0" />
          </div>
          <div className="text-2xl font-black text-slate-900 my-1">31 FPS</div>
          <div className="text-[10px] text-blue-600 font-bold">DeepStream Ingest</div>
        </div>
      </div>

      {/* ── Main Operations Floor (3-Column Layout) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: Critical Alerts Feed (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-[520px]">
            <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span className="text-xs font-black text-slate-900 tracking-wider uppercase">Live Alert Feed</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                {alerts.length} NOTIFICATIONS
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.alert_id}
                  className={`p-3 rounded-xl border transition-all ${
                    alert.priority === 'CRITICAL'
                      ? 'bg-red-50/70 border-red-200'
                      : alert.priority === 'HIGH'
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                      alert.priority === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {alert.priority}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {alert.timestamp.includes('T') ? alert.timestamp.split('T')[1].substring(0, 8) : alert.timestamp}
                    </span>
                  </div>

                  <div className="mt-2">
                    <div className="text-xs font-black text-slate-900 flex items-center justify-between font-mono">
                      <span>{alert.detected_entity}</span>
                      <span className="text-[10px] font-bold text-blue-600">{alert.confidence.toFixed(1)}% Match</span>
                    </div>
                    <div className="text-[10px] text-slate-600 font-medium mt-0.5">
                      {alert.camera_id} • {alert.location}
                    </div>
                    {alert.watchlist_category && (
                      <div className="text-[10px] font-extrabold text-red-600 mt-1">
                        ⚠️ {alert.watchlist_category.replace(/_/g, ' ')}
                      </div>
                    )}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between gap-1">
                    <button
                      onClick={() => navigate(`/vehicles?plate=${alert.detected_entity}`)}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                    >
                      Track Route
                    </button>
                    {alert.status === 'NEW' && (
                      <button
                        onClick={() => handleAcknowledge(alert.alert_id)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold transition-all cursor-pointer"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: GIS Tactical Map (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-[520px] flex flex-col">
            <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-blue-600 animate-pulse" />
                <span className="text-xs font-black text-slate-900 tracking-wider uppercase">
                  Tactical GIS Surveillance Map • Gujarat State
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-slate-600 font-bold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Online (47)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Alert / Incident (3)
                </span>
              </div>
            </div>

            <div className="flex-1 relative">
              <GISMap
                cameras={filteredCameras}
                selectedCamera={selectedCamera}
                onSelectCamera={(cam) => {
                  setSelectedCamera(cam);
                  setStreamModalCamera(cam);
                }}
                alertCameraIds={alerts.map((a) => a.camera_id)}
                zoom={7}
                center={[23.0225, 72.5714]}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Active Incidents & Live ANPR (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Active Incidents */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-[255px] flex flex-col">
            <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <span className="text-xs font-black text-slate-900 tracking-wider uppercase flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-600" /> Active Incidents
              </span>
              <button
                onClick={() => navigate('/incidents')}
                className="text-[10px] font-bold text-blue-600 hover:underline"
              >
                View Dossiers
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
              {incidents.slice(0, 4).map((inc) => (
                <div key={inc.incident_id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-blue-700">{inc.incident_id}</span>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                      {inc.status}
                    </span>
                  </div>
                  <div className="text-xs font-extrabold text-slate-900 mt-1 leading-snug">{inc.title}</div>
                  <div className="text-[10px] text-slate-500 mt-1 font-medium">Officer: {inc.assigned_officer || 'Inspector R. Patel'}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time ANPR Detections */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-[250px] flex flex-col">
            <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <span className="text-xs font-black text-slate-900 tracking-wider uppercase flex items-center gap-1.5">
                <Car className="w-4 h-4 text-blue-600" /> Live ANPR Stream
              </span>
              <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> OCR ACTIVE
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {recentDetections.slice(0, 6).map((det) => (
                <div
                  key={det.detection_id}
                  onClick={() => navigate(`/vehicles?plate=${det.plate_normalized}`)}
                  className="p-2 rounded-lg bg-slate-50 hover:bg-blue-50/50 border border-slate-200 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-black text-slate-900 font-mono">{det.plate_number}</div>
                    <div className="text-[9px] text-slate-500 font-medium truncate max-w-[140px]">{det.location}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-extrabold text-emerald-600">{det.confidence.toFixed(0)}%</span>
                    <div className="text-[8px] text-slate-400 font-mono">
                      {det.timestamp.includes('T') ? det.timestamp.split('T')[1].substring(0, 8) : det.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Section: 4 Live CCTV Cameras Preview & AI Infrastructure ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 4 Live Camera Feeds from live.corp8.cloud */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Live Video Wall Preview (Real-time Ingestion via live.corp8.cloud)
              </span>
            </div>
            <button
              onClick={() => navigate('/cctv')}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Open Full 30-Stream Wall <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {filteredCameras.slice(0, 4).map((cam, idx) => (
              <div
                key={cam.camera_id}
                onClick={() => setStreamModalCamera(cam)}
                className="group cursor-pointer aspect-video relative rounded-xl overflow-hidden border border-slate-300 hover:border-blue-600 transition-all shadow-sm bg-black"
              >
                <LiveVideoPlayer
                  cameraId={cam.camera_id}
                  streamId={idx + 1}
                  name={cam.name}
                  location={cam.location}
                  department={cam.department}
                  vms={cam.vms}
                  className="w-full h-full"
                  showOsd={true}
                />
              </div>
            ))}
          </div>
        </div>

        {/* AI Inference & Infrastructure Gauge */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-600" /> Edge AI Cluster &amp; VMS Gateway
              </span>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                OPTIMAL
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between text-[11px] text-slate-600 font-semibold mb-1">
                  <span>AI Inference Frame Rate</span>
                  <span className="text-slate-900 font-mono font-bold">31 FPS / Stream</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-600 font-semibold mb-1">
                  <span>GPU Cluster Utilization (NVIDIA DeepStream)</span>
                  <span className="text-slate-900 font-mono font-bold">74%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '74%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-600 font-semibold mb-1">
                  <span>Heterogeneous Stream Gateway</span>
                  <span className="text-emerald-700 font-mono font-bold">30 / 30 Live Streams</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '96%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
              <div className="text-slate-500 font-bold">Protocols Ingested</div>
              <div className="text-slate-900 font-bold mt-0.5">RTSP (TCP), WebRTC, HLS</div>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
              <div className="text-slate-500 font-bold">Scalability Architecture</div>
              <div className="text-blue-700 font-bold mt-0.5">~80,000 Edge Nodes</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Camera Stream Player Modal ── */}
      {streamModalCamera && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
                <div>
                  <h3 className="text-sm font-black text-slate-900">{streamModalCamera.name}</h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {streamModalCamera.camera_id} • {streamModalCamera.location}, {streamModalCamera.district}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStreamModalCamera(null)}
                className="text-slate-400 hover:text-slate-900 text-lg font-bold px-2.5 py-1 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Video Player Display */}
            <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
              <LiveVideoPlayer
                cameraId={streamModalCamera.camera_id}
                name={streamModalCamera.name}
                location={streamModalCamera.location}
                department={streamModalCamera.department}
                vms={streamModalCamera.vms}
                protocol={streamModalCamera.protocol}
                className="w-full h-full"
              />
            </div>

            {/* Metadata Footer */}
            <div className="p-4 bg-slate-50 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-t border-slate-200">
              <div>
                <span className="text-slate-500 block text-[10px] font-bold uppercase">Department</span>
                <span className="font-bold text-slate-900">{streamModalCamera.department}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-bold uppercase">VMS Gateway</span>
                <span className="font-bold text-slate-900">{streamModalCamera.vms}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-bold uppercase">Ingestion Protocol</span>
                <span className="font-bold text-blue-600">RTSP over TCP (Monotonic PTS)</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-bold uppercase">Gateway URL</span>
                <span className="font-bold text-slate-900 font-mono text-[10px]">live.corp8.cloud</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
