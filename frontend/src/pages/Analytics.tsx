import { useState, useEffect } from 'react';
import {
  BarChart3, PieChart, TrendingUp, ShieldCheck,
  Zap, Car, Camera, AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';

export default function Analytics() {
  const [stats, setStats] = useState({
    vehiclesToday: 12845,
    watchlistMatches: 17,
    aiEvents: 4821,
    avgLatency: 180,
  });

  useEffect(() => {
    api.dashboardStats().then((data) => {
      setStats((prev) => ({ ...prev, ...data }));
    }).catch(console.error);
  }, []);

  return (
    <div className="space-y-4">
      {/* ── Top Bar ── */}
      <div className="bg-sentinel-dark border border-sentinel-border rounded-xl p-3.5 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sentinel-panel border border-sentinel-border flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-sentinel-accent" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-wider">
              AI Analytics &amp; Computer Vision Metrics
            </h1>
            <p className="text-[10px] text-sentinel-muted">
              Deep learning model throughput, detection trends &amp; optical recognition confidence distributions
            </p>
          </div>
        </div>
      </div>

      {/* ── Analytics Visualizations ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-sentinel-dark border border-sentinel-border rounded-xl p-4 shadow-xl">
          <div className="text-sentinel-muted text-xs font-bold uppercase">ANPR Precision Rate</div>
          <div className="text-2xl font-black text-sentinel-green mt-2">96.8%</div>
          <p className="text-[10px] text-sentinel-muted mt-1">High-speed highway benchmark</p>
        </div>

        <div className="bg-sentinel-dark border border-sentinel-border rounded-xl p-4 shadow-xl">
          <div className="text-sentinel-muted text-xs font-bold uppercase">Average Match Time</div>
          <div className="text-2xl font-black text-sentinel-accent mt-2">14 ms</div>
          <p className="text-[10px] text-sentinel-muted mt-1">Inverted index watchlist search</p>
        </div>

        <div className="bg-sentinel-dark border border-sentinel-border rounded-xl p-4 shadow-xl">
          <div className="text-sentinel-muted text-xs font-bold uppercase">Cross-Camera Re-ID</div>
          <div className="text-2xl font-black text-sentinel-gold mt-2">94.2%</div>
          <p className="text-[10px] text-sentinel-muted mt-1">Multi-angle visual matching</p>
        </div>

        <div className="bg-sentinel-dark border border-sentinel-border rounded-xl p-4 shadow-xl">
          <div className="text-sentinel-muted text-xs font-bold uppercase">False Positive Ratio</div>
          <div className="text-2xl font-black text-purple-400 mt-2">&lt; 0.4%</div>
          <p className="text-[10px] text-sentinel-muted mt-1">Confidence threshold &gt; 85%</p>
        </div>
      </div>

      {/* ── District Breakdown Visual Table ── */}
      <div className="bg-sentinel-dark border border-sentinel-border rounded-xl p-5 shadow-xl">
        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4">
          District-Wise ANPR Ingestion &amp; Incident Density
        </h3>
        <div className="space-y-3">
          {[
            { district: 'Ahmedabad', detections: '4,520', share: '35%', alerts: 8, color: 'bg-sentinel-accent' },
            { district: 'Gandhinagar', detections: '2,910', share: '22%', alerts: 4, color: 'bg-blue-500' },
            { district: 'Mehsana', detections: '1,840', share: '14%', alerts: 3, color: 'bg-sentinel-gold' },
            { district: 'Patan', detections: '1,210', share: '10%', alerts: 2, color: 'bg-purple-500' },
            { district: 'Rajkot', detections: '1,100', share: '9%', alerts: 1, color: 'bg-sentinel-green' },
            { district: 'Surat', detections: '980', share: '8%', alerts: 0, color: 'bg-rose-500' },
          ].map((item, idx) => (
            <div key={idx} className="space-y-1 text-xs">
              <div className="flex justify-between font-bold">
                <span className="text-white">{item.district}</span>
                <span className="text-sentinel-muted font-mono">{item.detections} scans ({item.share})</span>
              </div>
              <div className="w-full h-2 bg-sentinel-panel rounded-full overflow-hidden">
                <div className={`h-full ${item.color} rounded-full`} style={{ width: item.share }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
