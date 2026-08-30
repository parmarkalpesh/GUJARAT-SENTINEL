"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.app = void 0;
// ============================================================
// Gujarat Sentinel — Main Server
// AI-Powered Police Video Intelligence Platform
// ============================================================
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("./config/env");
const db_1 = require("./database/db");
const auth_1 = require("./middleware/auth");
// Routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const cameras_routes_1 = __importDefault(require("./routes/cameras.routes"));
const vehicles_routes_1 = __importDefault(require("./routes/vehicles.routes"));
const watchlist_routes_1 = __importDefault(require("./routes/watchlist.routes"));
const alerts_routes_1 = __importDefault(require("./routes/alerts.routes"));
const other_routes_1 = require("./routes/other.routes");
// Services
const demo_engine_service_1 = require("./services/demo-engine.service");
// ── Initialize ──
const app = (0, express_1.default)();
exports.app = app;
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: env_1.config.cors.origin,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    },
});
exports.io = io;
// ── Database ──
(0, db_1.initDatabase)();
// ── Middleware ──
app.use((0, helmet_1.default)({ contentSecurityPolicy: false }));
app.use((0, cors_1.default)({ origin: env_1.config.cors.origin, credentials: true }));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: { error: 'Too many requests, please try again later' },
});
app.use('/api/', limiter);
// ── Public Routes ──
app.use('/api/auth', auth_routes_1.default);
app.use('/api/health', other_routes_1.healthRouter);
// ── Protected Routes ──
app.use('/api/dashboard', auth_1.authenticate, dashboard_routes_1.default);
app.use('/api/cameras', auth_1.authenticate, cameras_routes_1.default);
app.use('/api/vehicles', auth_1.authenticate, vehicles_routes_1.default);
app.use('/api/watchlist', auth_1.authenticate, watchlist_routes_1.default);
app.use('/api/alerts', auth_1.authenticate, alerts_routes_1.default);
app.use('/api/incidents', auth_1.authenticate, other_routes_1.incidentRouter);
app.use('/api/events', auth_1.authenticate, other_routes_1.eventsRouter);
app.use('/api/audit', auth_1.authenticate, other_routes_1.auditRouter);
app.use('/api/users', auth_1.authenticate, other_routes_1.usersRouter);
app.use('/api/integrations', auth_1.authenticate, other_routes_1.integrationsRouter);
app.use('/api/system', auth_1.authenticate, other_routes_1.systemRouter);
app.use('/api/reports', auth_1.authenticate, other_routes_1.reportsRouter);
app.use('/api/search', auth_1.authenticate, other_routes_1.searchRouter);
// ── Demo Routes ──
app.post('/api/demo/start', auth_1.authenticate, (_req, res) => {
    if ((0, demo_engine_service_1.isDemoRunning)()) {
        res.status(400).json({ error: 'Demo already running' });
        return;
    }
    (0, demo_engine_service_1.startMissionSentry)(io);
    res.json({ status: 'started', message: 'Mission Sentry demo started' });
});
app.post('/api/demo/stop', auth_1.authenticate, (_req, res) => {
    (0, demo_engine_service_1.stopDemo)();
    io.emit('demo:complete', { message: 'Demo stopped by operator' });
    res.json({ status: 'stopped' });
});
app.get('/api/demo/status', (_req, res) => {
    res.json({ running: (0, demo_engine_service_1.isDemoRunning)() });
});
// ── WebSocket ──
io.on('connection', (socket) => {
    console.log(`[WS] Client connected: ${socket.id}`);
    socket.on('join:control-room', () => {
        socket.join('control-room');
        console.log(`[WS] ${socket.id} joined control-room`);
    });
    socket.on('disconnect', () => {
        console.log(`[WS] Client disconnected: ${socket.id}`);
    });
});
// Make io accessible for routes
app.set('io', io);
// ── Serve Frontend SPA ──
const path_1 = __importDefault(require("path"));
const frontendDist = path_1.default.join(__dirname, '../../frontend/dist');
app.use(express_1.default.static(frontendDist));
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api'))
        return next();
    res.sendFile(path_1.default.join(frontendDist, 'index.html'));
});
// ── Error Handler ──
app.use((err, _req, res, _next) => {
    console.error('[ERROR]', err);
    res.status(err.status || 500).json({
        error: env_1.config.nodeEnv === 'production' ? 'Internal server error' : err.message,
    });
});
// ── Start Server ──
httpServer.listen(env_1.config.port, () => {
    console.log(`
╔══════════════════════════════════════════════════════╗
║                                                      ║
║          🛡️  GUJARAT SENTINEL                         ║
║          AI-Powered Police Intelligence Platform     ║
║                                                      ║
║          Server: http://localhost:${env_1.config.port}              ║
║          Environment: ${env_1.config.nodeEnv}                      ║
║          Demo Mode: ${env_1.config.demoMode ? 'ENABLED' : 'DISABLED'}                       ║
║                                                      ║
║          ⚠ DEMONSTRATION DATA ONLY                   ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
  `);
});
//# sourceMappingURL=server.js.map