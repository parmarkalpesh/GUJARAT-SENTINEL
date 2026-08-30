// ============================================================
// Gujarat Sentinel — Watchlist Routes
// ============================================================
import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../database/db';

const router = Router();

// GET /api/watchlist
router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const { category, status, priority, search } = req.query;

  let query = 'SELECT * FROM watchlist_entries WHERE 1=1';
  const params: any[] = [];

  if (category) { query += ' AND category = ?'; params.push(category); }
  if (status) { query += ' AND status = ?'; params.push(status); }
  if (priority) { query += ' AND priority = ?'; params.push(priority); }
  if (search) { query += ' AND (vehicle_number LIKE ? OR person_name LIKE ? OR case_number LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

  query += ' ORDER BY created_at DESC';

  const entries = db.prepare(query).all(...params);
  res.json(entries);
});

// GET /api/watchlist/:id
router.get('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const entry = db.prepare('SELECT * FROM watchlist_entries WHERE watchlist_id = ? OR id = ?').get(req.params.id, req.params.id);
  if (!entry) { res.status(404).json({ error: 'Watchlist entry not found' }); return; }
  res.json(entry);
});

// POST /api/watchlist
router.post('/', (req: Request, res: Response) => {
  const db = getDb();
  const id = uuid();
  const watchlistId = `WL-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;
  const { category, entity_type, vehicle_number, vehicle_type, vehicle_color, owner_ref, person_name, person_alias, case_number, priority, department, notes, expiry_date } = req.body;

  db.prepare(`
    INSERT INTO watchlist_entries (id, watchlist_id, category, entity_type, vehicle_number, vehicle_type, vehicle_color, owner_ref, person_name, person_alias, case_number, status, priority, department, notes, expiry_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?, ?, ?)
  `).run(id, watchlistId, category || 'OTHER', entity_type || 'VEHICLE', vehicle_number || null, vehicle_type || null, vehicle_color || null, owner_ref || null, person_name || null, person_alias || null, case_number || null, priority || 'MEDIUM', department || 'Gujarat Police', notes || null, expiry_date || null);

  const entry = db.prepare('SELECT * FROM watchlist_entries WHERE id = ?').get(id);
  res.status(201).json(entry);
});

// PUT /api/watchlist/:id
router.put('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const fields = ['category', 'vehicle_number', 'vehicle_type', 'vehicle_color', 'person_name', 'case_number', 'status', 'priority', 'department', 'notes', 'expiry_date'];
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

  db.prepare(`UPDATE watchlist_entries SET ${updates.join(', ')} WHERE watchlist_id = ? OR id = ?`).run(...params);
  const entry = db.prepare('SELECT * FROM watchlist_entries WHERE watchlist_id = ? OR id = ?').get(req.params.id, req.params.id);
  res.json(entry);
});

// DELETE /api/watchlist/:id
router.delete('/:id', (req: Request, res: Response) => {
  const db = getDb();
  db.prepare('DELETE FROM watchlist_entries WHERE watchlist_id = ? OR id = ?').run(req.params.id, req.params.id);
  res.json({ success: true });
});

// POST /api/watchlist/check — Check if a plate matches watchlist
router.post('/check', (req: Request, res: Response) => {
  const db = getDb();
  const { plate } = req.body;
  if (!plate) { res.status(400).json({ error: 'plate required' }); return; }
  const normalized = plate.replace(/[\s-]/g, '').toUpperCase();
  const match = db.prepare("SELECT * FROM watchlist_entries WHERE vehicle_number = ? AND status = 'ACTIVE'").get(normalized);
  res.json({ match: match || null, found: !!match });
});

export default router;
