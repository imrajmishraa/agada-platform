export declare class SimpleSyncService {
    private static instance;
    private isSyncing;
    static getInstance(): SimpleSyncService;
    sync(): Promise<void>;
    private getPendingRecords;
    private groupByService;
    private syncToService;
    private markSynced;
    private getToken;
    private updateSyncStatus;
    addPendingRecord(record: any): Promise<void>;
}
//# sourceMappingURL=SimpleSyncService.d.ts.map