import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { database } from "../database";

export class SyncService {
  private static instance: SyncService;
  private isSyncing = false;
  private syncQueue: any[] = [];

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  async sync(): Promise<void> {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected || this.isSyncing) return;

    this.isSyncing = true;
    try {
      // Get pending records from offline DB
      const pendingRecords = await this.getPendingRecords();

      // Group by service type
      const grouped = this.groupByService(pendingRecords);

      // Sync each group
      for (const [service, records] of Object.entries(grouped)) {
        await this.syncToService(service, records);
      }

      // Update sync status
      await this.updateSyncStatus();
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      this.isSyncing = false;
    }
  }

  private async getPendingRecords(): Promise<any[]> {
    // Query local DB for unsynced records
    const records = await database.get("pending_records").query().fetch();
    return records;
  }

  private groupByService(records: any[]): Record<string, any[]> {
    return records.reduce(
      (acc, record) => {
        const service = record.service || "default";
        if (!acc[service]) acc[service] = [];
        acc[service].push(record);
        return acc;
      },
      {} as Record<string, any[]>,
    );
  }

  private async syncToService(service: string, records: any[]): Promise<void> {
    // Send to appropriate service
    const url = `https://api.agada.in/${service}/sync`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await this.getToken()}`,
      },
      body: JSON.stringify({ records }),
    });

    if (response.ok) {
      // Mark as synced in local DB
      await this.markSynced(records);
    }
  }

  private async markSynced(records: any[]): Promise<void> {
    const ids = records.map((r) => r.id);
    await database
      .get("pending_records")
      .query()
      .where("id", "in", ids)
      .update({ synced: true, syncedAt: new Date() });
  }

  private async getToken(): Promise<string> {
    return (await AsyncStorage.getItem("auth_token")) || "";
  }

  private async updateSyncStatus(): Promise<void> {
    const timestamp = new Date().toISOString();
    await AsyncStorage.setItem("last_sync", timestamp);
  }
}
