// ============================================================
// Gujarat Sentinel — Main Server
// AI-Powered Police Video Intelligence Platform
// ============================================================
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import rateLimit from 'express-rate-limit';

import { config } from './config/env';
import { initDatabase } from './database/db';
import { authenticate } from './middleware/auth';

// Routes
import authRoutes from './routes/auth.routes';
import dashboardRoutes from './routes/dashboard.routes';
import cameraRoutes from './routes/cameras.routes';
import vehicleRoutes from './routes/vehicles.routes';
import watchlistRoutes from './routes/watchlist.routes';
import alertRoutes from './routes/alerts.routes';
import {
  incidentRouter, eventsRouter, auditRouter, healthRouter,
  usersRouter, integrationsRouter, systemRouter, reportsRouter, searchRouter
} from './routes/other.routes';

// Services
import { startMissionSentry, stopDemo, isDemoRunning } from './services/demo-engine.service';

// ── Initialize ──
const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config.cors.origin,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// ── Database ──
initDatabase();

// ── Middleware ──
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Too many requests, please try again later' },
});
app.use('/api/', limiter);

// ── Public Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/health', healthRouter);

// GET /api/ingest — Live Hackathon Camera Stream Catalogue Contract
app.get('/api/ingest', async (req, res) => {
  try {
    const remoteRes = await fetch('https://live.corp8.cloud/api/ingest', {
      signal: AbortSignal.timeout(4000),
    });
    if (remoteRes.ok) {
      const data = (await remoteRes.json()) as any;
      if (data && Array.isArray(data.cameras)) {
        const enriched = data.cameras.map((c: any) => ({
          ...c,
          hls_url: `https://live.corp8.cloud${c.hls_live_url}`,
          hls_live_url: `https://live.corp8.cloud${c.hls_live_url}`,
        }));
        return res.json({
          source: 'https://live.corp8.cloud/api/ingest',
          status: 'live_connected',
          total_cameras: enriched.length,
          active_streams: enriched.filter((c: any) => c.live).length,
          contract_version: '2026.1',
          cameras: enriched,
          catalogue: enriched,
        });
      }
    }
  } catch (e) {
    console.warn('[Ingest] Remote gateway timeout, falling back to local registry');
  }

  // Fallback to local database registry
  const db = (require('./database/db')).getDb();
  const cameras = db.prepare('SELECT * FROM cameras ORDER BY camera_id ASC').all() as any[];
  const host = req.hostname || 'localhost';

  const catalogue = cameras.map((cam, idx) => {
    const streamId = idx + 1;
    const isH265 = idx % 4 === 0;
    return {
      id: String(streamId),
      number: streamId,
      name: cam.name,
      location: cam.location,
      district: cam.district,
      department: cam.department,
      codec: isH265 ? 'hevc' : 'h264',
      live: cam.status === 'ONLINE',
      stream_properties: {
        resolution: cam.resolution || '1920x1080',
        fps: cam.fps || 25,
        bitrate_kbps: isH265 ? 2500 : 4000,
        transport: 'tcp',
        timing: 'monotonic_pts',
      },
      rtsp_url: `rtsp://live.corp8.cloud:8554/stream/${streamId}`,
      webrtc_url: `http://live.corp8.cloud:8889/stream/${streamId}/whep`,
      hls_url: `https://live.corp8.cloud/live/stream/${streamId}/index.m3u8`,
      hls_live_url: `https://live.corp8.cloud/live/stream/${streamId}/index.m3u8`,
    };
  });

  res.json({
    source: 'local_registry_fallback',
    status: 'operational',
    total_cameras: catalogue.length,
    active_streams: catalogue.filter(c => c.live).length,
    contract_version: '2026.1',
    cameras: catalogue,
    catalogue,
  });
});

// ── Protected Routes ──
app.use('/api/dashboard', authenticate, dashboardRoutes);
app.use('/api/cameras', authenticate, cameraRoutes);
app.use('/api/vehicles', authenticate, vehicleRoutes);
app.use('/api/watchlist', authenticate, watchlistRoutes);
app.use('/api/alerts', authenticate, alertRoutes);
app.use('/api/incidents', authenticate, incidentRouter);
app.use('/api/events', authenticate, eventsRouter);
app.use('/api/audit', authenticate, auditRouter);
app.use('/api/users', authenticate, usersRouter);
app.use('/api/integrations', authenticate, integrationsRouter);
app.use('/api/system', authenticate, systemRouter);
app.use('/api/reports', authenticate, reportsRouter);
app.use('/api/search', authenticate, searchRouter);

// ── Demo Routes ──
app.post('/api/demo/start', authenticate, (_req, res) => {
  if (isDemoRunning()) {
    res.status(400).json({ error: 'Demo already running' });
    return;
  }
  startMissionSentry(io);
  res.json({ status: 'started', message: 'Mission Sentry demo started' });
});

app.post('/api/demo/stop', authenticate, (_req, res) => {
  stopDemo();
  io.emit('demo:complete', { message: 'Demo stopped by operator' });
  res.json({ status: 'stopped' });
});

app.get('/api/demo/status', (_req, res) => {
  res.json({ running: isDemoRunning() });
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
import path from 'path';
const frontendDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// ── Error Handler ──
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ERROR]', err);
  res.status(err.status || 500).json({
    error: config.nodeEnv === 'production' ? 'Internal server error' : err.message,
  });
});

// ── Start Server ──
httpServer.listen(config.port, () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║                                                      ║
║          🛡️  GUJARAT SENTINEL                         ║
║          AI-Powered Police Intelligence Platform     ║
║                                                      ║
║          Server: http://localhost:${config.port}              ║
║          Environment: production                     ║
║          Surveillance Grid: ACTIVE                   ║
║                                                      ║
║          🔒 STATE CRIME RECORDS BUREAU GUJARAT       ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
  `);
});

export { app, io };
