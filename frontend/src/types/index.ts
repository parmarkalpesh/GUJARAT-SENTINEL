// ============================================================
// Gujarat Sentinel — Frontend Types
// ============================================================

export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: string;
  department: string;
}

export interface Camera {
  id: string;
  camera_id: string;
  name: string;
  department: string;
  location: string;
  district: string;
  latitude: number;
  longitude: number;
  camera_type: string;
  vendor: string;
  model: string;
  protocol: string;
  vms: string;
  resolution: string;
  fps: number;
  status: 'ONLINE' | 'OFFLINE' | 'WARNING' | 'MAINTENANCE';
  health_status: string;
  ai_capabilities: string;
  storage_type?: string;
  last_heartbeat: string | null;
}

export interface VehicleDetection {
  id: string;
  detection_id: string;
  camera_id: string;
  plate_number: string;
  plate_normalized: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  location: string;
  district: string;
  vehicle_type: string;
  vehicle_color: string;
  confidence: number;
  direction: string | null;
  watchlist_match: boolean;
  watchlist_id: string | null;
}

export interface WatchlistEntry {
  id: string;
  watchlist_id: string;
  category: string;
  entity_type: string;
  vehicle_number: string | null;
  vehicle_type: string | null;
  vehicle_color: string | null;
  person_name: string | null;
  case_number: string | null;
  status: string;
  priority: string;
  department: string;
  notes: string | null;
  created_at: string;
  expiry_date: string | null;
}

export interface Alert {
  id: string;
  alert_id: string;
  type: string;
  priority: string;
  camera_id: string;
  camera_name: string;
  location: string;
  district: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  detected_entity: string;
  entity_type: string;
  confidence: number;
  watchlist_id: string | null;
  watchlist_category: string | null;
  status: string;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
}

export interface Incident {
  id: string;
  incident_id: string;
  alert_id: string | null;
  title: string;
  priority: string;
  location: string;
  district: string;
  assigned_officer: string | null;
  status: string;
  description: string;
  related_vehicles: string | null;
  timeline: string | null;
  created_at: string;
  updated_at: string;
}

export interface SystemEvent {
  id: string;
  event_id: string;
  event_type: string;
  source: string;
  source_id: string;
  description: string;
  timestamp: string;
}

export interface DashboardStats {
  totalCameras: number;
  onlineCameras: number;
  offlineCameras: number;
  activeAlerts: number;
  criticalAlerts: number;
  vehiclesToday: number;
  watchlistMatches: number;
  aiEvents: number;
  activeIncidents: number;
}

export interface VehicleProfile {
  plateNumber: string;
  vehicleType: string;
  vehicleColor: string;
  status: string;
  firstSeen: string;
  lastSeen: string;
  totalDetections: number;
  totalCameras: number;
  departments: string[];
  watchlistMatch: WatchlistEntry | null;
  detections: VehicleDetection[];
  route: RoutePoint[];
  alerts: Alert[];
  incidents: Incident[];
}

export interface RoutePoint {
  latitude: number;
  longitude: number;
  timestamp: string;
  cameraId: string;
  cameraName: string;
  location: string;
  district: string;
  confidence: number;
  direction?: string;
}

export interface Integration {
  id: string;
  name: string;
  system_type: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'SYNCING' | 'ERROR';
  last_sync: string | null;
  records_count: number;
  endpoint: string;
  description: string;
}

export interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  gpu_usage: number;
  storage_usage: number;
  active_streams: number;
  ai_inference_fps: number;
  queue_length: number;
  alert_latency_ms: number;
  timestamp: string;
}

export interface SearchResult {
  id: string;
  type: 'vehicle' | 'camera' | 'alert' | 'incident';
  title: string;
  subtitle: string;
}
