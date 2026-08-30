"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFirst = exports.query = exports.run = exports.initDatabase = void 0;
const SQLite = __importStar(require("expo-sqlite"));
const db = SQLite.openDatabaseSync('agada.db');
const SCHEMA_VERSION = 1;
const initDatabase = async () => {
    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS patients ( ... );
    CREATE TABLE IF NOT EXISTS triages ( ... );
    CREATE TABLE IF NOT EXISTS referrals ( ... );
    CREATE TABLE IF NOT EXISTS pending_records ( ... );
  `);
    // Create meta table if it doesn't exist
    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT)
  `);
    // Check if schema_version exists
    const versionRow = await db.getFirstAsync('SELECT value FROM meta WHERE key = "schema_version"');
    if (!versionRow) {
        await db.runAsync('INSERT INTO meta (key, value) VALUES ("schema_version", ?)', [
            String(SCHEMA_VERSION),
        ]);
    }
};
exports.initDatabase = initDatabase;
// Helper functions with correct typings
const run = async (sql, params = []) => {
    return await db.runAsync(sql, params);
};
exports.run = run;
const query = async (sql, params = []) => {
    return await db.getAllAsync(sql, params);
};
exports.query = query;
const getFirst = async (sql, params = []) => {
    return await db.getFirstAsync(sql, params);
};
exports.getFirst = getFirst;
exports.default = db;
//# sourceMappingURL=index.js.map