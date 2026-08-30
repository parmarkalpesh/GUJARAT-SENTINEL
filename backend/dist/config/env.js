"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
exports.config = {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    jwt: {
        secret: process.env.JWT_SECRET || 'gujarat-sentinel-default-secret',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    },
    db: {
        path: process.env.DB_PATH || path_1.default.join(__dirname, '../../data/sentinel.db'),
    },
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    },
    demoMode: process.env.DEMO_MODE === 'true',
};
//# sourceMappingURL=env.js.map