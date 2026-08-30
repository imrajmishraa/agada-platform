export declare class SyncService {
    private static instance;
    private isSyncing;
    static getInstance(): SyncService;
    initialize(): Promise<void>;
    sync(): Promise<void>;
    private groupByService;
    private syncToService;
    private getToken;
    private updateSyncStatus;
    addPendingRecord(record: any): Promise<void>;
}
//# sourceMappingURL=SyncService.d.ts.map