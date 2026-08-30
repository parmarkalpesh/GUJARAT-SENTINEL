import {
  Server, Cpu, Database, Network, Shield, Radio,
  HardDrive, Layers, ArrowDown, ArrowRight, CheckCircle2
} from 'lucide-react';

export default function ArchitecturePage() {
  return (
    <div className="space-y-6">
      {/* ── Top Bar ── */}
      <div className="bg-sentinel-dark border border-sentinel-border rounded-xl p-4 shadow-xl flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-white uppercase tracking-wider">
            System Architecture &amp; Statewide Scalability Blueprint (~80,000 Nodes)
          </h1>
          <p className="text-xs text-sentinel-muted mt-1">
            Open, modular, vendor-neutral microservice architecture for the Gujarat Police Command Center
          </p>
        </div>
        <div className="text-[10px] font-mono font-bold text-sentinel-accent border border-sentinel-accent/30 bg-sentinel-accent/10 px-3 py-1.5 rounded-lg">
          KUBERNETES &amp; KAFKA READY
        </div>
      </div>

      {/* ── Visual Architecture Flow Diagram ── */}
      <div className="bg-sentinel-dark border border-sentinel-border rounded-xl p-6 shadow-xl">
        <h2 className="text-sm font-extrabold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
          <Layers className="w-4 h-4 text-sentinel-accent" /> High-Level Data Ingestion &amp; Intelligence Pipeline
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center text-center text-xs">
          {/* Box 1: Sources */}
          <div className="bg-sentinel-panel border border-sentinel-border p-4 rounded-xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 mx-auto flex items-center justify-center font-bold">
              1
            </div>
            <div className="font-extrabold text-white">Heterogeneous CCTV Sources</div>
            <p className="text-[10px] text-sentinel-muted">
              Analog, IP, NVRs across 26 Gujarat Government departments
            </p>
            <div className="text-[9px] font-mono text-sentinel-accent bg-sentinel-dark p-1 rounded">
              RTSP • ONVIF • VMS SDKs
            </div>
          </div>

          <div className="hidden md:flex justify-center text-sentinel-muted">
            <ArrowRight className="w-6 h-6 text-sentinel-accent" />
          </div>

          {/* Box 2: Stream Ingestion & Edge */}
          <div className="bg-sentinel-panel border border-sentinel-border p-4 rounded-xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-sentinel-green/20 text-sentinel-green mx-auto flex items-center justify-center font-bold">
              2
            </div>
            <div className="font-extrabold text-white">Edge Processing &amp; Ingestion</div>
            <p className="text-[10px] text-sentinel-muted">
              Transcoding, session control &amp; low-bandwidth metadata extraction
            </p>
            <div className="text-[9px] font-mono text-sentinel-green bg-sentinel-dark p-1 rounded">
              WebRTC • HLS • Edge AI
            </div>
          </div>

          <div className="hidden md:flex justify-center text-sentinel-muted">
            <ArrowRight className="w-6 h-6 text-sentinel-accent" />
          </div>

          {/* Box 3: AI Inference Cluster */}
          <div className="bg-sentinel-panel border border-sentinel-accent/40 p-4 rounded-xl space-y-2 shadow-lg shadow-sentinel-accent/10">
            <div className="w-8 h-8 rounded-lg bg-sentinel-accent/20 text-sentinel-accent mx-auto flex items-center justify-center font-bold">
              3
            </div>
            <div className="font-extrabold text-white">AI Vision &amp; ANPR Engine</div>
            <p className="text-[10px] text-sentinel-muted">
              YOLOv8 vehicle detection + OCR character extraction &amp; re-ID
            </p>
            <div className="text-[9px] font-mono text-sentinel-accent bg-sentinel-dark p-1 rounded">
              31 FPS • GPU Microservices
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center text-center text-xs mt-4">
          {/* Box 4: Event Bus & Correlation */}
          <div className="bg-sentinel-panel border border-sentinel-border p-4 rounded-xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-sentinel-gold/20 text-sentinel-gold mx-auto flex items-center justify-center font-bold">
              4
            </div>
            <div className="font-extrabold text-white">Pub/Sub Event Bus</div>
            <p className="text-[10px] text-sentinel-muted">
              Decoupled Kafka/RabbitMQ broker for cross-camera correlation
            </p>
            <div className="text-[9px] font-mono text-sentinel-gold bg-sentinel-dark p-1 rounded">
              Event Broker • Redis Cache
            </div>
          </div>

          <div className="hidden md:flex justify-center text-sentinel-muted">
            <ArrowRight className="w-6 h-6 text-sentinel-accent" />
          </div>

          {/* Box 5: Watchlist Correlation */}
          <div className="bg-sentinel-panel border border-sentinel-border p-4 rounded-xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 mx-auto flex items-center justify-center font-bold">
              5
            </div>
            <div className="font-extrabold text-white">Watchlist Matching Engine</div>
            <p className="text-[10px] text-sentinel-muted">
              Continuous cross-referencing with Stolen / Wanted / Blacklisted DB
            </p>
            <div className="text-[9px] font-mono text-purple-400 bg-sentinel-dark p-1 rounded">
              PostgreSQL • PostGIS
            </div>
          </div>

          <div className="hidden md:flex justify-center text-sentinel-muted">
            <ArrowRight className="w-6 h-6 text-sentinel-accent" />
          </div>

          {/* Box 6: Police Command Center */}
          <div className="bg-sentinel-panel border border-red-500/40 p-4 rounded-xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 mx-auto flex items-center justify-center font-bold">
              6
            </div>
            <div className="font-extrabold text-white">Police Command Center</div>
            <p className="text-[10px] text-sentinel-muted">
              Real-time WebSockets, GIS tactical route display &amp; incident logs
            </p>
            <div className="text-[9px] font-mono text-red-400 bg-sentinel-dark p-1 rounded">
              Leaflet • Socket.IO • React
            </div>
          </div>
        </div>
      </div>

      {/* ── Statewide Scaling Strategy (~80,000 Nodes) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-sentinel-dark border border-sentinel-border rounded-xl p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-sentinel-accent" />
            <h3 className="text-sm font-black text-white">Edge Processing Tier</h3>
          </div>
          <p className="text-sentinel-muted leading-relaxed">
            Rather than streaming 80,000 raw video feeds to the State Data Center (which would saturate network backbones),
            edge analytics modules at district junction points perform initial vehicle detection and OCR. Only lightweight
            JSON telemetry and license plate crops are transmitted upstream.
          </p>
          <div className="p-2.5 rounded bg-sentinel-panel text-[11px] text-sentinel-green font-mono">
            Bandwidth saving: 92% reduction vs centralized streaming
          </div>
        </div>

        <div className="bg-sentinel-dark border border-sentinel-border rounded-xl p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-sentinel-gold" />
            <h3 className="text-sm font-black text-white">Regional Aggregation Tier</h3>
          </div>
          <p className="text-sentinel-muted leading-relaxed">
            District command hubs (Ahmedabad, Surat, Rajkot, Vadodara, Gandhinagar) host regional streaming relays and warm
            storage buffers. Regional microservices manage localized incident dispatch and camera health telemetry.
          </p>
          <div className="p-2.5 rounded bg-sentinel-panel text-[11px] text-sentinel-gold font-mono">
            High Availability with automated failover routing
          </div>
        </div>

        <div className="bg-sentinel-dark border border-sentinel-border rounded-xl p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-black text-white">Tiered Storage Architecture</h3>
          </div>
          <p className="text-sentinel-muted leading-relaxed">
            <b>Hot Tier:</b> NVMe SSDs for 24-48h live investigation clips.
            <br />
            <b>Warm Tier:</b> Distributed Ceph/S3 for 15-30 day departmental retention.
            <br />
            <b>Cold Tier:</b> Object archival storage with metadata indexing for long-term forensic preservation.
          </p>
          <div className="p-2.5 rounded bg-sentinel-panel text-[11px] text-purple-300 font-mono">
            Cost-optimized multi-tier storage lifecycle
          </div>
        </div>
      </div>
    </div>
  );
}
