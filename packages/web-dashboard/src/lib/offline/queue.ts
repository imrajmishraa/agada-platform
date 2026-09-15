import { SyncQueue } from '@agada/shared/sync';
import { localStorageAdapter } from './storage';

export const syncQueue = new SyncQueue(localStorageAdapter);
