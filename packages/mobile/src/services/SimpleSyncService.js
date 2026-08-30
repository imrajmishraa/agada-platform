"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleSyncService = void 0;
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
const netinfo_1 = __importDefault(require("@react-native-community/netinfo"));
class SimpleSyncService {
    static instance;
    isSyncing = false;
    static getInstance() {
        if (!SimpleSyncService.instance) {
            SimpleSyncService.instance = new SimpleSyncService();
        }
        return SimpleSyncService.instance;
    }
    async sync() {
        const netInfo = await netinfo_1.default.fetch();
        if (!netInfo.isConnected || this.isSyncing)
            return;
        this.isSyncing = true;
        try {
            // Get pending records
            const pendingRecords = await this.getPendingRecords();
            if (pendingRecords.length === 0) {
                await this.updateSyncStatus();
                return;
            }
            // Group by service
            const grouped = this.groupByService(pendingRecords);
            // Sync each group
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
    async getPendingRecords() {
        const stored = await async_storage_1.default.getItem('pending_records');
        if (!stored)
            return [];
        const records = JSON.parse(stored);
        // Return only unsynced records
        return records.filter((r) => !r.synced);
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
            await this.markSynced(records);
        }
    }
    async markSynced(records) {
        const stored = await async_storage_1.default.getItem('pending_records');
        const allRecords = stored ? JSON.parse(stored) : [];
        const recordIds = records.map(r => r.id);
        const updatedRecords = allRecords.map((r) => {
            if (recordIds.includes(r.id)) {
                return { ...r, synced: true, syncedAt: new Date().toISOString() };
            }
            return r;
        });
        await async_storage_1.default.setItem('pending_records', JSON.stringify(updatedRecords));
    }
    async getToken() {
        return (await async_storage_1.default.getItem('auth_token')) || '';
    }
    async updateSyncStatus() {
        await async_storage_1.default.setItem('last_sync', new Date().toISOString());
    }
    // Add a record to be synced later
    async addPendingRecord(record) {
        const stored = await async_storage_1.default.getItem('pending_records');
        const records = stored ? JSON.parse(stored) : [];
        records.push({
            ...record,
            id: Date.now().toString(),
            synced: false,
            createdAt: new Date().toISOString(),
            attempts: 0,
        });
        await async_storage_1.default.setItem('pending_records', JSON.stringify(records));
    }
}
exports.SimpleSyncService = SimpleSyncService;
//# sourceMappingURL=SimpleSyncService.js.map