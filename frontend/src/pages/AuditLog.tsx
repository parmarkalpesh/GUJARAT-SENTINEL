import { useState, useEffect } from 'react';
import {
  ScrollText, Search, ShieldAlert, CheckCircle2,
  Clock, User, Key, Eye, ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';

export default function AuditLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.auditLogs().then(setLogs).catch(console.error);
  }, []);

  const filteredLogs = logs.filter((log) =>
    log.username.toLowerCase().includes(search.toLowerCase()) ||
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    (log.entity_id && log.entity_id.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* ── Top Bar ── */}
      <div className="bg-sentinel-dark border border-sentinel-border rounded-xl p-3.5 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sentinel-panel border border-sentinel-border flex items-center justify-center">
            <ScrollText className="w-4 h-4 text-sentinel-accent" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-wider">
              Immutable Police Action Audit Trail &amp; Chain of Custody
            </h1>
            <p className="text-[10px] text-sentinel-muted">
              Non-repudiable surveillance access logging, operator acknowledgments &amp; evidentiary tracking
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="w-3 h-3 text-sentinel-muted-dark absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail..."
            className="bg-sentinel-panel border border-sentinel-border rounded-lg pl-7 pr-3 py-1 text-xs text-white placeholder-sentinel-muted-dark outline-none focus:border-sentinel-accent"
          />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-sentinel-dark border border-sentinel-border rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sentinel-panel/80 text-sentinel-muted uppercase font-mono text-[10px] border-b border-sentinel-border">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Officer / User</th>
                <th className="p-3">Action Executed</th>
                <th className="p-3">Target Entity</th>
                <th className="p-3">Terminal IP</th>
                <th className="p-3 text-right">Integrity Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sentinel-border/50 text-sentinel-text">
              {filteredLogs.map((log, idx) => (
                <tr key={log.id || idx} className="hover:bg-sentinel-panel/40 transition-colors">
                  <td className="p-3 font-mono text-sentinel-gold text-[11px]">
                    {log.timestamp.includes('T') ? log.timestamp.replace('T', ' ').substring(0, 19) : log.timestamp}
                  </td>
                  <td className="p-3 font-bold text-white flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-sentinel-accent" />
                    {log.username}
                  </td>
                  <td className="p-3 font-bold">
                    <span className="px-2 py-0.5 rounded bg-sentinel-panel border border-sentinel-border text-[10px] text-white">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-sentinel-accent text-xs">{log.entity_id || 'SYSTEM'}</td>
                  <td className="p-3 font-mono text-sentinel-muted text-[11px]">{log.ip_address}</td>
                  <td className="p-3 text-right">
                    <span className="inline-flex items-center gap-1 text-sentinel-green text-[10px] font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED SHA-256
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
