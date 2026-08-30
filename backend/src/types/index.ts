// ============================================================
// Gujarat Sentinel — Shared Type Definitions
// ============================================================

// ── User & Auth ──
export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: UserRole;
  department: string;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'SUPER_ADMIN' | 'POLICE_ADMIN' | 'CONTROL_ROOM_OPERATOR' | 'INVESTIGATOR' | 'DEPARTMENT_USER' | 'VIEW_ONLY';

export interface AuthPayload {
  userId: string;
  username: string;
  role: UserRole;
  department: string;
}

// ── Camera ──
export interface Camera {
  id: string;
  camera_id: string;
  name: string;
  department: string;
  location: string;
  district: string;
  latitude: number;
  longitude: number;
  camera_type: 'IP' | 'ANALOG' | 'PTZ' | 'DOME' | 'BULLET';
  vendor: string;
  model: string;
  ip_address: string;
  protocol: 'RTSP' | 'ONVIF' | 'HTTP' | 'RTMP';
  vms: string;
  nvr: string;
  resolution: string;
  fps: number;
  storage_type: 'LOCAL' | 'NVR' | 'CLOUD' | 'HYBRID';
  retention_days: number;
  installation_date: string;
  amc_status: 'ACTIVE' | 'EXPIRED' | 'NA';
  status: CameraStatus;
  health_status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  ai_capabilities: string;
  last_heartbeat: string | null;
  stream_url: string;
  created_at: string;
  updated_at: string;
}

export type CameraStatus = 'ONLINE' | 'OFFLINE' | 'WARNING' | 'MAINTENANCE';

// ── Vehicle Detection ──
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
  speed_estimate: number | null;
  snapshot_url: string | null;
  video_ref: string | null;
  watchlist_match: boolean;
  watchlist_id: string | null;
  created_at: string;
}

// ── Watchlist ──
export interface WatchlistEntry {
  id: string;
  watchlist_id: string;
  category: WatchlistCategory;
  entity_type: 'VEHICLE' | 'PERSON';
  // Vehicle fields
  vehicle_number: string | null;
  vehicle_type: string | null;
  vehicle_color: string | null;
  owner_ref: string | null;
  // Person fields
  person_name: string | null;
  person_alias: string | null;
  person_photo: string | null;
  // Common fields
  case_number: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  priority: AlertPriority;
  department: string;
  notes: string | null;
  created_at: string;
  expiry_date: string | null;
  updated_at: string;
}

export type WatchlistCategory = 'STOLEN_VEHICLE' | 'BLACKLISTED_VEHICLE' | 'WANTED_PERSON' | 'MISSING_PERSON' | 'SUSPECT' | 'OTHER';

// ── Alert ──
export interface Alert {
  id: string;
  alert_id: string;
  type: AlertType;
  priority: AlertPriority;
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
  snapshot_url: string | null;
  watchlist_id: string | null;
  watchlist_category: string | null;
  status: AlertStatus;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type AlertType = 'WATCHLIST_MATCH' | 'STOLEN_VEHICLE' | 'WANTED_PERSON' | 'MISSING_PERSON' | 'INTRUSION' | 'UNUSUAL_ACTIVITY' | 'CAMERA_OFFLINE' | 'SYSTEM_WARNING';
export type AlertPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
export type AlertStatus = 'NEW' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';

// ── Incident ──
export interface Incident {
  id: string;
  incident_id: string;
  alert_id: string | null;
  title: string;
  priority: AlertPriority;
  location: string;
  district: string;
  assigned_officer: string | null;
  status: IncidentStatus;
  description: string;
  evidence: string | null;
  related_vehicles: string | null;
  related_persons: string | null;
  timeline: string | null;
  created_at: string;
  updated_at: string;
}

export type IncidentStatus = 'OPEN' | 'INVESTIGATING' | 'ESCALATED' | 'RESOLVED' | 'CLOSED';

// ── Event ──
export interface SystemEvent {
  id: string;
  event_id: string;
  event_type: string;
  source: string;
  source_id: string;
  description: string;
  metadata: string | null;
  timestamp: string;
  created_at: string;
}

// ── Audit Log ──
export interface AuditLog {
  id: string;
  user_id: string;
  username: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string | null;
  ip_address: string;
  timestamp: string;
}

// ── Dashboard Stats ──
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

// ── Vehicle Profile ──
export interface VehicleProfile {
  plateNumber: string;
  status: string;
  firstSeen: string;
  lastSeen: string;
  totalDetections: number;
  totalCameras: number;
  departments: string[];
  watchlistMatch: WatchlistEntry | null;
  detections: VehicleDetection[];
  route: RoutePoint[];
}

export interface RoutePoint {
  latitude: number;
  longitude: number;
  timestamp: string;
  cameraId: string;
  cameraName: string;
  location: string;
  confidence: number;
}

// ── System Metrics ──
export interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  gpu_usage: number;
  storage_usage: number;
  network_in: number;
  network_out: number;
  active_streams: number;
  ai_inference_fps: number;
  queue_length: number;
  alert_latency_ms: number;
  timestamp: string;
}

// ── Integration ──
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

// ── WebSocket Events ──
export type WSEventType =
  | 'alert:new'
  | 'alert:updated'
  | 'detection:new'
  | 'camera:status'
  | 'incident:new'
  | 'incident:updated'
  | 'demo:phase'
  | 'demo:event'
  | 'metrics:update'
  | 'system:status';
