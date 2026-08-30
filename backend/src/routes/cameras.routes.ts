// ============================================================
// Gujarat Sentinel — Camera Routes
// ============================================================
import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../database/db';

const router = Router();

// GET /api/cameras
router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const { department, district, status, search } = req.query;

  let query = 'SELECT * FROM cameras WHERE 1=1';
  const params: any[] = [];

  if (department) { query += ' AND department = ?'; params.push(department); }
  if (district) { query += ' AND district = ?'; params.push(district); }
  if (status) { query += ' AND status = ?'; params.push(status); }
  if (search) { query += ' AND (camera_id LIKE ? OR name LIKE ? OR location LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

  query += ' ORDER BY camera_id ASC';

  const cameras = db.prepare(query).all(...params) as any[];
  const mapped = cameras.map((cam, idx) => {
    const streamId = ((idx) % 30) + 1;
    return {
      ...cam,
      stream_id: streamId,
      hls_url: `https://live.corp8.cloud/live/stream/${streamId}/index.m3u8`,
      rtsp_url: `rtsp://live.corp8.cloud:8554/stream/${streamId}`,
      webrtc_url: `http://live.corp8.cloud:8889/stream/${streamId}/whep`,
    };
  });
  res.json(mapped);
});

// GET /api/cameras/:id
router.get('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const camera = db.prepare('SELECT * FROM cameras WHERE camera_id = ? OR id = ?').get(req.params.id, req.params.id) as any;
  if (!camera) { res.status(404).json({ error: 'Camera not found' }); return; }
  const numeric = parseInt(String(camera.camera_id).replace(/\D/g, ''), 10) || 1;
  const streamId = ((numeric - 1) % 30) + 1;
  res.json({
    ...camera,
    stream_id: streamId,
    hls_url: `https://live.corp8.cloud/live/stream/${streamId}/index.m3u8`,
    rtsp_url: `rtsp://live.corp8.cloud:8554/stream/${streamId}`,
    webrtc_url: `http://live.corp8.cloud:8889/stream/${streamId}/whep`,
  });
});

// POST /api/cameras
router.post('/', (req: Request, res: Response) => {
  const db = getDb();
  const id = uuid();
  const { camera_id, name, department, location, district, latitude, longitude, camera_type, vendor, model, protocol, vms } = req.body;

  if (!camera_id || !name || !location) {
    res.status(400).json({ error: 'camera_id, name, and location are required' });
    return;
  }

  db.prepare(`
    INSERT INTO cameras (id, camera_id, name, department, location, district, latitude, longitude, camera_type, vendor, model, protocol, vms, status, health_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ONLINE', 'HEALTHY')
  `).run(id, camera_id, name, department || 'General', location, district || '', latitude || 0, longitude || 0, camera_type || 'IP', vendor || 'Generic', model || '', protocol || 'RTSP', vms || '');

  const camera = db.prepare('SELECT * FROM cameras WHERE id = ?').get(id);
  res.status(201).json(camera);
});

// PUT /api/cameras/:id
router.put('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const fields = ['name', 'department', 'location', 'district', 'latitude', 'longitude', 'camera_type', 'vendor', 'model', 'protocol', 'vms', 'status', 'health_status'];
  const updates: string[] = [];
  const params: any[] = [];

  for (const field of fields) {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = ?`);
      params.push(req.body[field]);
    }
  }

  if (updates.length === 0) { res.status(400).json({ error: 'No fields to update' }); return; }

  updates.push("updated_at = datetime('now')");
  params.push(req.params.id, req.params.id);

  db.prepare(`UPDATE cameras SET ${updates.join(', ')} WHERE camera_id = ? OR id = ?`).run(...params);

  const camera = db.prepare('SELECT * FROM cameras WHERE camera_id = ? OR id = ?').get(req.params.id, req.params.id);
  res.json(camera);
});

// DELETE /api/cameras/:id
router.delete('/:id', (req: Request, res: Response) => {
  const db = getDb();
  db.prepare('DELETE FROM cameras WHERE camera_id = ? OR id = ?').run(req.params.id, req.params.id);
  res.json({ success: true });
});

// GET /api/cameras/stats/summary
router.get('/stats/summary', (_req: Request, res: Response) => {
  const db = getDb();
  const stats = {
    total: (db.prepare('SELECT COUNT(*) as c FROM cameras').get() as any).c,
    online: (db.prepare("SELECT COUNT(*) as c FROM cameras WHERE status = 'ONLINE'").get() as any).c,
    offline: (db.prepare("SELECT COUNT(*) as c FROM cameras WHERE status = 'OFFLINE'").get() as any).c,
    warning: (db.prepare("SELECT COUNT(*) as c FROM cameras WHERE status = 'WARNING'").get() as any).c,
    departments: db.prepare('SELECT department, COUNT(*) as count FROM cameras GROUP BY department').all(),
    districts: db.prepare('SELECT district, COUNT(*) as count FROM cameras GROUP BY district').all(),
  };
  res.json(stats);
});

export default router;
