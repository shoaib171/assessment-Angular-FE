import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { IntegrationStatus, SyncResponse } from '../models/integration.model';

@Injectable({
  providedIn: 'root'
})
export class GithubIntegrationService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}
  /**
   * Check integration status from backend API
   */
  checkIntegrationStatus(): Observable<IntegrationStatus> {
    const url = `${this.apiUrl}/integrations/status`;
    console.log('🔍 Checking integration status from:', url);
    return this.http.get<IntegrationStatus>(url).pipe(
      tap(status => {
        console.log('✅ Integration status received:', status);
      }),
      catchError(error => {
        console.error('❌ Error checking integration status:', error);
        throw error;
      })
    );
  }

  /**
   * Redirect to GitHub OAuth
   */
  connectGithub(): void {
    console.log('🔗 Redirecting to GitHub OAuth:', environment.githubOAuthUrl);
    window.location.href = environment.githubOAuthUrl;
  }

  /**
   * Remove GitHub integration
   */
  removeIntegration(cleanData: boolean = true): Observable<any> {
    const params = new HttpParams().set('clean', cleanData.toString());
    const url = `${this.apiUrl}/integrations/remove`;
    console.log('🗑️ Removing integration from:', url);
    return this.http.delete(url, { params }).pipe(
      tap(response => {
        console.log('✅ Integration removed successfully:', response);
      }),
      catchError(error => {
        console.error('❌ Error removing integration:', error);
        throw error;
      })
    );
  }

  /**
   * Re-sync GitHub data
   */
  resyncIntegration(): Observable<SyncResponse> {
    const url = `${this.apiUrl}/integrations/sync`;
    console.log('🔄 Starting sync from:', url);
    return this.http.get<SyncResponse>(url).pipe(
      tap(response => {
        console.log('✅ Sync completed successfully:', response);
      }),
      catchError(error => {
        console.error('❌ Error during sync:', error);
        throw error;
      })
    );
  }
/**
   * Sync public organization data
   * @param orgName - Public GitHub organization name (e.g., 'facebook', 'google')
   */
  syncPublicOrganization(orgName: string): Observable<SyncResponse> {
    const url = `${this.apiUrl}/integrations/sync-org`;
    const params = new HttpParams().set('orgName', orgName);
    
    console.log('🏢 Syncing public organization:', orgName, 'from:', url);
    
    return this.http.get<SyncResponse>(url, { params }).pipe(
      tap(response => {
        console.log('Organization sync completed:', response);
      }),
      catchError(error => {
        console.error(' Error syncing organization:', error);
        throw error;
      })
    );
  }
  /**
   * Get sync statistics
   */
  getSyncStats(): Observable<any> {
    const url = `${this.apiUrl}/integrations/stats`;
    
    console.log('📊 Fetching sync stats from:', url);
    
    return this.http.get(url).pipe(
      tap(stats => {
        console.log('✅ Sync stats received:', stats);
      }),
      catchError(error => {
        console.error('❌ Error fetching sync stats:', error);
        throw error;
      })
    );
  }
}