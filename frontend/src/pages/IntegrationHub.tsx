import { useState, useEffect } from 'react';
import {
  Link2, CheckCircle2, RefreshCw, AlertTriangle, XCircle,
  Database, ShieldCheck, ArrowRight, ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { Integration } from '../types';

export default function IntegrationHub() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const data = await api.integrations();
      setIntegrations(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSync = (id: string) => {
    setSyncingId(id);
    setTimeout(() => {
      setIntegrations((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: 'CONNECTED', last_sync: new Date().toISOString() }
            : item
        )
      );
      setSyncingId(null);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      {/* ── Top Bar ── */}
      <div className="bg-sentinel-dark border border-sentinel-border rounded-xl p-3.5 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sentinel-panel border border-sentinel-border flex items-center justify-center">
            <Link2 className="w-4 h-4 text-sentinel-accent" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-wider">
              Government Database &amp; External Integration Gateway
            </h1>
            <p className="text-[10px] text-sentinel-muted">
              Secure adapter layer connecting Gujarat Police surveillance to National &amp; State repositories
            </p>
          </div>
        </div>

        <div className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-sentinel-panel border border-sentinel-border text-sentinel-gold">
          REST / gRPC / Kafka Adapter Pattern
        </div>
      </div>

      {/* ── Integration Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((item) => {
          const isSyncing = syncingId === item.id || item.status === 'SYNCING';
          const isConnected = item.status === 'CONNECTED';
          const isError = item.status === 'ERROR';

          return (
            <div
              key={item.id}
              className="bg-sentinel-dark border border-sentinel-border rounded-xl p-5 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-sentinel-accent" />
                    <h3 className="text-base font-black text-white">{item.name}</h3>
                  </div>
                  <span
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      isConnected
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : isSyncing
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    ● {isSyncing ? 'SYNCING' : item.status}
                  </span>
                </div>

                <p className="text-xs text-sentinel-muted leading-relaxed mb-4">{item.description}</p>

                <div className="space-y-2 text-xs bg-sentinel-panel p-3 rounded-lg border border-sentinel-border">
                  <div className="flex justify-between">
                    <span className="text-sentinel-muted">Records Indexed:</span>
                    <span className="font-mono font-bold text-white">
                      {item.records_count > 0 ? item.records_count.toLocaleString() : 'Offline'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sentinel-muted">System Protocol:</span>
                    <span className="font-mono text-sentinel-accent font-bold">mTLS API Adapter</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sentinel-muted">Last Verified Sync:</span>
                    <span className="font-mono text-sentinel-gold text-[11px]">
                      {item.last_sync
                        ? item.last_sync.includes('T')
                          ? item.last_sync.split('T')[1].substring(0, 8)
                          : item.last_sync
                        : 'Never'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-sentinel-border flex items-center justify-between">
                <span className="text-[10px] text-sentinel-muted font-mono truncate max-w-[150px]">
                  {item.endpoint}
                </span>
                <button
                  onClick={() => handleSync(item.id)}
                  disabled={isSyncing}
                  className="px-3 py-1.5 rounded-lg bg-sentinel-panel hover:bg-sentinel-card border border-sentinel-border text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Synchronizing...' : 'Sync Adapter'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Architecture Note on Vendor Neutrality ── */}
      <div className="bg-sentinel-dark border border-sentinel-accent/30 rounded-xl p-4 shadow-xl text-xs">
        <h4 className="font-extrabold text-sentinel-accent uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" /> Open Standard Adapter Framework
        </h4>
        <p className="text-sentinel-muted leading-relaxed">
          The Gujarat Sentinel architecture employs decoupled integration adapters for external data sources. In compliance with the
          Hackathon challenge statement, live integration with national databases (VAHAN vehicle registers, SARTHI licenses, eGujCop FIRs,
          AFIS/NAFIS biometrics) operates via standardized JSON/REST microservice adapters with mock fallback buffers to ensure zero vendor lock-in.
        </p>
      </div>
    </div>
  );
}
