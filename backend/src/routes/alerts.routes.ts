// ============================================================
// Gujarat Sentinel — Alert Routes
// ============================================================
import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../database/db';

const router = Router();

// GET /api/alerts
router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const { status, priority, type, search, limit } = req.query;

  let query = 'SELECT * FROM alerts WHERE 1=1';
  const params: any[] = [];

  if (status) { query += ' AND status = ?'; params.push(status); }
  if (priority) { query += ' AND priority = ?'; params.push(priority); }
  if (type) { query += ' AND type = ?'; params.push(type); }
  if (search) { query += ' AND (alert_id LIKE ? OR detected_entity LIKE ? OR location LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

  query += ` ORDER BY CASE priority WHEN 'CRITICAL' THEN 0 WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 WHEN 'LOW' THEN 3 ELSE 4 END, timestamp DESC`;
  query += ` LIMIT ${parseInt(limit as string) || 100}`;

  const alerts = db.prepare(query).all(...params);
  res.json(alerts);
});

// GET /api/alerts/:id
router.get('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const alert = db.prepare('SELECT * FROM alerts WHERE alert_id = ? OR id = ?').get(req.params.id, req.params.id);
  if (!alert) { res.status(404).json({ error: 'Alert not found' }); return; }
  res.json(alert);
});

// POST /api/alerts/:id/acknowledge
router.post('/:id/acknowledge', (req: Request, res: Response) => {
  const db = getDb();
  db.prepare(`UPDATE alerts SET status = 'ACKNOWLEDGED', acknowledged_by = ?, acknowledged_at = datetime('now'), updated_at = datetime('now') WHERE alert_id = ? OR id = ?`)
    .run(req.user?.username || 'operator', req.params.id, req.params.id);

  const alert = db.prepare('SELECT * FROM alerts WHERE alert_id = ? OR id = ?').get(req.params.id, req.params.id);
  res.json(alert);
});

// POST /api/alerts/:id/resolve
router.post('/:id/resolve', (req: Request, res: Response) => {
  const db = getDb();
  db.prepare(`UPDATE alerts SET status = 'RESOLVED', resolved_by = ?, resolved_at = datetime('now'), notes = COALESCE(?, notes), updated_at = datetime('now') WHERE alert_id = ? OR id = ?`)
    .run(req.user?.username || 'operator', req.body.notes || null, req.params.id, req.params.id);

  const alert = db.prepare('SELECT * FROM alerts WHERE alert_id = ? OR id = ?').get(req.params.id, req.params.id);
  res.json(alert);
});

// POST /api/alerts/:id/dismiss
router.post('/:id/dismiss', (req: Request, res: Response) => {
  const db = getDb();
  db.prepare(`UPDATE alerts SET status = 'DISMISSED', notes = COALESCE(?, notes), updated_at = datetime('now') WHERE alert_id = ? OR id = ?`)
    .run(req.body.notes || null, req.params.id, req.params.id);

  const alert = db.prepare('SELECT * FROM alerts WHERE alert_id = ? OR id = ?').get(req.params.id, req.params.id);
  res.json(alert);
});

// POST /api/alerts — Create new alert
router.post('/', (req: Request, res: Response) => {
  const db = getDb();
  const id = uuid();
  const alertId = `ALT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;

  const { type, priority, camera_id, camera_name, location, district, latitude, longitude, detected_entity, entity_type, confidence, watchlist_id, watchlist_category } = req.body;

  db.prepare(`
    INSERT INTO alerts (id, alert_id, type, priority, camera_id, camera_name, location, district, latitude, longitude, timestamp, detected_entity, entity_type, confidence, watchlist_id, watchlist_category, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, ?, ?, ?, ?, 'NEW')
  `).run(id, alertId, type, priority || 'MEDIUM', camera_id, camera_name, location, district, latitude, longitude, detected_entity, entity_type || 'VEHICLE', confidence || 0, watchlist_id, watchlist_category);

  const alert = db.prepare('SELECT * FROM alerts WHERE id = ?').get(id);
  res.status(201).json(alert);
});

export default router;
