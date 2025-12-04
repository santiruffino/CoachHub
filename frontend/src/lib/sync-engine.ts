import { dbPromise } from './db';
import { api } from './api';

export interface SyncMutation {
    id: string;
    type: 'LOG_WORKOUT';
    payload: any;
    timestamp: number;
}

export class SyncEngine {
    private isSyncing = false;

    constructor() {
        window.addEventListener('online', () => this.sync());
    }

    async queueMutation(type: 'LOG_WORKOUT', payload: any) {
        const mutation: SyncMutation = {
            id: crypto.randomUUID(),
            type,
            payload,
            timestamp: Date.now(),
        };

        const db = await dbPromise;
        await db.put('sync_queue', mutation);

        if (navigator.onLine) {
            this.sync();
        }
    }

    async sync() {
        if (this.isSyncing || !navigator.onLine) return;

        this.isSyncing = true;
        try {
            const db = await dbPromise;
            const mutations = await db.getAll('sync_queue');

            if (mutations.length === 0) {
                this.isSyncing = false;
                return;
            }

            const response = await api.post('/sync/push', { mutations });
            const { processedIds } = response.data;

            const tx = db.transaction('sync_queue', 'readwrite');
            await Promise.all([
                ...processedIds.map((id: string) => tx.store.delete(id)),
                tx.done,
            ]);

            console.log(`Synced ${processedIds.length} mutations.`);
        } catch (error) {
            console.error('Sync failed:', error);
        } finally {
            this.isSyncing = false;
        }
    }

    async bootstrap() {
        if (!navigator.onLine) return;

        try {
            const response = await api.get('/sync/bootstrap');
            const { assignedPlans, exercises, workoutLogs } = response.data;

            const db = await dbPromise;
            const tx = db.transaction(['assignments', 'exercises', 'workout_logs'], 'readwrite');

            await Promise.all([
                ...assignedPlans.map((p: any) => tx.objectStore('assignments').put(p)),
                ...exercises.map((e: any) => tx.objectStore('exercises').put(e)),
                ...workoutLogs.map((l: any) => tx.objectStore('workout_logs').put(l)),
                tx.done,
            ]);

            console.log('Bootstrap complete.');
            window.dispatchEvent(new Event('sync-complete'));
        } catch (error) {
            console.error('Bootstrap failed:', error);
        }
    }
}

export const syncEngine = new SyncEngine();
