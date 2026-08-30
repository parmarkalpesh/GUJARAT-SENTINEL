import { useState } from 'react';
import {
  Settings as SettingsIcon, Sliders, Volume2, Shield,
  Database, Bell, CheckCircle2, Save
} from 'lucide-react';

export default function Settings() {
  const [anprThreshold, setAnprThreshold] = useState(85);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoAcknowledge, setAutoAcknowledge] = useState(false);
  const [retentionDays, setRetentionDays] = useState(15);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* ── Top Bar ── */}
      <div className="bg-sentinel-dark border border-sentinel-border rounded-xl p-3.5 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sentinel-panel border border-sentinel-border flex items-center justify-center">
            <SettingsIcon className="w-4 h-4 text-sentinel-accent" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-wider">
              Control Room System &amp; AI Analytics Configuration
            </h1>
            <p className="text-[10px] text-sentinel-muted">
              Operational parameters, alert sound triggers &amp; computer vision confidence thresholds
            </p>
          </div>
        </div>

        {saved && (
          <span className="flex items-center gap-1 text-xs font-bold text-sentinel-green animate-fade-in">
            <CheckCircle2 className="w-4 h-4" /> Settings Saved Successfully
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-4 text-xs">
        {/* Computer Vision Config */}
        <div className="bg-sentinel-dark border border-sentinel-border rounded-xl p-5 shadow-xl space-y-4">
          <h2 className="text-sm font-extrabold text-white flex items-center gap-2 uppercase tracking-wider">
            <Sliders className="w-4 h-4 text-sentinel-accent" /> AI Inference &amp; ANPR Sensitivity
          </h2>

          <div>
            <div className="flex justify-between font-bold mb-1.5">
              <span className="text-sentinel-muted">Minimum Plate OCR Confidence Threshold:</span>
              <span className="text-sentinel-accent font-mono text-sm">{anprThreshold}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="99"
              value={anprThreshold}
              onChange={(e) => setAnprThreshold(Number(e.target.value))}
              className="w-full accent-sentinel-accent cursor-pointer"
            />
            <p className="text-[10px] text-sentinel-muted mt-1">
              Detections with confidence below this threshold will be flagged for secondary human verification.
            </p>
          </div>
        </div>

        {/* Alerts & Sound */}
        <div className="bg-sentinel-dark border border-sentinel-border rounded-xl p-5 shadow-xl space-y-4">
          <h2 className="text-sm font-extrabold text-white flex items-center gap-2 uppercase tracking-wider">
            <Bell className="w-4 h-4 text-sentinel-gold" /> Alert Notifications &amp; Sound Dispatch
          </h2>

          <div className="flex items-center justify-between p-3 rounded-lg bg-sentinel-panel border border-sentinel-border">
            <div>
              <div className="font-bold text-white">Audio Chime for Critical Watchlist Matches</div>
              <div className="text-[10px] text-sentinel-muted">Emits siren alert when a stolen vehicle is recognized</div>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-4 h-4 accent-sentinel-accent cursor-pointer"
            />
          </div>
        </div>

        {/* Data Retention */}
        <div className="bg-sentinel-dark border border-sentinel-border rounded-xl p-5 shadow-xl space-y-4">
          <h2 className="text-sm font-extrabold text-white flex items-center gap-2 uppercase tracking-wider">
            <Database className="w-4 h-4 text-purple-400" /> Data Retention Policies
          </h2>

          <div>
            <label className="text-sentinel-muted font-bold block mb-1.5">
              Standard Operational Footage Retention:
            </label>
            <select
              value={retentionDays}
              onChange={(e) => setRetentionDays(Number(e.target.value))}
              className="bg-sentinel-panel border border-sentinel-border rounded-lg p-2.5 text-white outline-none w-full sm:w-64"
            >
              <option value={7}>7 Days (Local Storage Buffer)</option>
              <option value={15}>15 Days (Departmental Default)</option>
              <option value={30}>30 Days (Standard Legal Requirement)</option>
              <option value={90}>90 Days (Critical Infrastructure)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-sentinel-accent hover:bg-sentinel-accent-dim text-black font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-sentinel-accent/20"
          >
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
