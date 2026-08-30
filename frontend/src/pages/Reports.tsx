import { useState } from 'react';
import {
  FileBarChart, Download, FileText, CheckCircle2,
  Calendar, Printer, Shield, FileSpreadsheet
} from 'lucide-react';
import { api } from '../services/api';

export default function Reports() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const downloadReport = async (type: string, plate = 'GJ01AB1234') => {
    setDownloading(type);
    try {
      let data: any;
      let filename = '';

      if (type === 'VEHICLE') {
        data = await api.vehicleMovementReport(plate);
        filename = `GJ-SENTINEL-VEHICLE-JOURNEY-${plate}.json`;
      } else if (type === 'ALERT') {
        data = await api.alertSummaryReport();
        filename = `GJ-SENTINEL-ALERT-SUMMARY.json`;
      } else {
        data = await api.cameraHealthReport();
        filename = `GJ-SENTINEL-CAMERA-SLA-HEALTH.json`;
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Top Bar ── */}
      <div className="bg-sentinel-dark border border-sentinel-border rounded-xl p-3.5 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sentinel-panel border border-sentinel-border flex items-center justify-center">
            <FileBarChart className="w-4 h-4 text-sentinel-accent" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-wider">
              Forensic Reporting &amp; Audit Dossier Generator
            </h1>
            <p className="text-[10px] text-sentinel-muted">
              Evidentiary document export for law enforcement, judicial review &amp; departmental analytics
            </p>
          </div>
        </div>
      </div>

      {/* ── Reports Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Report 1: Target Vehicle Journey */}
        <div className="bg-sentinel-dark border border-sentinel-border rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-extrabold text-[9px] uppercase border border-blue-200">
                Official Evidence Export
              </span>
              <FileSpreadsheet className="w-5 h-5 text-sentinel-accent" />
            </div>
            <h3 className="text-sm font-black text-white">Target Vehicle Movement Report (GJ01AB1234)</h3>
            <p className="text-xs text-sentinel-muted mt-2 leading-relaxed">
              Complete chronological audit trail of all 17 automated camera detections, timestamps, locations from Ahmedabad to Patan,
              optical confidence scores, and watchlist correlation.
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-sentinel-border">
            <button
              onClick={() => downloadReport('VEHICLE')}
              disabled={downloading === 'VEHICLE'}
              className="w-full py-2.5 px-3 rounded-lg bg-sentinel-accent hover:bg-sentinel-accent-dim text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {downloading === 'VEHICLE' ? 'Exporting...' : 'Download JSON / Audit'}
            </button>
          </div>
        </div>

        {/* Report 2: Daily Alert Audit */}
        <div className="bg-sentinel-dark border border-sentinel-border rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-extrabold text-[9px] uppercase">
                Security Audit
              </span>
              <FileText className="w-5 h-5 text-sentinel-gold" />
            </div>
            <h3 className="text-sm font-black text-white">Daily Security &amp; Watchlist Match Audit</h3>
            <p className="text-xs text-sentinel-muted mt-2 leading-relaxed">
              Consolidated breakdown of critical, high, and medium priority alerts, operator acknowledgment response times,
              and incident escalation statuses.
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-sentinel-border">
            <button
              onClick={() => downloadReport('ALERT')}
              disabled={downloading === 'ALERT'}
              className="w-full py-2.5 px-3 rounded-lg bg-sentinel-panel hover:bg-sentinel-card border border-sentinel-border text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {downloading === 'ALERT' ? 'Exporting...' : 'Export Alert Dossier'}
            </button>
          </div>
        </div>

        {/* Report 3: Camera Health SLA */}
        <div className="bg-sentinel-dark border border-sentinel-border rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 font-extrabold text-[9px] uppercase">
                Infrastructure SLA
              </span>
              <CheckCircle2 className="w-5 h-5 text-sentinel-green" />
            </div>
            <h3 className="text-sm font-black text-white">Statewide Camera Ingestion Health SLA</h3>
            <p className="text-xs text-sentinel-muted mt-2 leading-relaxed">
              Department-wise uptime statistics, offline camera maintenance ticket register, streaming latency percentiles,
              and VMS adapter health telemetry.
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-sentinel-border">
            <button
              onClick={() => downloadReport('HEALTH')}
              disabled={downloading === 'HEALTH'}
              className="w-full py-2.5 px-3 rounded-lg bg-sentinel-panel hover:bg-sentinel-card border border-sentinel-border text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {downloading === 'HEALTH' ? 'Exporting...' : 'Export SLA Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
