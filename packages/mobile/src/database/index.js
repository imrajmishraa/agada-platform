import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabaseSync('agada.db');
const SCHEMA_VERSION = 1;
export const initDatabase = async () => {
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
// Helper functions with correct typings
export const run = async (sql, params = []) => {
    return await db.runAsync(sql, params);
};
export const query = async (sql, params = []) => {
    return await db.getAllAsync(sql, params);
};
export const getFirst = async (sql, params = []) => {
    return await db.getFirstAsync(sql, params);
};
export default db;
//# sourceMappingURL=index.js.map