export type BackupStatus = 'SUCCESS' | 'FAILED' | 'RUNNING';

export interface BackupLog {
    id: string;             // e.g., "LOG-10042"
    source: string;         // e.g., "vm-prod-workload-01"
    targetCloud: 'AWS' | 'Azure' | 'GCP';
    sizeGB: number;         // e.g., 250
    status: BackupStatus;
    timestamp: number;      // Unix epoch in ms
}

export type SortField = 'id' | 'source' | 'sizeGB' | 'timestamp';
export type SortDirection = 'asc' | 'desc';
