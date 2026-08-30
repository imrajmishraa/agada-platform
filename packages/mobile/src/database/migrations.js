import { run } from './index';
import * as SQLite from 'expo-sqlite';
export const migrations = [
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
export const runMigrations = async (currentSchemaVersion) => {
    const db = SQLite.openDatabaseSync('agada.db');
    for (const migration of migrations) {
        if (migration.version > currentSchemaVersion) {
            console.log(`Applying migration to version ${migration.version}`);
            await migration.up(db);
        }
    }
    // Update schema version in meta table
    const maxVersion = migrations.reduce((max, m) => Math.max(max, m.version), 1);
    await run('UPDATE meta SET value = ? WHERE key = "schema_version"', [String(maxVersion)]);
};
//# sourceMappingURL=migrations.js.map