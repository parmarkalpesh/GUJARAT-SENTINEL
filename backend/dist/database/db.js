"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDb = getDb;
exports.initDatabase = initDatabase;
exports.closeDatabase = closeDatabase;
// ============================================================
// Gujarat Sentinel — Database Manager
// ============================================================
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const env_1 = require("../config/env");
let db;
function getDb() {
    if (!db) {
        throw new Error('Database not initialized. Call initDatabase() first.');
    }
    return db;
}
function initDatabase() {
    // Ensure data directory exists
    const dbDir = path_1.default.dirname(env_1.config.db.path);
    if (!fs_1.default.existsSync(dbDir)) {
        fs_1.default.mkdirSync(dbDir, { recursive: true });
    }
    db = new better_sqlite3_1.default(env_1.config.db.path);
    // Enable WAL mode for better concurrent performance
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    // Run schema
    const schemaPath = path_1.default.join(__dirname, 'schema.sql');
    const schema = fs_1.default.readFileSync(schemaPath, 'utf-8');
    db.exec(schema);
    console.log('[DB] Database initialized at:', env_1.config.db.path);
    return db;
}
function closeDatabase() {
    if (db) {
        db.close();
        console.log('[DB] Database connection closed.');
    }
}
//# sourceMappingURL=db.js.map