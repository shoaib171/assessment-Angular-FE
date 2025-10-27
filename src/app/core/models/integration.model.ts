export interface IntegrationStatus {
  connected: boolean;
  connectedAt: Date | null;
  user: {
    username: string;
    name: string;
    avatarUrl?: string;
    email?: string;
  } | null;
  lastSyncedAt?: Date | null;
  syncStatus?: 'pending' | 'syncing' | 'success' | 'failed';
  dataCounts?: {
    organizations: number;
    repos: number;
    commits: number;
    issues: number;
    pulls: number;
    users: number;
    changelogs: number;
  } | null;
}

export interface SyncResponse {
  message: string;
  organizations: number;
  repos: number;
  commits: number;
  issues: number;
  pulls: number;
  users: number;
  changelogs: number;
  lastSyncedAt: Date;
}