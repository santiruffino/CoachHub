import { openDB, type DBSchema } from 'idb';

interface PTDB extends DBSchema {
    exercises: {
        key: string;
        value: {
            id: string;
            title: string;
            defaultSeriesSpec: string;
            videoUrl?: string;
        };
    };
    plans: {
        key: string;
        value: {
            id: string;
            title: string;
            days: any[];
        };
    };
    assignments: {
        key: string;
        value: any;
    };
    workout_logs: {
        key: string;
        value: any;
    };
    sync_queue: {
        key: string;
        value: {
            id: string;
            type: 'LOG_WORKOUT';
            payload: any;
            timestamp: number;
        };
    };
}

export const dbPromise = openDB<PTDB>('pt-pwa-db', 2, {
    upgrade(db, oldVersion, _newVersion, _transaction) {
        if (oldVersion < 1) {
            db.createObjectStore('exercises', { keyPath: 'id' });
            db.createObjectStore('plans', { keyPath: 'id' });
            // db.createObjectStore('mutation_queue', { keyPath: 'id' }); // Removed in favor of sync_queue
        }
        if (oldVersion < 2) {
            if (!db.objectStoreNames.contains('assignments')) {
                db.createObjectStore('assignments', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('workout_logs')) {
                db.createObjectStore('workout_logs', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('sync_queue')) {
                db.createObjectStore('sync_queue', { keyPath: 'id' });
            }
        }
    },
});

export async function cacheExercises(exercises: any[]) {
    const db = await dbPromise;
    const tx = db.transaction('exercises', 'readwrite');
    await Promise.all([
        ...exercises.map(ex => tx.store.put(ex)),
        tx.done,
    ]);
}

export async function getCachedExercises() {
    const db = await dbPromise;
    return db.getAll('exercises');
}
