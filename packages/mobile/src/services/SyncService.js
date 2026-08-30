"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncService = void 0;
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
const netinfo_1 = __importDefault(require("@react-native-community/netinfo"));
const database_1 = require("../database");
class SyncService {
    static instance;
    isSyncing = false;
    static getInstance() {
        if (!SyncService.instance) {
            SyncService.instance = new SyncService();
        }
        return SyncService.instance;
    }
    async initialize() {
        await (0, database_1.initDatabase)();
    }
    async sync() {
        const netInfo = await netinfo_1.default.fetch();
        if (!netInfo.isConnected || this.isSyncing)
            return;
        this.isSyncing = true;
        try {
            const pendingRecords = await (0, database_1.query)('SELECT * FROM pending_records WHERE synced = 0');
            if (pendingRecords.length === 0) {
                await this.updateSyncStatus();
                return;
            }
            const grouped = this.groupByService(pendingRecords);
            for (const [service, records] of Object.entries(grouped)) {
                await this.syncToService(service, records);
            }
            await this.updateSyncStatus();
        }
        catch (error) {
            console.error('Sync failed:', error);
        }
        finally {
            this.isSyncing = false;
        }
    }
    groupByService(records) {
        return records.reduce((acc, record) => {
            const service = record.service || 'default';
            if (!acc[service])
                acc[service] = [];
            acc[service].push(record);
            return acc;
        }, {});
    }
    async syncToService(service, records) {
        const url = `https://api.agada.in/${service}/sync`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${await this.getToken()}`,
            },
            body: JSON.stringify({ records }),
        });
        if (response.ok) {
            const ids = records.map(r => r.id);
            const placeholders = ids.map(() => '?').join(',');
            await (0, database_1.run)(`UPDATE pending_records SET synced = 1, synced_at = ? WHERE id IN (${placeholders})`, [Date.now(), ...ids]);
        }
        else {
            for (const record of records) {
                await (0, database_1.run)('UPDATE pending_records SET attempts = attempts + 1 WHERE id = ?', [record.id]);
            }
        }
    }
    async getToken() {
        return (await async_storage_1.default.getItem('auth_token')) || '';
    }
    async updateSyncStatus() {
        await async_storage_1.default.setItem('last_sync', new Date().toISOString());
    }
    async addPendingRecord(record) {
        await (0, database_1.run)(`INSERT INTO pending_records 
       (id, record_id, service, operation, data, created_at, updated_at, synced, attempts)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            Date.now().toString(),
            record.recordId || record.id,
            record.service,
            record.operation,
            JSON.stringify(record.data),
            Date.now(),
            Date.now(),
            0,
            0,
        ]);
    }
}
exports.SyncService = SyncService;
//# sourceMappingURL=SyncService.js.map