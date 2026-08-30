import { useState, useEffect } from 'react';
import {
  Map as MapIcon, Layers, Search, Filter, ShieldAlert,
  Camera, Radio, ChevronRight, Check, Eye, EyeOff
} from 'lucide-react';
import { api } from '../services/api';
import { Camera as CameraType, Alert } from '../types';
import GISMap from '../components/Map/GISMap';

export default function GISIntelligence() {
  const [cameras, setCameras] = useState<CameraType[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<CameraType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  // Layer toggles
  const [layers, setLayers] = useState({
    cameras: true,
    alerts: true,
    incidents: true,
    traffic: false,
    coverage: true,
  });

  useEffect(() => {
    Promise.all([api.cameras(), api.alerts()])
      .then(([cams, alrts]) => {
        setCameras(cams);
        setAlerts(alrts);
        if (cams.length > 0) setSelectedCamera(cams[0]);
      })
      .catch(console.error);
  }, []);

  const toggleLayer = (layer: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  const departments = ['ALL', ...new Set(cameras.map((c) => c.department))];

  const filteredCameras = cameras.filter((cam) => {
    const matchesDept = selectedDept === 'ALL' || cam.department === selectedDept;
    const matchesSearch =
      cam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cam.camera_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cam.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cam.district.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* ── Top Bar ── */}
      <div className="bg-sentinel-dark border border-sentinel-border rounded-xl p-3.5 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sentinel-panel border border-sentinel-border flex items-center justify-center">
            <MapIcon className="w-4 h-4 text-sentinel-accent" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-wider">
              Statewide GIS Tactical Surveillance Map
            </h1>
            <p className="text-[10px] text-sentinel-muted">
              Spatial intelligence across Gujarat districts with real-time incident &amp; camera overlay
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Department Filter */}
          <div className="flex items-center gap-1.5 bg-sentinel-panel border border-sentinel-border rounded-lg px-2.5 py-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-sentinel-muted" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent text-xs text-sentinel-text outline-none cursor-pointer"
            >
              {departments.map((d) => (
                <option key={d} value={d} className="bg-sentinel-dark text-white">
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3 h-3 text-sentinel-muted-dark absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search camera or district..."
              className="bg-sentinel-panel border border-sentinel-border rounded-lg pl-7 pr-3 py-1 text-xs text-white placeholder-sentinel-muted-dark outline-none focus:border-sentinel-accent"
            />
          </div>
        </div>
      </div>

      {/* ── Main Map Viewport with Floating Controls & Side Inspector ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Map (8 or 9 cols) */}
        <div className="lg:col-span-9 bg-sentinel-dark border border-sentinel-border rounded-xl overflow-hidden shadow-2xl relative h-[650px]">
          {/* Layer Control Bar Floating on Map */}
          <div className="absolute top-3 left-3 z-[400] bg-sentinel-dark/90 border border-sentinel-border backdrop-blur-md rounded-xl p-2 flex flex-wrap items-center gap-1.5 shadow-xl text-xs">
            <span className="text-[10px] font-extrabold text-sentinel-muted uppercase px-1">Layers:</span>
            {(['cameras', 'alerts', 'incidents', 'coverage'] as const).map((layer) => (
              <button
                key={layer}
                onClick={() => toggleLayer(layer)}
                className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1 ${
                  layers[layer]
                    ? 'bg-sentinel-accent text-black font-extrabold'
                    : 'bg-sentinel-panel text-sentinel-muted hover:text-white'
                }`}
              >
                {layer}
              </button>
            ))}
          </div>

          <GISMap
            cameras={layers.cameras ? filteredCameras : []}
            selectedCamera={selectedCamera}
            onSelectCamera={setSelectedCamera}
            alertCameraIds={layers.alerts ? alerts.map((a) => a.camera_id) : []}
            zoom={8}
            center={[23.0225, 72.5714]}
          />
        </div>

        {/* Camera & Tactical Inspector (3 cols) */}
        <div className="lg:col-span-3 bg-sentinel-dark border border-sentinel-border rounded-xl p-4 shadow-2xl flex flex-col justify-between h-[650px] overflow-y-auto">
          {selectedCamera ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-sentinel-border pb-3">
                <span className="text-xs font-black text-sentinel-accent uppercase font-mono">
                  {selectedCamera.camera_id}
                </span>
                <span
                  className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${
                    selectedCamera.status === 'ONLINE'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}
                >
                  {selectedCamera.status}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-white">{selectedCamera.name}</h3>
                <p className="text-xs text-sentinel-muted mt-0.5">
                  {selectedCamera.location}, {selectedCamera.district}
                </p>
              </div>

              {/* Inspector Attributes Table */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 rounded bg-sentinel-panel border border-sentinel-border/50">
                  <span className="text-sentinel-muted">Department</span>
                  <span className="font-bold text-white">{selectedCamera.department}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-sentinel-panel border border-sentinel-border/50">
                  <span className="text-sentinel-muted">Vendor &amp; Model</span>
                  <span className="font-bold text-white">{selectedCamera.vendor}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-sentinel-panel border border-sentinel-border/50">
                  <span className="text-sentinel-muted">VMS Platform</span>
                  <span className="font-bold text-sentinel-accent">{selectedCamera.vms}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-sentinel-panel border border-sentinel-border/50">
                  <span className="text-sentinel-muted">Protocol</span>
                  <span className="font-mono text-white font-bold">{selectedCamera.protocol}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-sentinel-panel border border-sentinel-border/50">
                  <span className="text-sentinel-muted">Resolution</span>
                  <span className="text-white font-bold">{selectedCamera.resolution}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-sentinel-panel border border-sentinel-border/50">
                  <span className="text-sentinel-muted">AI Processing</span>
                  <span className="text-sentinel-green font-bold text-[10px] text-right">
                    {selectedCamera.ai_capabilities}
                  </span>
                </div>
                <div className="flex justify-between p-2 rounded bg-sentinel-panel border border-sentinel-border/50">
                  <span className="text-sentinel-muted">Coordinates</span>
                  <span className="text-sentinel-muted font-mono text-[10px]">
                    {selectedCamera.latitude.toFixed(4)}, {selectedCamera.longitude.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-sentinel-muted my-auto">
              <Camera className="w-10 h-10 mx-auto text-sentinel-muted-dark mb-2" />
              <p className="text-xs">Click any camera pin on the map to inspect its real-time telemetry</p>
            </div>
          )}

          <div className="pt-3 border-t border-sentinel-border text-[10px] text-sentinel-muted text-center">
            GIS Integration Layer • PostGIS / MapLibre Standards
          </div>
        </div>
      </div>
    </div>
  );
}
