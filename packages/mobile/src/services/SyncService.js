import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { query, run, initDatabase } from '../database';
export class SyncService {
    static instance;
    isSyncing = false;
    static getInstance() {
        if (!SyncService.instance) {
            SyncService.instance = new SyncService();
        }
        return SyncService.instance;
    }
    async initialize() {
        await initDatabase();
    }
    async sync() {
        const netInfo = await NetInfo.fetch();
        if (!netInfo.isConnected || this.isSyncing)
            return;
        this.isSyncing = true;
        try {
            const pendingRecords = await query('SELECT * FROM pending_records WHERE synced = 0');
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
            await run(`UPDATE pending_records SET synced = 1, synced_at = ? WHERE id IN (${placeholders})`, [Date.now(), ...ids]);
        }
        else {
            for (const record of records) {
                await run('UPDATE pending_records SET attempts = attempts + 1 WHERE id = ?', [record.id]);
            }
        }
    }
    async getToken() {
        return (await AsyncStorage.getItem('auth_token')) || '';
    }
    async updateSyncStatus() {
        await AsyncStorage.setItem('last_sync', new Date().toISOString());
    }
    async addPendingRecord(record) {
        await run(`INSERT INTO pending_records 
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
//# sourceMappingURL=SyncService.js.map