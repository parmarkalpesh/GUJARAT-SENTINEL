// ============================================================
// Gujarat Sentinel — Incident, Events, Audit, Health, 
//                     Users, Integrations, System Routes
// ============================================================
import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../database/db';

// ── Incidents ──
export const incidentRouter = Router();

incidentRouter.get('/', (_req: Request, res: Response) => {
  const db = getDb();
  const incidents = db.prepare("SELECT * FROM incidents ORDER BY CASE priority WHEN 'CRITICAL' THEN 0 WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END, created_at DESC").all();
  res.json(incidents);
});

incidentRouter.get('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const incident = db.prepare('SELECT * FROM incidents WHERE incident_id = ? OR id = ?').get(req.params.id, req.params.id);
  if (!incident) { res.status(404).json({ error: 'Incident not found' }); return; }
  res.json(incident);
});

incidentRouter.post('/', (req: Request, res: Response) => {
  const db = getDb();
  const id = uuid();
  const incidentId = `INC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;
  const { alert_id, title, priority, location, district, assigned_officer, description, related_vehicles, related_persons } = req.body;

  db.prepare(`INSERT INTO incidents (id, incident_id, alert_id, title, priority, location, district, assigned_officer, status, description, related_vehicles, related_persons) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', ?, ?, ?)`)
    .run(id, incidentId, alert_id || null, title, priority || 'MEDIUM', location || '', district || '', assigned_officer || null, description || '', related_vehicles || null, related_persons || null);

  // If alert_id, update alert status
  if (alert_id) {
    db.prepare("UPDATE alerts SET status = 'INVESTIGATING', updated_at = datetime('now') WHERE alert_id = ?").run(alert_id);
  }

  const incident = db.prepare('SELECT * FROM incidents WHERE id = ?').get(id);
  res.status(201).json(incident);
});

incidentRouter.put('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const fields = ['title', 'priority', 'location', 'assigned_officer', 'status', 'description', 'evidence', 'related_vehicles', 'related_persons', 'timeline'];
  const updates: string[] = [];
  const params: any[] = [];

  for (const f of fields) {
    if (req.body[f] !== undefined) { updates.push(`${f} = ?`); params.push(req.body[f]); }
  }
  if (updates.length === 0) { res.status(400).json({ error: 'No fields' }); return; }
  updates.push("updated_at = datetime('now')");
  params.push(req.params.id, req.params.id);

  db.prepare(`UPDATE incidents SET ${updates.join(', ')} WHERE incident_id = ? OR id = ?`).run(...params);
  const incident = db.prepare('SELECT * FROM incidents WHERE incident_id = ? OR id = ?').get(req.params.id, req.params.id);
  res.json(incident);
});

// ── Events ──
export const eventsRouter = Router();

eventsRouter.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const { type, source, limit } = req.query;
  let query = 'SELECT * FROM events WHERE 1=1';
  const params: any[] = [];
  if (type) { query += ' AND event_type = ?'; params.push(type); }
  if (source) { query += ' AND source = ?'; params.push(source); }
  query += ` ORDER BY timestamp DESC LIMIT ${parseInt(limit as string) || 100}`;
  res.json(db.prepare(query).all(...params));
});

// ── Audit ──
export const auditRouter = Router();

auditRouter.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const { user, action, limit } = req.query;
  let query = 'SELECT * FROM audit_logs WHERE 1=1';
  const params: any[] = [];
  if (user) { query += ' AND username LIKE ?'; params.push(`%${user}%`); }
  if (action) { query += ' AND action = ?'; params.push(action); }
  query += ` ORDER BY timestamp DESC LIMIT ${parseInt(limit as string) || 100}`;
  res.json(db.prepare(query).all(...params));
});

// ── Health ──
export const healthRouter = Router();

healthRouter.get('/', (_req: Request, res: Response) => {
  const db = getDb();
  const cameras = db.prepare('SELECT COUNT(*) as total FROM cameras').get() as any;
  const online = db.prepare("SELECT COUNT(*) as c FROM cameras WHERE status = 'ONLINE'").get() as any;
  res.json({
    status: 'operational',
    version: '1.0.0',
    uptime: process.uptime(),
    database: 'connected',
    cameras: { total: cameras.total, online: online.c },
    timestamp: new Date().toISOString(),
  });
});

// ── Users ──
export const usersRouter = Router();

usersRouter.get('/', (_req: Request, res: Response) => {
  const db = getDb();
  const users = db.prepare('SELECT id, username, email, full_name, role, department, is_active, last_login, created_at FROM users ORDER BY created_at DESC').all();
  res.json(users);
});

usersRouter.put('/:id/role', (req: Request, res: Response) => {
  const db = getDb();
  const { role } = req.body;
  db.prepare("UPDATE users SET role = ?, updated_at = datetime('now') WHERE id = ?").run(role, req.params.id);
  res.json({ success: true });
});

usersRouter.put('/:id/status', (req: Request, res: Response) => {
  const db = getDb();
  const { is_active } = req.body;
  db.prepare("UPDATE users SET is_active = ?, updated_at = datetime('now') WHERE id = ?").run(is_active ? 1 : 0, req.params.id);
  res.json({ success: true });
});

// ── Integrations ──
export const integrationsRouter = Router();

integrationsRouter.get('/', (_req: Request, res: Response) => {
  const db = getDb();
  res.json(db.prepare('SELECT * FROM integrations ORDER BY name ASC').all());
});

// ── System Metrics ──
export const systemRouter = Router();

