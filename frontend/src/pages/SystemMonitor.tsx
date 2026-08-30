import { useState, useEffect } from 'react';
import {
  Cpu, Server, HardDrive, Activity, Wifi,
  Zap, Clock, Radio, Shield, AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import { SystemMetrics } from '../types';

export default function SystemMonitor() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu_usage: 41,
    memory_usage: 62,
    gpu_usage: 74,
    storage_usage: 58,
    active_streams: 47,
    ai_inference_fps: 31,
    queue_length: 12,
    alert_latency_ms: 180,
    timestamp: new Date().toISOString(),
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await api.systemMetrics();
        setMetrics(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      {/* ── Top Bar ── */}
      <div className="bg-sentinel-dark border border-sentinel-border rounded-xl p-3.5 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sentinel-panel border border-sentinel-border flex items-center justify-center">
            <Cpu className="w-4 h-4 text-sentinel-accent" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-wider">
              Infrastructure &amp; GPU AI Inference Cluster Monitor
            </h1>
            <p className="text-[10px] text-sentinel-muted">
              Hardware utilization, video ingestion pipelines &amp; queue latency telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sentinel-green animate-pulse" />
          <span className="text-[10px] font-bold text-sentinel-green uppercase tracking-wider">
            Distributed Cluster Healthy
          </span>
        </div>
      </div>

      {/* ── 4 Primary Hardware Gauges ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-sentinel-card border border-sentinel-border rounded-xl p-4">
          <div className="flex items-center justify-between text-sentinel-muted text-xs font-bold uppercase">
            <span>CPU Cluster</span>
            <Cpu className="w-4 h-4 text-sentinel-accent" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{metrics.cpu_usage.toFixed(0)}%</div>
          <div className="w-full h-2 bg-sentinel-panel rounded-full overflow-hidden mt-2">
            <div className="h-full bg-sentinel-accent rounded-full transition-all duration-500" style={{ width: `${metrics.cpu_usage}%` }} />
          </div>
          <div className="text-[10px] text-sentinel-muted mt-1.5">32 Cores • Xeon Gold</div>
        </div>

        <div className="bg-sentinel-card border border-sentinel-border rounded-xl p-4">
          <div className="flex items-center justify-between text-sentinel-muted text-xs font-bold uppercase">
            <span>Memory (RAM)</span>
            <Server className="w-4 h-4 text-sentinel-gold" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{metrics.memory_usage.toFixed(0)}%</div>
          <div className="w-full h-2 bg-sentinel-panel rounded-full overflow-hidden mt-2">
            <div className="h-full bg-sentinel-gold rounded-full transition-all duration-500" style={{ width: `${metrics.memory_usage}%` }} />
          </div>
          <div className="text-[10px] text-sentinel-muted mt-1.5">128 GB ECC Registered</div>
        </div>

        <div className="bg-sentinel-card border border-sentinel-border rounded-xl p-4">
          <div className="flex items-center justify-between text-sentinel-muted text-xs font-bold uppercase">
            <span>GPU Inference Array</span>
            <Zap className="w-4 h-4 text-sentinel-green" />
          </div>
          <div className="text-2xl font-black text-sentinel-green mt-2">{metrics.gpu_usage.toFixed(0)}%</div>
          <div className="w-full h-2 bg-sentinel-panel rounded-full overflow-hidden mt-2">
            <div className="h-full bg-sentinel-green rounded-full transition-all duration-500" style={{ width: `${metrics.gpu_usage}%` }} />
          </div>
          <div className="text-[10px] text-sentinel-muted mt-1.5">4x NVIDIA A100 TensorCore</div>
        </div>

        <div className="bg-sentinel-card border border-sentinel-border rounded-xl p-4">
          <div className="flex items-center justify-between text-sentinel-muted text-xs font-bold uppercase">
            <span>Tiered NVMe Storage</span>
            <HardDrive className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{metrics.storage_usage.toFixed(0)}%</div>
          <div className="w-full h-2 bg-sentinel-panel rounded-full overflow-hidden mt-2">
            <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${metrics.storage_usage}%` }} />
          </div>
          <div className="text-[10px] text-sentinel-muted mt-1.5">Hot Buffer: 24 TB NVMe Array</div>
        </div>
      </div>

      {/* ── Streaming & AI Throughput ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-sentinel-dark border border-sentinel-border rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-sentinel-muted font-bold uppercase">
            <span>Active CCTV Ingestion Streams</span>
            <Radio className="w-4 h-4 text-sentinel-green" />
          </div>
          <div className="text-xl font-black text-white mt-2">{metrics.active_streams} / 50 Channels</div>
          <p className="text-[10px] text-sentinel-muted mt-1">Multi-Vendor RTSP &amp; VMS Session Relays</p>
        </div>

        <div className="bg-sentinel-dark border border-sentinel-border rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-sentinel-muted font-bold uppercase">
            <span>Real-Time AI Inference Speed</span>
            <Activity className="w-4 h-4 text-sentinel-accent" />
          </div>
          <div className="text-xl font-black text-sentinel-accent mt-2">{metrics.ai_inference_fps.toFixed(1)} FPS</div>
          <p className="text-[10px] text-sentinel-muted mt-1">YOLOv8 + OCR License Plate Detection</p>
        </div>

        <div className="bg-sentinel-dark border border-sentinel-border rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-sentinel-muted font-bold uppercase">
            <span>Alert Processing Latency</span>
            <Clock className="w-4 h-4 text-sentinel-gold" />
          </div>
          <div className="text-xl font-black text-sentinel-gold mt-2">{metrics.alert_latency_ms} ms</div>
          <p className="text-[10px] text-sentinel-muted mt-1">End-to-end frame to control-room toast</p>
        </div>
      </div>
    </div>
  );
}
