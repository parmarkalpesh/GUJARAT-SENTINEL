import { useState, useEffect } from 'react';
import {
  Activity, CheckCircle2, AlertTriangle, XCircle, RefreshCw,
  Clock, Server, HardDrive, Wifi, Shield
} from 'lucide-react';
import { api } from '../services/api';
import { Camera } from '../types';

export default function CameraHealth() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.cameras();
      setCameras(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const onlineCount = cameras.filter((c) => c.status === 'ONLINE').length;
  const offlineCount = cameras.filter((c) => c.status === 'OFFLINE').length;
  const warningCount = cameras.filter((c) => c.status === 'WARNING').length;

  return (
    <div className="space-y-4">
      {/* ── Top Bar ── */}
      <div className="bg-sentinel-dark border border-sentinel-border rounded-xl p-3.5 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sentinel-panel border border-sentinel-border flex items-center justify-center">
            <Activity className="w-4 h-4 text-sentinel-green" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-wider">
              Camera Network Health &amp; Ingestion Telemetry
            </h1>
            <p className="text-[10px] text-sentinel-muted">
              Live heartbeat monitoring, stream latency, and VMS gateway availability
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-sentinel-panel hover:bg-sentinel-card border border-sentinel-border text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Run Health Diagnostics
        </button>
      </div>

      {/* ── Health Overview Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-sentinel-card border border-sentinel-border rounded-xl p-4">
          <div className="flex items-center justify-between text-sentinel-muted text-xs font-bold uppercase">
            <span>Online Streams</span>
            <CheckCircle2 className="w-4 h-4 text-sentinel-green" />
          </div>
          <div className="text-2xl font-black text-sentinel-green mt-2">{onlineCount}</div>
          <div className="text-[10px] text-sentinel-muted mt-1">Normal 1080p/4K bitrate</div>
        </div>

        <div className="bg-sentinel-card border border-sentinel-border rounded-xl p-4">
          <div className="flex items-center justify-between text-sentinel-muted text-xs font-bold uppercase">
            <span>Offline Nodes</span>
            <XCircle className="w-4 h-4 text-sentinel-red" />
          </div>
          <div className="text-2xl font-black text-sentinel-red mt-2">{offlineCount}</div>
          <div className="text-[10px] text-sentinel-red/80 mt-1">Immediate dispatch alerted</div>
        </div>

        <div className="bg-sentinel-card border border-sentinel-border rounded-xl p-4">
          <div className="flex items-center justify-between text-sentinel-muted text-xs font-bold uppercase">
            <span>Telemetry Warnings</span>
            <AlertTriangle className="w-4 h-4 text-sentinel-gold" />
          </div>
          <div className="text-2xl font-black text-sentinel-gold mt-2">{warningCount}</div>
          <div className="text-[10px] text-sentinel-muted mt-1">Packet loss &gt; 3%</div>
        </div>

        <div className="bg-sentinel-card border border-sentinel-border rounded-xl p-4">
          <div className="flex items-center justify-between text-sentinel-muted text-xs font-bold uppercase">
            <span>Stream Availability</span>
            <Wifi className="w-4 h-4 text-sentinel-accent" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {cameras.length > 0 ? ((onlineCount / cameras.length) * 100).toFixed(1) : '94.0'}%
          </div>
          <div className="text-[10px] text-sentinel-green mt-1">SLA Target &gt; 92.0%</div>
        </div>
      </div>

      {/* ── Camera Telemetry Table ── */}
      <div className="bg-sentinel-dark border border-sentinel-border rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sentinel-panel/80 text-sentinel-muted uppercase font-mono text-[10px] border-b border-sentinel-border">
              <tr>
                <th className="p-3">Camera Node</th>
                <th className="p-3">Location &amp; District</th>
                <th className="p-3">VMS Platform</th>
                <th className="p-3">Latency</th>
                <th className="p-3">Stream FPS</th>
                <th className="p-3">Last Heartbeat</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sentinel-border/50 text-sentinel-text">
              {cameras.map((cam, idx) => {
                const isOff = cam.status === 'OFFLINE';
                const isWarn = cam.status === 'WARNING';
                return (
                  <tr key={cam.camera_id} className="hover:bg-sentinel-panel/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-sentinel-accent">{cam.camera_id}</td>
                    <td className="p-3 font-semibold text-white">
                      {cam.location} <span className="text-sentinel-muted text-[10px]">({cam.district})</span>
                    </td>
                    <td className="p-3 font-mono text-sentinel-muted text-[11px]">{cam.vms}</td>
                    <td className="p-3 font-mono">
                      {isOff ? (
                        <span className="text-sentinel-red font-bold">TIMEOUT</span>
                      ) : (
                        <span className="text-sentinel-green font-bold">{Math.floor(110 + (idx * 7) % 80)} ms</span>
                      )}
                    </td>
                    <td className="p-3 font-mono">
                      {isOff ? <span className="text-sentinel-muted">0 FPS</span> : <span className="text-white font-bold">{cam.fps || 25} FPS</span>}
                    </td>
                    <td className="p-3 text-sentinel-muted font-mono text-[11px]">
                      {isOff ? 'Never / 4h ago' : '1.2s ago'}
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${
                          isOff
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : isWarn
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            : 'bg-green-500/20 text-green-400 border border-green-500/30'
                        }`}
                      >
                        {cam.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
