export interface IntegrationStatus {
  connected: boolean;
  connectedAt: Date | null;
  user: {
    username: string;
    name: string;
    avatarUrl?: string;
  } | null;
}

export interface SyncResponse {
  message: string;
  repos: number;
  issues: number;
  pulls: number;
  commits: number;
  orgs: number;
}