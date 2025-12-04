export interface SeriesSet {
    reps?: number;
    time?: number; // seconds
    weight?: number; // placeholder, usually user input
}

export function parseSeriesSpec(spec: string, type: 'REPS' | 'TIME'): SeriesSet[] {
    // Example: "3x10" -> 3 sets of 10 reps
    // Example: "4x(10,10,8,8)" -> 4 sets with specific reps
    // Example: "3x30s" -> 3 sets of 30 seconds

    const sets: SeriesSet[] = [];
    const cleanSpec = spec.replace(/\s/g, '').toLowerCase();

    // Simple format: NxM (e.g., 3x10)
    const simpleMatch = cleanSpec.match(/^(\d+)x(\d+)(s?)$/);
    if (simpleMatch) {
        const count = parseInt(simpleMatch[1], 10);
        const value = parseInt(simpleMatch[2], 10);
        const isSeconds = simpleMatch[3] === 's';

        for (let i = 0; i < count; i++) {
            if (type === 'TIME' || isSeconds) {
                sets.push({ time: value });
            } else {
                sets.push({ reps: value });
            }
        }
        return sets;
    }

    // Complex format: Nx(A,B,C...) (e.g., 4x(10,10,8,8))
    // Note: The 'N' here is redundant if the list has N items, but often used for clarity.
    // We'll trust the list length if present.
    const complexMatch = cleanSpec.match(/^\d+x\(([\d,]+)\)$/);
    if (complexMatch) {
        const values = complexMatch[1].split(',').map(v => parseInt(v, 10));
        values.forEach(val => {
            if (type === 'TIME') {
                sets.push({ time: val });
            } else {
                sets.push({ reps: val });
            }
        });
        return sets;
    }

    return [];
}

export function validateSeriesSpec(spec: string): boolean {
    // Basic regex validation
    const simpleRegex = /^\d+x\d+s?$/;
    const complexRegex = /^\d+x\([\d,]+\)$/;
    return simpleRegex.test(spec.replace(/\s/g, '')) || complexRegex.test(spec.replace(/\s/g, ''));
}
