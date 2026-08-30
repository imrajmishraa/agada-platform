import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export class SimpleSyncService {
  private static instance: SimpleSyncService;
  private isSyncing = false;

  static getInstance(): SimpleSyncService {
    if (!SimpleSyncService.instance) {
      SimpleSyncService.instance = new SimpleSyncService();
    }
    return SimpleSyncService.instance;
  }

  async sync(): Promise<void> {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected || this.isSyncing) return;

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
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  private async getPendingRecords(): Promise<any[]> {
    const stored = await AsyncStorage.getItem('pending_records');
    if (!stored) return [];
    const records = JSON.parse(stored);
    // Return only unsynced records
    return records.filter((r: any) => !r.synced);
  }

  private groupByService(records: any[]): Record<string, any[]> {
    return records.reduce((acc, record) => {
      const service = record.service || 'default';
      if (!acc[service]) acc[service] = [];
      acc[service].push(record);
      return acc;
    }, {} as Record<string, any[]>);
  }

  private async syncToService(service: string, records: any[]): Promise<void> {
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

  private async markSynced(records: any[]): Promise<void> {
    const stored = await AsyncStorage.getItem('pending_records');
    const allRecords = stored ? JSON.parse(stored) : [];
    const recordIds = records.map(r => r.id);
    
    const updatedRecords = allRecords.map((r: any) => {
      if (recordIds.includes(r.id)) {
        return { ...r, synced: true, syncedAt: new Date().toISOString() };
      }
      return r;
    });

    await AsyncStorage.setItem('pending_records', JSON.stringify(updatedRecords));
  }

  private async getToken(): Promise<string> {
    return (await AsyncStorage.getItem('auth_token')) || '';
  }

  private async updateSyncStatus(): Promise<void> {
    await AsyncStorage.setItem('last_sync', new Date().toISOString());
  }

  // Add a record to be synced later
  async addPendingRecord(record: any): Promise<void> {
    const stored = await AsyncStorage.getItem('pending_records');
    const records = stored ? JSON.parse(stored) : [];
    records.push({
      ...record,
      id: Date.now().toString(),
      synced: false,
      createdAt: new Date().toISOString(),
      attempts: 0,
    });
    await AsyncStorage.setItem('pending_records', JSON.stringify(records));
  }
}