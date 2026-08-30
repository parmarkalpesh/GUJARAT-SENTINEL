-- ============================================================
-- Gujarat Sentinel — Database Schema
-- SQLite (production: PostgreSQL + PostGIS)
-- ============================================================

-- Users & Authentication
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'VIEW_ONLY',
  department TEXT NOT NULL DEFAULT 'General',
  is_active INTEGER NOT NULL DEFAULT 1,
  last_login TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Departments
CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  camera_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Camera Registry
CREATE TABLE IF NOT EXISTS cameras (
  id TEXT PRIMARY KEY,
  camera_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT NOT NULL,
  district TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  camera_type TEXT NOT NULL DEFAULT 'IP',
  vendor TEXT NOT NULL DEFAULT 'Generic',
  model TEXT DEFAULT '',
  ip_address TEXT DEFAULT '',
  protocol TEXT NOT NULL DEFAULT 'RTSP',
  vms TEXT DEFAULT '',
  nvr TEXT DEFAULT '',
  resolution TEXT DEFAULT '1080p',
  fps INTEGER DEFAULT 25,
  storage_type TEXT DEFAULT 'NVR',
  retention_days INTEGER DEFAULT 15,
  installation_date TEXT,
  amc_status TEXT DEFAULT 'ACTIVE',
  status TEXT NOT NULL DEFAULT 'ONLINE',
  health_status TEXT NOT NULL DEFAULT 'HEALTHY',
  ai_capabilities TEXT DEFAULT 'ANPR,VEHICLE_DETECTION',
  last_heartbeat TEXT,
  stream_url TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Vehicle Detections
CREATE TABLE IF NOT EXISTS vehicle_detections (
  id TEXT PRIMARY KEY,
  detection_id TEXT UNIQUE NOT NULL,
  camera_id TEXT NOT NULL,
  plate_number TEXT NOT NULL,
  plate_normalized TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  location TEXT NOT NULL,
  district TEXT NOT NULL,
  vehicle_type TEXT DEFAULT 'Car',
  vehicle_color TEXT DEFAULT 'Unknown',
  confidence REAL NOT NULL DEFAULT 0.0,
  direction TEXT,
  speed_estimate REAL,
  snapshot_url TEXT,
  video_ref TEXT,
  watchlist_match INTEGER DEFAULT 0,
  watchlist_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (camera_id) REFERENCES cameras(camera_id)
);

-- Watchlist
CREATE TABLE IF NOT EXISTS watchlist_entries (
  id TEXT PRIMARY KEY,
  watchlist_id TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  entity_type TEXT NOT NULL DEFAULT 'VEHICLE',
  vehicle_number TEXT,
  vehicle_type TEXT,
  vehicle_color TEXT,
  owner_ref TEXT,
  person_name TEXT,
  person_alias TEXT,
  person_photo TEXT,
  case_number TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  priority TEXT NOT NULL DEFAULT 'MEDIUM',
  department TEXT NOT NULL DEFAULT 'Police',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expiry_date TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Alerts
CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  alert_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'MEDIUM',
  camera_id TEXT,
  camera_name TEXT,
  location TEXT,
  district TEXT,
  latitude REAL,
  longitude REAL,
  timestamp TEXT NOT NULL,
  detected_entity TEXT,
  entity_type TEXT DEFAULT 'VEHICLE',
  confidence REAL DEFAULT 0.0,
  snapshot_url TEXT,
  watchlist_id TEXT,
  watchlist_category TEXT,
  status TEXT NOT NULL DEFAULT 'NEW',
  acknowledged_by TEXT,
  acknowledged_at TEXT,
  resolved_by TEXT,
  resolved_at TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Incidents
CREATE TABLE IF NOT EXISTS incidents (
  id TEXT PRIMARY KEY,
  incident_id TEXT UNIQUE NOT NULL,
  alert_id TEXT,
  title TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'MEDIUM',
  location TEXT,
  district TEXT,
  assigned_officer TEXT,
  status TEXT NOT NULL DEFAULT 'OPEN',
  description TEXT,
  evidence TEXT,
  related_vehicles TEXT,
  related_persons TEXT,
  timeline TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (alert_id) REFERENCES alerts(alert_id)
);

-- System Events
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  source TEXT NOT NULL,
  source_id TEXT,
  description TEXT NOT NULL,
  metadata TEXT,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  username TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details TEXT,
  ip_address TEXT DEFAULT '0.0.0.0',
  timestamp TEXT NOT NULL DEFAULT (datetime('now'))
);

-- System Metrics
CREATE TABLE IF NOT EXISTS system_metrics (
  id TEXT PRIMARY KEY,
  cpu_usage REAL DEFAULT 0,
  memory_usage REAL DEFAULT 0,
  gpu_usage REAL DEFAULT 0,
  storage_usage REAL DEFAULT 0,
  network_in REAL DEFAULT 0,
  network_out REAL DEFAULT 0,
  active_streams INTEGER DEFAULT 0,
  ai_inference_fps REAL DEFAULT 0,
  queue_length INTEGER DEFAULT 0,
  alert_latency_ms REAL DEFAULT 0,
  timestamp TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Integration Systems
CREATE TABLE IF NOT EXISTS integrations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  system_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DISCONNECTED',
  last_sync TEXT,
  records_count INTEGER DEFAULT 0,
  endpoint TEXT DEFAULT '',
  description TEXT DEFAULT ''
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_detections_plate ON vehicle_detections(plate_normalized);
CREATE INDEX IF NOT EXISTS idx_detections_camera ON vehicle_detections(camera_id);
CREATE INDEX IF NOT EXISTS idx_detections_timestamp ON vehicle_detections(timestamp);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_priority ON alerts(priority);
CREATE INDEX IF NOT EXISTS idx_watchlist_vehicle ON watchlist_entries(vehicle_number);
CREATE INDEX IF NOT EXISTS idx_watchlist_status ON watchlist_entries(status);
CREATE INDEX IF NOT EXISTS idx_cameras_status ON cameras(status);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
