import type { BackupLog, BackupStatus } from "../types";

export function generateMockLogs(count = 5000): BackupLog[] {
    const clouds: Array<'AWS' | 'Azure' | 'GCP'> = ['AWS', 'Azure', 'GCP'];
    const statuses: BackupStatus[] = ['SUCCESS', 'RUNNING', 'FAILED'];

    return Array.from({ length: count }, (_, i) => ({
        id: `LOG-${10000 + i}`,
        source: `vm-prod-workload-${(i % 150) + 1}.domain.internal`,
        targetCloud: clouds[i % 3],
        sizeGB: Math.floor(Math.random() * 900) + 50,
        status: statuses[i % 3 === 0 ? 0 : i % 3 === 1 ? 1 : 2],
        timestamp: Date.now() - Math.floor(Math.random() * 10_000_000_000),
    }));
}