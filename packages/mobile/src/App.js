"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("./database");
const migrations_1 = require("./database/migrations");
const initializeApp = async () => {
    // 1. Ensure base tables exist
    await (0, database_1.initDatabase)();
    // 2. Read current schema version from meta table
    const result = await (0, database_1.getFirst)('SELECT value FROM meta WHERE key = "schema_version"');
    const currentVersion = result ? parseInt(result.value, 10) : 1;
    // 3. Run any pending migrations
    await (0, migrations_1.runMigrations)(currentVersion);
    // 4. Continue app startup...
};
initializeApp();
//# sourceMappingURL=App.js.map