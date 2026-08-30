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
exports.runMigrations = exports.migrations = void 0;
const index_1 = require("./index");
const SQLite = __importStar(require("expo-sqlite"));
exports.migrations = [
    {
        version: 2,
        up: async (db) => {
            // Example: Add a new column to patients table
            await db.execAsync(`
        ALTER TABLE patients ADD COLUMN blood_group TEXT;
      `);
        },
    },
    {
        version: 3,
        up: async (db) => {
            // Example: Add a new table for medications
            await db.execAsync(`
        CREATE TABLE IF NOT EXISTS medications (
          id TEXT PRIMARY KEY,
          patient_id TEXT,
          name TEXT,
          dosage TEXT,
          frequency TEXT,
          start_date INTEGER,
          end_date INTEGER,
          created_at INTEGER,
          synced INTEGER DEFAULT 0
        );
      `);
        },
    },
];
const runMigrations = async (currentSchemaVersion) => {
    const db = SQLite.openDatabaseSync('agada.db');
    for (const migration of exports.migrations) {
        if (migration.version > currentSchemaVersion) {
            console.log(`Applying migration to version ${migration.version}`);
            await migration.up(db);
        }
    }
    // Update schema version in meta table
    const maxVersion = exports.migrations.reduce((max, m) => Math.max(max, m.version), 1);
    await (0, index_1.run)('UPDATE meta SET value = ? WHERE key = "schema_version"', [String(maxVersion)]);
};
exports.runMigrations = runMigrations;
//# sourceMappingURL=migrations.js.map