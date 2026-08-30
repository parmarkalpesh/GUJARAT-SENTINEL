import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'gujarat-sentinel-default-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  db: {
    path: process.env.DB_PATH || path.join(__dirname, '../../data/sentinel.db'),
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  demoMode: process.env.DEMO_MODE === 'true',
};