systemRouter.get('/metrics', (_req: Request, res: Response) => {
  const db = getDb();
  const metrics = db.prepare('SELECT * FROM system_metrics ORDER BY timestamp DESC LIMIT 1').get();
  // Add dynamic variance for demo
  const m = metrics as any || {};
  res.json({
    cpu_usage: Math.max(10, Math.min(95, (m.cpu_usage || 41) + (Math.random() * 10 - 5))),
    memory_usage: Math.max(30, Math.min(90, (m.memory_usage || 62) + (Math.random() * 6 - 3))),
    gpu_usage: Math.max(20, Math.min(95, (m.gpu_usage || 74) + (Math.random() * 8 - 4))),
    storage_usage: m.storage_usage || 58,
    network_in: Math.floor(800 + Math.random() * 600),
    network_out: Math.floor(500 + Math.random() * 500),
    active_streams: 47,
    ai_inference_fps: Math.max(20, Math.min(45, 31 + (Math.random() * 8 - 4))),
    queue_length: Math.floor(Math.random() * 20),
    alert_latency_ms: Math.floor(120 + Math.random() * 100),
    timestamp: new Date().toISOString(),
  });
});

systemRouter.get('/metrics/history', (_req: Request, res: Response) => {
  const db = getDb();
  res.json(db.prepare('SELECT * FROM system_metrics ORDER BY timestamp DESC LIMIT 60').all());
});

// ── Reports ──
export const reportsRouter = Router();

reportsRouter.get('/vehicle-movement', (req: Request, res: Response) => {
  const db = getDb();
  const { plate } = req.query;
  if (!plate) { res.status(400).json({ error: 'plate required' }); return; }
  const normalized = (plate as string).replace(/[\s-]/g, '').toUpperCase();
  const detections = db.prepare('SELECT vd.*, c.name as camera_name, c.department as camera_department FROM vehicle_detections vd LEFT JOIN cameras c ON vd.camera_id = c.camera_id WHERE vd.plate_normalized = ? ORDER BY vd.timestamp ASC').all(normalized);
  const watchlist = db.prepare("SELECT * FROM watchlist_entries WHERE vehicle_number = ? AND status = 'ACTIVE'").get(normalized);

  res.json({
    report_type: 'VEHICLE_MOVEMENT',
    generated_at: new Date().toISOString(),
    vehicle: normalized,
    watchlist_status: watchlist ? (watchlist as any).category : 'NONE',
    total_detections: detections.length,
    detections,
    classification: 'OFFICIAL LAW ENFORCEMENT RECORD — STATE CRIME RECORDS BUREAU GUJARAT',
  });
});

reportsRouter.get('/alert-summary', (_req: Request, res: Response) => {
  const db = getDb();
  const alerts = db.prepare('SELECT * FROM alerts ORDER BY timestamp DESC').all();
  const byPriority = db.prepare("SELECT priority, COUNT(*) as count FROM alerts GROUP BY priority").all();
  const byType = db.prepare("SELECT type, COUNT(*) as count FROM alerts GROUP BY type").all();
  const byStatus = db.prepare("SELECT status, COUNT(*) as count FROM alerts GROUP BY status").all();

  res.json({
    report_type: 'ALERT_SUMMARY',
    generated_at: new Date().toISOString(),
    total: alerts.length,
    by_priority: byPriority,
    by_type: byType,
    by_status: byStatus,
    alerts,
    classification: 'OFFICIAL POLICE RECORD',
  });
});

reportsRouter.get('/camera-health', (_req: Request, res: Response) => {
  const db = getDb();
  const cameras = db.prepare('SELECT * FROM cameras ORDER BY camera_id').all();
  const byStatus = db.prepare("SELECT status, COUNT(*) as count FROM cameras GROUP BY status").all();
  const byDepartment = db.prepare("SELECT department, COUNT(*) as count, SUM(CASE WHEN status = 'ONLINE' THEN 1 ELSE 0 END) as online FROM cameras GROUP BY department").all();

  res.json({
    report_type: 'CAMERA_HEALTH',
    generated_at: new Date().toISOString(),
    total: cameras.length,
    by_status: byStatus,
    by_department: byDepartment,
    cameras,
    disclaimer: 'DEMONSTRATION DATA',
  });
});

// ── Global Search ──
export const searchRouter = Router();

searchRouter.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const { q } = req.query;
  if (!q) { res.json({ results: [] }); return; }
  const term = `%${q}%`;

  const vehicles = db.prepare("SELECT DISTINCT plate_normalized as id, 'vehicle' as type, plate_normalized as title, location as subtitle FROM vehicle_detections WHERE plate_normalized LIKE ? LIMIT 5").all(term);
  const cameras = db.prepare("SELECT camera_id as id, 'camera' as type, name as title, location as subtitle FROM cameras WHERE camera_id LIKE ? OR name LIKE ? OR location LIKE ? LIMIT 5").all(term, term, term);
  const alerts = db.prepare("SELECT alert_id as id, 'alert' as type, type || ': ' || detected_entity as title, location as subtitle FROM alerts WHERE alert_id LIKE ? OR detected_entity LIKE ? LIMIT 5").all(term, term);
  const incidents = db.prepare("SELECT incident_id as id, 'incident' as type, title, location as subtitle FROM incidents WHERE incident_id LIKE ? OR title LIKE ? OR related_vehicles LIKE ? LIMIT 5").all(term, term, term);

  res.json({ results: [...vehicles, ...cameras, ...alerts, ...incidents] });
});
