import { useState, useEffect } from 'react';
import {
  Clock, ShieldAlert, Car, Zap, CheckCircle2,
  AlertTriangle, Filter, Search, Shield
} from 'lucide-react';
import { api } from '../services/api';
import { SystemEvent } from '../types';

export default function EventTimeline() {
  const [events, setEvents] = useState<SystemEvent[]>([]);

  useEffect(() => {
    api.events().then(setEvents).catch(console.error);
  }, []);

  return (
    <div className="space-y-4">
      {/* ── Top Bar ── */}
      <div className="bg-sentinel-dark border border-sentinel-border rounded-xl p-3.5 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sentinel-panel border border-sentinel-border flex items-center justify-center">
            <Clock className="w-4 h-4 text-sentinel-gold" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-wider">
              Unified Surveillance Event Chronicle &amp; Correlation Timeline
            </h1>
            <p className="text-[10px] text-sentinel-muted">
              Chronological log of raw detections, automated AI matches, alerts &amp; officer responses
            </p>
          </div>
        </div>
      </div>

      {/* ── Timeline Sequence ── */}
      <div className="bg-sentinel-dark border border-sentinel-border rounded-xl p-6 shadow-xl max-w-4xl mx-auto">
        <div className="relative border-l-2 border-sentinel-border/70 ml-4 space-y-6">
          {events.map((evt, idx) => (
            <div key={evt.id || idx} className="relative pl-6">
              {/* Dot */}
              <div
                className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                  evt.event_type.includes('ALERT') || evt.event_type.includes('MATCH')
                    ? 'bg-red-500 shadow-lg shadow-red-500/50'
                    : 'bg-sentinel-accent shadow-lg shadow-sentinel-accent/50'
                }`}
              />

              <div className="bg-sentinel-panel border border-sentinel-border rounded-xl p-4 shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase ${
                      evt.event_type.includes('ALERT')
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-sentinel-accent/20 text-sentinel-accent'
                    }`}
                  >
                    {evt.event_type.replace(/_/g, ' ')}
                  </span>
                  <span className="font-mono text-xs text-sentinel-gold font-bold">
                    {evt.timestamp.includes('T') ? evt.timestamp.replace('T', ' ').substring(0, 19) : evt.timestamp}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mt-2">{evt.description}</h3>
                <div className="text-[10px] text-sentinel-muted mt-1 flex items-center gap-2">
                  <span>Source: <b>{evt.source}</b></span>
                  <span>•</span>
                  <span>ID: <b className="font-mono text-sentinel-accent">{evt.source_id}</b></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
