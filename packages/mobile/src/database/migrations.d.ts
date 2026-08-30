import * as SQLite from 'expo-sqlite';
type Migration = {
    version: number;
    up: (db: SQLite.SQLiteDatabase) => Promise<void>;
};
export declare const migrations: Migration[];
export declare const runMigrations: (currentSchemaVersion: number) => Promise<void>;
export {};
//# sourceMappingURL=migrations.d.ts.map