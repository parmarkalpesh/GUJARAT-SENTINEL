import { useState, useEffect } from 'react';
import {
  Monitor, Grid2X2, Grid3X3, LayoutGrid, Maximize2,
  Video, Filter, Search, Shield, Zap, Circle
} from 'lucide-react';
import { api } from '../services/api';
import { Camera } from '../types';
import LiveVideoPlayer from '../components/CCTV/LiveVideoPlayer';

export default function LiveCCTV() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [layout, setLayout] = useState<'2x2' | '3x3' | '4x4' | '6x6'>('3x3');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [search, setSearch] = useState('');
  const [activeModalCam, setActiveModalCam] = useState<Camera | null>(null);

  useEffect(() => {
    api.cameras().then(setCameras).catch(console.error);
  }, []);

  const departments = ['ALL', ...new Set(cameras.map((c) => c.department))];

  const filteredCameras = cameras.filter((cam) => {
    const matchesDept = selectedDept === 'ALL' || cam.department === selectedDept;
    const matchesSearch =
      cam.name.toLowerCase().includes(search.toLowerCase()) ||
      cam.camera_id.toLowerCase().includes(search.toLowerCase()) ||
      cam.location.toLowerCase().includes(search.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const getLimit = () => {
    if (layout === '2x2') return 4;
    if (layout === '3x3') return 9;
    if (layout === '4x4') return 16;
    return 36;
  };

  const displayedCameras = filteredCameras.slice(0, getLimit());

  const getGridClass = () => {
    if (layout === '2x2') return 'grid-cols-1 sm:grid-cols-2';
    if (layout === '3x3') return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
    if (layout === '4x4') return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4';
    return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-6';
  };

  return (
    <div className="space-y-4">
      {/* ── Wall Controls Header ── */}
      <div className="bg-sentinel-dark border border-sentinel-border rounded-xl p-3.5 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sentinel-panel border border-sentinel-border flex items-center justify-center">
            <Monitor className="w-4 h-4 text-sentinel-accent" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-wider">
              Statewide CCTV Wall Ingestion Matrix
            </h1>
            <p className="text-[10px] text-sentinel-muted">
              Continuous multi-vendor feed relay (RTSP / ONVIF / VMS SDK Adapters)
            </p>
          </div>
        </div>

        {/* Filters & Layout Switcher */}
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

          {/* Search */}
          <div className="relative">
            <Search className="w-3 h-3 text-sentinel-muted-dark absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter camera..."
              className="bg-sentinel-panel border border-sentinel-border rounded-lg pl-7 pr-3 py-1 text-xs text-white placeholder-sentinel-muted-dark outline-none focus:border-sentinel-accent"
            />
          </div>

          {/* Layout buttons */}
          <div className="flex items-center bg-sentinel-panel border border-sentinel-border rounded-lg p-0.5">
            <button
              onClick={() => setLayout('2x2')}
              className={`px-2 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                layout === '2x2' ? 'bg-sentinel-accent text-black' : 'text-sentinel-muted hover:text-white'
              }`}
              title="2x2 (4 Cameras)"
            >
              2×2
            </button>
            <button
              onClick={() => setLayout('3x3')}
              className={`px-2 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                layout === '3x3' ? 'bg-sentinel-accent text-black' : 'text-sentinel-muted hover:text-white'
              }`}
              title="3x3 (9 Cameras)"
            >
              3×3
            </button>
            <button
              onClick={() => setLayout('4x4')}
              className={`px-2 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                layout === '4x4' ? 'bg-sentinel-accent text-black' : 'text-sentinel-muted hover:text-white'
              }`}
              title="4x4 (16 Cameras)"
            >
              4×4
            </button>
            <button
              onClick={() => setLayout('6x6')}
              className={`px-2 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                layout === '6x6' ? 'bg-sentinel-accent text-black' : 'text-sentinel-muted hover:text-white'
              }`}
              title="6x6 (36 Cameras)"
            >
              6×6
            </button>
          </div>
        </div>
      </div>

      {/* ── CCTV Grid Wall ── */}
      <div className={`grid ${getGridClass()} gap-3`}>
        {displayedCameras.map((cam, idx) => (
          <div
            key={cam.camera_id}
            onClick={() => setActiveModalCam(cam)}
            className="cctv-tile group cursor-pointer aspect-video relative flex flex-col justify-between p-2.5 border border-sentinel-border hover:border-sentinel-accent transition-all shadow-lg"
          >
            {/* Top Bar on Tile */}
            <div className="flex items-center justify-between z-10">
              <span className="text-[10px] font-extrabold text-sentinel-accent bg-black/70 px-1.5 py-0.5 rounded font-mono">
                {cam.camera_id}
              </span>
              <div className="flex items-center gap-1">
                <span className="live-badge">● LIVE</span>
              </div>
            </div>

            {/* Middle Simulated Feed Artwork */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90 flex items-center justify-center">
              <div className="text-center opacity-35 group-hover:opacity-75 transition-opacity">
                <Video className="w-8 h-8 text-sentinel-accent mx-auto mb-1 animate-pulse" />
                <div className="text-[9px] font-mono text-white tracking-wider">{cam.vms}</div>
                <div className="text-[8px] text-sentinel-muted font-mono">{cam.protocol} • {cam.resolution}</div>
              </div>

              {/* Bounding box on some feeds */}
              {idx % 3 === 0 && (
                <div className="absolute border border-sentinel-green/70 rounded px-1 py-0.5 top-1/4 right-1/4 bg-sentinel-green/10">
                  <span className="text-[7px] font-bold text-sentinel-green block">AI: ANPR ACTIVE</span>
                  <span className="text-[8px] font-bold text-white font-mono">GJ01AB1234</span>
                </div>
              )}
            </div>

            {/* Bottom Tile Info */}
            <div className="z-10 bg-black/80 p-1.5 rounded border border-white/10 backdrop-blur-sm">
              <div className="text-xs font-bold text-white truncate">{cam.location}</div>
              <div className="flex items-center justify-between text-[9px] text-sentinel-muted mt-0.5">
                <span className="truncate">{cam.department}</span>
                <span className="text-sentinel-green font-semibold shrink-0">REC ON</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Stream Player Modal ── */}
      {activeModalCam && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-sentinel-dark border border-sentinel-border rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-sentinel-border flex items-center justify-between bg-sentinel-panel">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-sentinel-red animate-pulse" />
                <div>
                  <h3 className="text-sm font-extrabold text-white">{activeModalCam.name}</h3>
                  <p className="text-[10px] text-sentinel-muted">
                    {activeModalCam.camera_id} • {activeModalCam.location}, {activeModalCam.district}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModalCam(null)}
                className="text-sentinel-muted hover:text-white text-lg font-bold px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
              <LiveVideoPlayer
                cameraId={activeModalCam.camera_id}
                name={activeModalCam.name}
                location={activeModalCam.location}
                department={activeModalCam.department}
                vms={activeModalCam.vms}
                protocol={activeModalCam.protocol}
                className="w-full h-full"
              />
            </div>

            <div className="p-4 bg-sentinel-panel grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-sentinel-muted block text-[10px]">Department</span>
                <span className="font-bold text-white">{activeModalCam.department}</span>
              </div>
              <div>
                <span className="text-sentinel-muted block text-[10px]">Vendor &amp; Model</span>
                <span className="font-bold text-white">{activeModalCam.vendor} • {activeModalCam.model}</span>
              </div>
              <div>
                <span className="text-sentinel-muted block text-[10px]">Retention Period</span>
                <span className="font-bold text-white">{activeModalCam.resolution || '15'} Days</span>
              </div>
              <div>
                <span className="text-sentinel-muted block text-[10px]">AI Pipeline</span>
                <span className="font-bold text-sentinel-accent">{activeModalCam.ai_capabilities}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
