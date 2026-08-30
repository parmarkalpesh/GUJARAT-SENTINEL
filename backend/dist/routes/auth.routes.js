"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// ============================================================
// Gujarat Sentinel — Auth Routes
// ============================================================
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../database/db");
const env_1 = require("../config/env");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// POST /api/auth/login
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ error: 'Username and password required' });
        return;
    }
    const db = (0, db_1.getDb)();
    const user = db.prepare('SELECT * FROM users WHERE username = ? AND is_active = 1').get(username);
    if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
    }
    const valid = bcryptjs_1.default.compareSync(password, user.password_hash);
    if (!valid) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
    }
    // Update last login
    db.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").run(user.id);
    // Generate token
    const payload = {
        userId: user.id,
        username: user.username,
        role: user.role,
        department: user.department,
    };
    const token = jsonwebtoken_1.default.sign(payload, env_1.config.jwt.secret, { expiresIn: env_1.config.jwt.expiresIn });
    // Audit log
    db.prepare("INSERT INTO audit_logs (id, user_id, username, action, entity_type, entity_id, ip_address, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))").run(require('uuid').v4(), user.id, user.username, 'LOGIN', 'USER', user.id, req.ip || '0.0.0.0');
    res.json({
        token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            department: user.department,
        },
    });
});
// GET /api/auth/me
router.get('/me', auth_1.authenticate, (req, res) => {
    const db = (0, db_1.getDb)();
    const user = db.prepare('SELECT id, username, email, full_name, role, department, last_login, created_at FROM users WHERE id = ?').get(req.user.userId);
    if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
    }
    res.json(user);
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map