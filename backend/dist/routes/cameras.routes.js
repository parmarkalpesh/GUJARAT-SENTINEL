"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// ============================================================
// Gujarat Sentinel — Camera Routes
// ============================================================
const express_1 = require("express");
const uuid_1 = require("uuid");
const db_1 = require("../database/db");
const router = (0, express_1.Router)();
// GET /api/cameras
router.get('/', (req, res) => {
    const db = (0, db_1.getDb)();
    const { department, district, status, search } = req.query;
    let query = 'SELECT * FROM cameras WHERE 1=1';
    const params = [];
    if (department) {
        query += ' AND department = ?';
        params.push(department);
    }
    if (district) {
        query += ' AND district = ?';
        params.push(district);
    }
    if (status) {
        query += ' AND status = ?';
        params.push(status);
    }
    if (search) {
        query += ' AND (camera_id LIKE ? OR name LIKE ? OR location LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY camera_id ASC';
    const cameras = db.prepare(query).all(...params);
    res.json(cameras);
});
// GET /api/cameras/:id
router.get('/:id', (req, res) => {
    const db = (0, db_1.getDb)();
    const camera = db.prepare('SELECT * FROM cameras WHERE camera_id = ? OR id = ?').get(req.params.id, req.params.id);
    if (!camera) {
        res.status(404).json({ error: 'Camera not found' });
        return;
    }
    res.json(camera);
});
// POST /api/cameras
router.post('/', (req, res) => {
    const db = (0, db_1.getDb)();
    const id = (0, uuid_1.v4)();
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
router.put('/:id', (req, res) => {
    const db = (0, db_1.getDb)();
    const fields = ['name', 'department', 'location', 'district', 'latitude', 'longitude', 'camera_type', 'vendor', 'model', 'protocol', 'vms', 'status', 'health_status'];
    const updates = [];
    const params = [];
    for (const field of fields) {
        if (req.body[field] !== undefined) {
            updates.push(`${field} = ?`);
            params.push(req.body[field]);
        }
    }
    if (updates.length === 0) {
        res.status(400).json({ error: 'No fields to update' });
        return;
    }
    updates.push("updated_at = datetime('now')");
    params.push(req.params.id, req.params.id);
    db.prepare(`UPDATE cameras SET ${updates.join(', ')} WHERE camera_id = ? OR id = ?`).run(...params);
    const camera = db.prepare('SELECT * FROM cameras WHERE camera_id = ? OR id = ?').get(req.params.id, req.params.id);
    res.json(camera);
});
// DELETE /api/cameras/:id
router.delete('/:id', (req, res) => {
    const db = (0, db_1.getDb)();
    db.prepare('DELETE FROM cameras WHERE camera_id = ? OR id = ?').run(req.params.id, req.params.id);
    res.json({ success: true });
});
// GET /api/cameras/stats/summary
router.get('/stats/summary', (_req, res) => {
    const db = (0, db_1.getDb)();
    const stats = {
        total: db.prepare('SELECT COUNT(*) as c FROM cameras').get().c,
        online: db.prepare("SELECT COUNT(*) as c FROM cameras WHERE status = 'ONLINE'").get().c,
        offline: db.prepare("SELECT COUNT(*) as c FROM cameras WHERE status = 'OFFLINE'").get().c,
        warning: db.prepare("SELECT COUNT(*) as c FROM cameras WHERE status = 'WARNING'").get().c,
        departments: db.prepare('SELECT department, COUNT(*) as count FROM cameras GROUP BY department').all(),
        districts: db.prepare('SELECT district, COUNT(*) as count FROM cameras GROUP BY district').all(),
    };
    res.json(stats);
});
exports.default = router;
//# sourceMappingURL=cameras.routes.js.map