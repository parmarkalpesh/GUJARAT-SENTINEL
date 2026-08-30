import { useState, useEffect } from 'react';
import {
  Camera, Plus, Search, Filter, Trash2, Edit2, Download,
  Upload, CheckCircle, AlertTriangle, XCircle, ArrowUpDown
} from 'lucide-react';
import { api } from '../services/api';
import { Camera as CameraType } from '../types';

export default function CameraRegistry() {
  const [cameras, setCameras] = useState<CameraType[]>([]);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCam, setEditingCam] = useState<CameraType | null>(null);

  const [formData, setFormData] = useState({
    camera_id: '',
    name: '',
    department: 'Home Department',
    location: '',
    district: 'Ahmedabad',
    latitude: 23.0225,
    longitude: 72.5714,
    camera_type: 'IP',
    vendor: 'Hikvision',
    model: 'DS-2CD2T47G2',
    protocol: 'RTSP',
    vms: 'Milestone XProtect',
  });

  const loadCameras = async () => {
    try {
      const data = await api.cameras();
      setCameras(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCameras();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCam) {
        await api.updateCamera(editingCam.camera_id, formData);
      } else {
        await api.createCamera(formData);
      }
      setIsModalOpen(false);
      setEditingCam(null);
      loadCameras();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(`Remove camera ${id} from registry?`)) {
      await api.deleteCamera(id);
      loadCameras();
    }
  };

  const handleExportCSV = () => {
    const headers = 'Camera ID,Name,Department,Location,District,Latitude,Longitude,Type,Vendor,Protocol,VMS,Status\n';
    const rows = cameras.map((c) =>
      `"${c.camera_id}","${c.name}","${c.department}","${c.location}","${c.district}",${c.latitude},${c.longitude},"${c.camera_type}","${c.vendor}","${c.protocol}","${c.vms}","${c.status}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gujarat_sentinel_camera_registry.csv';
    a.click();
  };

  const departments = ['ALL', ...new Set(cameras.map((c) => c.department))];

  const filteredCameras = cameras.filter((c) => {
    const matchesDept = deptFilter === 'ALL' || c.department === deptFilter;
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesSearch =
      c.camera_id.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase()) ||
      c.district.toLowerCase().includes(search.toLowerCase());
    return matchesDept && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* ── Top Bar ── */}
      <div className="bg-sentinel-dark border border-sentinel-border rounded-xl p-3.5 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sentinel-panel border border-sentinel-border flex items-center justify-center">
            <Camera className="w-4 h-4 text-sentinel-accent" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-wider">
              Centralized CCTV Inventory &amp; Camera Registry
            </h1>
            <p className="text-[10px] text-sentinel-muted">
              Standardized metadata catalog for 50 integrated nodes (scaling to ~80,000 cameras)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg bg-sentinel-panel hover:bg-sentinel-card border border-sentinel-border text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          <button
            onClick={() => {
              setEditingCam(null);
              setFormData({
                camera_id: `CAM-${String(cameras.length + 1).padStart(3, '0')}`,
                name: '',
                department: 'Home Department',
                location: '',
                district: 'Ahmedabad',
                latitude: 23.0225,
                longitude: 72.5714,
                camera_type: 'IP',
                vendor: 'Hikvision',
                model: 'DS-2CD2T47G2',
                protocol: 'RTSP',
                vms: 'Milestone XProtect',
              });
              setIsModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-lg bg-sentinel-accent hover:bg-sentinel-accent-dim text-black font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Onboard Camera
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="bg-sentinel-dark border border-sentinel-border rounded-xl p-3 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Department */}
          <div className="flex items-center gap-1.5 bg-sentinel-panel border border-sentinel-border rounded-lg px-2.5 py-1">
            <span className="text-sentinel-muted">Dept:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-transparent text-white outline-none cursor-pointer"
            >
              {departments.map((d) => (
                <option key={d} value={d} className="bg-sentinel-dark text-white">
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="flex items-center gap-1.5 bg-sentinel-panel border border-sentinel-border rounded-lg px-2.5 py-1">
            <span className="text-sentinel-muted">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-white outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-sentinel-dark text-white">All Statuses</option>
              <option value="ONLINE" className="bg-sentinel-dark text-white">Online</option>
              <option value="OFFLINE" className="bg-sentinel-dark text-white">Offline</option>
              <option value="WARNING" className="bg-sentinel-dark text-white">Warning</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3 h-3 text-sentinel-muted-dark absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, name, city..."
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
                <th className="p-3">Camera ID</th>
                <th className="p-3">Camera Name &amp; Location</th>
                <th className="p-3">Department</th>
                <th className="p-3">District</th>
                <th className="p-3">Vendor / VMS</th>
                <th className="p-3">Protocol</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sentinel-border/50 text-sentinel-text">
              {filteredCameras.map((cam) => (
                <tr key={cam.camera_id} className="hover:bg-sentinel-panel/40 transition-colors">
                  <td className="p-3 font-mono font-bold text-sentinel-accent">{cam.camera_id}</td>
                  <td className="p-3">
                    <div className="font-bold text-white">{cam.name}</div>
                    <div className="text-[10px] text-sentinel-muted">{cam.location}</div>
                  </td>
                  <td className="p-3 font-semibold text-white">{cam.department}</td>
                  <td className="p-3 text-sentinel-muted">{cam.district}</td>
                  <td className="p-3 font-mono text-[11px] text-sentinel-muted">
                    {cam.vendor} • {cam.vms}
                  </td>
                  <td className="p-3">
                    <span className="px-1.5 py-0.5 rounded bg-sentinel-panel border border-sentinel-border font-mono text-[10px]">
                      {cam.protocol}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${
                        cam.status === 'ONLINE'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {cam.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDelete(cam.camera_id)}
                      className="p-1 text-sentinel-muted hover:text-sentinel-red transition-colors cursor-pointer"
                      title="Remove Camera"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Onboard Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-sentinel-dark border border-sentinel-border rounded-2xl w-full max-w-lg p-5 shadow-2xl">
            <h3 className="text-base font-black text-white mb-4">Onboard New CCTV Node</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sentinel-muted font-bold block mb-1">Camera ID</label>
                  <input
                    type="text"
                    required
                    value={formData.camera_id}
                    onChange={(e) => setFormData({ ...formData, camera_id: e.target.value })}
                    className="w-full bg-sentinel-panel border border-sentinel-border rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-sentinel-muted font-bold block mb-1">Camera Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SG Highway Junction Camera"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-sentinel-panel border border-sentinel-border rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sentinel-muted font-bold block mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-sentinel-panel border border-sentinel-border rounded-lg p-2 text-white outline-none"
                  >
                    <option value="Home Department">Home Department</option>
                    <option value="Gujarat Police">Gujarat Police</option>
                    <option value="RTO">RTO</option>
                    <option value="Municipal Corporation">Municipal Corporation</option>
                    <option value="Food & Civil Supplies">Food &amp; Civil Supplies</option>
                  </select>
                </div>
                <div>
                  <label className="text-sentinel-muted font-bold block mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full bg-sentinel-panel border border-sentinel-border rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-sentinel-muted font-bold block mb-1">Exact Location Landmark</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-sentinel-panel border border-sentinel-border rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sentinel-muted font-bold block mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-sentinel-panel border border-sentinel-border rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-sentinel-muted font-bold block mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-sentinel-panel border border-sentinel-border rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sentinel-muted font-bold block mb-1">Vendor</label>
                  <input
                    type="text"
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    className="w-full bg-sentinel-panel border border-sentinel-border rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-sentinel-muted font-bold block mb-1">VMS Ingestion Platform</label>
                  <input
                    type="text"
                    value={formData.vms}
                    onChange={(e) => setFormData({ ...formData, vms: e.target.value })}
                    className="w-full bg-sentinel-panel border border-sentinel-border rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-sentinel-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-sentinel-panel hover:bg-sentinel-card text-sentinel-muted font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sentinel-accent hover:bg-sentinel-accent-dim text-black font-extrabold cursor-pointer"
                >
                  Save Camera
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
