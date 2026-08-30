import { initDatabase, getFirst } from './database';
import { runMigrations } from './database/migrations';

const initializeApp = async () => {
  // 1. Ensure base tables exist
  await initDatabase();

  // 2. Read current schema version from meta table
  const result = await getFirst('SELECT value FROM meta WHERE key = "schema_version"');
  const currentVersion = result ? parseInt(result.value, 10) : 1;

  // 3. Run any pending migrations
  await runMigrations(currentVersion);

  // 4. Continue app startup...
};

initializeApp();