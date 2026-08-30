import * as SQLite from 'expo-sqlite';
declare const db: SQLite.SQLiteDatabase;
export declare const initDatabase: () => Promise<void>;
export declare const run: (sql: string, params?: any[]) => Promise<SQLite.SQLiteRunResult>;
export declare const query: <T = any>(sql: string, params?: any[]) => Promise<T[]>;
export declare const getFirst: <T = any>(sql: string, params?: any[]) => Promise<T | null>;
export default db;
//# sourceMappingURL=index.d.ts.map