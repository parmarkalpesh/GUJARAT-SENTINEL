import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Video, Calendar, Clock, Filter, Car,
  ArrowRight, Download, Eye, Play, ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';
import { VehicleDetection } from '../types';

export default function VideoSearch() {
  const navigate = useNavigate();
  const [detections, setDetections] = useState<VehicleDetection[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [plate, setPlate] = useState('');
  const [district, setDistrict] = useState('ALL');
  const [vehicleType, setVehicleType] = useState('ALL');
  const [watchlistOnly, setWatchlistOnly] = useState(false);
  const [modalDetection, setModalDetection] = useState<VehicleDetection | null>(null);

  const performSearch = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (plate.trim()) params.plate = plate.trim();
      if (district !== 'ALL') params.district = district;
      if (vehicleType !== 'ALL') params.vehicle_type = vehicleType;
      if (watchlistOnly) params.watchlist = 'true';

      const data = await api.vehicleSearch(params);
      setDetections(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch();
  }, [district, vehicleType, watchlistOnly]);

  return (
    <div className="space-y-4">
      {/* ── Top Bar ── */}
      <div className="bg-sentinel-dark border border-sentinel-border rounded-xl p-3.5 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sentinel-panel border border-sentinel-border flex items-center justify-center">
            <Search className="w-4 h-4 text-sentinel-accent" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-wider">
              Investigation-Oriented CCTV Video &amp; Evidence Search
            </h1>
            <p className="text-[10px] text-sentinel-muted">
              Deep forensic search across timestamped detections, optical recognition &amp; camera metadata
            </p>
          </div>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="bg-sentinel-dark border border-sentinel-border rounded-xl p-4 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="text-[10px] text-sentinel-muted font-bold block mb-1">Target Plate</label>
            <input
              type="text"
              placeholder="e.g. GJ01AB1234"
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              className="w-full bg-sentinel-panel border border-sentinel-border rounded-lg p-2 text-xs text-white font-mono uppercase outline-none focus:border-sentinel-accent"
            />
          </div>

          <div>
            <label className="text-[10px] text-sentinel-muted font-bold block mb-1">District</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full bg-sentinel-panel border border-sentinel-border rounded-lg p-2 text-xs text-white outline-none"
            >
              <option value="ALL">All Districts</option>
              <option value="Ahmedabad">Ahmedabad</option>
              <option value="Gandhinagar">Gandhinagar</option>
              <option value="Mehsana">Mehsana</option>
              <option value="Patan">Patan</option>
              <option value="Rajkot">Rajkot</option>
              <option value="Surat">Surat</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-sentinel-muted font-bold block mb-1">Vehicle Classification</label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full bg-sentinel-panel border border-sentinel-border rounded-lg p-2 text-xs text-white outline-none"
            >
              <option value="ALL">All Classifications</option>
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="Truck">Truck</option>
              <option value="Hatchback">Hatchback</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-5">
            <input
              type="checkbox"
              id="wlOnly"
              checked={watchlistOnly}
              onChange={(e) => setWatchlistOnly(e.target.checked)}
              className="rounded bg-sentinel-panel border-sentinel-border text-sentinel-accent cursor-pointer"
            />
            <label htmlFor="wlOnly" className="text-xs text-white font-bold cursor-pointer">
              Watchlist Hits Only
            </label>
          </div>

          <div className="pt-4">
            <button
              onClick={performSearch}
              disabled={loading}
              className="w-full py-2 px-3 rounded-lg bg-sentinel-accent hover:bg-sentinel-accent-dim text-black font-extrabold text-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Apply Filters'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Search Results Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {detections.map((det) => (
          <div
            key={det.id}
            className="bg-sentinel-dark border border-sentinel-border hover:border-sentinel-accent rounded-xl overflow-hidden shadow-lg transition-all group flex flex-col justify-between"
          >
            {/* Snapshot simulation display */}
            <div className="aspect-video bg-black relative flex items-center justify-center p-2">
              <div className="text-center opacity-40 group-hover:opacity-75 transition-opacity">
                <Video className="w-8 h-8 text-sentinel-accent mx-auto mb-1" />
                <span className="text-[9px] font-mono text-white tracking-wider">CCTV SNAPSHOT REF</span>
              </div>

              {/* Bounding box */}
              <div className="absolute border-2 border-sentinel-accent rounded px-2 py-0.5 bottom-2 left-2 bg-black/70">
                <span className="text-[10px] font-black text-white font-mono">{det.plate_number}</span>
                <span className="text-[8px] font-bold text-sentinel-green block">{det.confidence.toFixed(1)}%</span>
              </div>

              {det.watchlist_match && (
                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-red-600 text-white text-[8px] font-extrabold flex items-center gap-1">
                  <ShieldAlert className="w-2.5 h-2.5" /> WATCHLIST
                </div>
              )}
            </div>

            <div className="p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-sentinel-accent">{det.camera_id}</span>
                <span className="font-mono text-[10px] text-sentinel-gold font-bold">
                  {det.timestamp.includes('T') ? det.timestamp.split('T')[1].substring(0, 8) : det.timestamp}
                </span>
              </div>

              <div className="text-xs font-bold text-white mt-1 truncate">{det.location}</div>
              <div className="text-[10px] text-sentinel-muted mt-0.5">
                {det.district} • {det.vehicle_color} {det.vehicle_type}
              </div>

              {/* Action Buttons */}
              <div className="mt-3 pt-2.5 border-t border-sentinel-border/60 flex items-center justify-between gap-1">
                <button
                  onClick={() => setModalDetection(det)}
                  className="px-2 py-1 rounded bg-sentinel-panel hover:bg-sentinel-card text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3 h-3" /> View
                </button>
                <button
                  onClick={() => navigate(`/vehicles?plate=${det.plate_normalized}`)}
                  className="px-2 py-1 rounded bg-sentinel-accent/20 hover:bg-sentinel-accent text-sentinel-accent hover:text-black text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Car className="w-3 h-3" /> Track
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Snapshot Detail Modal ── */}
      {modalDetection && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-sentinel-dark border border-sentinel-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl p-5">
            <div className="flex items-center justify-between border-b border-sentinel-border pb-3 mb-4">
              <h3 className="text-base font-black text-white font-mono">
                Optical Evidence Verification • {modalDetection.plate_number}
              </h3>
              <button
                onClick={() => setModalDetection(null)}
                className="text-sentinel-muted hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="aspect-video bg-black rounded-xl relative flex items-center justify-center mb-4">
              <div className="text-center text-sentinel-muted">
                <Video className="w-12 h-12 mx-auto text-sentinel-accent/50 mb-2" />
                <div className="text-sm font-bold text-white">Full-Frame Forensic Playback Available</div>
                <div className="text-xs font-mono text-sentinel-muted mt-1">
                  Camera: {modalDetection.camera_id} • Timestamp: {modalDetection.timestamp}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-sentinel-panel p-2 rounded">
                <span className="text-[10px] text-sentinel-muted block">Plate Number</span>
                <span className="font-mono font-bold text-white">{modalDetection.plate_number}</span>
              </div>
              <div className="bg-sentinel-panel p-2 rounded">
                <span className="text-[10px] text-sentinel-muted block">Confidence</span>
                <span className="font-mono font-bold text-sentinel-green">{modalDetection.confidence.toFixed(1)}%</span>
              </div>
              <div className="bg-sentinel-panel p-2 rounded">
                <span className="text-[10px] text-sentinel-muted block">Location</span>
                <span className="font-bold text-white truncate">{modalDetection.location}</span>
              </div>
              <div className="bg-sentinel-panel p-2 rounded">
                <span className="text-[10px] text-sentinel-muted block">Vehicle Type</span>
                <span className="font-bold text-white">{modalDetection.vehicle_color} {modalDetection.vehicle_type}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
