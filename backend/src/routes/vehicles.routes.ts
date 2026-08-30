// ============================================================
// Gujarat Sentinel — Vehicle Intelligence Routes
// ============================================================
import { Router, Request, Response } from 'express';
import { getDb } from '../database/db';

const router = Router();

// GET /api/vehicles/search?plate=GJ01AB1234
router.get('/search', (req: Request, res: Response) => {
  const db = getDb();
  const { plate, camera, district, date_from, date_to, vehicle_type, watchlist } = req.query;

  let query = 'SELECT * FROM vehicle_detections WHERE 1=1';
  const params: any[] = [];

  if (plate) { query += ' AND plate_normalized LIKE ?'; params.push(`%${(plate as string).replace(/[\s-]/g, '').toUpperCase()}%`); }
  if (camera) { query += ' AND camera_id = ?'; params.push(camera); }
  if (district) { query += ' AND district = ?'; params.push(district); }
  if (date_from) { query += ' AND timestamp >= ?'; params.push(date_from); }
  if (date_to) { query += ' AND timestamp <= ?'; params.push(date_to); }
  if (vehicle_type) { query += ' AND vehicle_type = ?'; params.push(vehicle_type); }
  if (watchlist === 'true') { query += ' AND watchlist_match = 1'; }

  query += ' ORDER BY timestamp DESC LIMIT 200';

  const detections = db.prepare(query).all(...params);
  res.json(detections);
});

// GET /api/vehicles/:plate — Vehicle Profile
router.get('/:plate', (req: Request, res: Response) => {
  const db = getDb();
  const rawPlate = Array.isArray(req.params.plate) ? req.params.plate[0] : req.params.plate;
  const plateNormalized = String(rawPlate).replace(/[\s-]/g, '').toUpperCase();

  // Get all detections
  const detections = db.prepare(
    'SELECT * FROM vehicle_detections WHERE plate_normalized = ? ORDER BY timestamp ASC'
  ).all(plateNormalized) as any[];

  if (detections.length === 0) {
    res.status(404).json({ error: 'No detections found for this vehicle' });
    return;
  }

  // Get watchlist match
  const watchlistMatch = db.prepare(
    "SELECT * FROM watchlist_entries WHERE vehicle_number = ? AND status = 'ACTIVE'"
  ).get(plateNormalized) as any;

  // Get unique cameras
  const cameraIds = [...new Set(detections.map((d: any) => d.camera_id))];
  const cameras = cameraIds.map(cid => 
    db.prepare('SELECT * FROM cameras WHERE camera_id = ?').get(cid)
  ).filter(Boolean) as any[];

  // Get unique departments
  const depts = [...new Set(cameras.map((c: any) => c?.department).filter(Boolean))];

  // Build route
  const route = detections.map((d: any) => ({
    latitude: d.latitude,
    longitude: d.longitude,
    timestamp: d.timestamp,
    cameraId: d.camera_id,
    cameraName: cameras.find((c: any) => c?.camera_id === d.camera_id)?.name || d.camera_id,
    location: d.location,
    district: d.district,
    confidence: d.confidence,
    direction: d.direction,
  }));

  // Related alerts
  const alerts = db.prepare(
    "SELECT * FROM alerts WHERE detected_entity = ? ORDER BY timestamp DESC"
  ).all(plateNormalized);

  // Related incidents
  const incidents = db.prepare(
    "SELECT * FROM incidents WHERE related_vehicles LIKE ? ORDER BY created_at DESC"
  ).all(`%${plateNormalized}%`);

  res.json({
    plateNumber: plateNormalized,
    vehicleType: detections[0].vehicle_type,
    vehicleColor: detections[0].vehicle_color,
    status: watchlistMatch ? 'WATCHLIST_MATCH' : 'NORMAL',
    firstSeen: detections[0].timestamp,
    lastSeen: detections[detections.length - 1].timestamp,
    totalDetections: detections.length,
    totalCameras: cameraIds.length,
    departments: depts,
    watchlistMatch,
    detections,
    route,
    alerts,
    incidents,
  });
});

// GET /api/vehicles/:plate/route — Route Only
router.get('/:plate/route', (req: Request, res: Response) => {
  const db = getDb();
  const rawPlate = Array.isArray(req.params.plate) ? req.params.plate[0] : req.params.plate;
  const plateNormalized = String(rawPlate).replace(/[\s-]/g, '').toUpperCase();

  const detections = db.prepare(
    'SELECT vd.*, c.name as camera_name FROM vehicle_detections vd LEFT JOIN cameras c ON vd.camera_id = c.camera_id WHERE vd.plate_normalized = ? ORDER BY vd.timestamp ASC'
  ).all(plateNormalized) as any[];

  const route = detections.map((d: any) => ({
    latitude: d.latitude,
    longitude: d.longitude,
    timestamp: d.timestamp,
    cameraId: d.camera_id,
    cameraName: d.camera_name || d.camera_id,
    location: d.location,
    district: d.district,
    confidence: d.confidence,
    direction: d.direction,
  }));

  res.json(route);
});

export default router;
