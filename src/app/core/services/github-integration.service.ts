import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { IntegrationStatus, SyncResponse } from '../models/integration.model';

@Injectable({
  providedIn: 'root'
})
export class GithubIntegrationService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  checkIntegrationStatus(): Observable<IntegrationStatus> {
    const integrated = localStorage.getItem('github_integrated') === 'true';
    const userStr = localStorage.getItem('github_user');
    const connectedAtStr = localStorage.getItem('github_connected_at');
    
    console.log('Checking integration status:', { integrated, userStr, connectedAtStr });
    
    if (integrated && userStr) {
      return of({
        connected: true,
        connectedAt: connectedAtStr ? new Date(connectedAtStr) : new Date(),
        user: JSON.parse(userStr)
      });
    }
    
    return of({
      connected: false,
      connectedAt: null,
      user: null
    });
  }

  connectGithub(): void {
    console.log('Redirecting to:', environment.githubOAuthUrl);
    window.location.href = environment.githubOAuthUrl;
  }

  removeIntegration(cleanData: boolean = true): Observable<any> {
    const params = new HttpParams().set('clean', cleanData.toString());
    
    return this.http.delete(`${this.apiUrl}/integrations/remove`, { params }).pipe(
      tap(() => {
        localStorage.removeItem('github_integrated');
        localStorage.removeItem('github_user');
        localStorage.removeItem('github_connected_at');
        console.log('Integration removed from localStorage');
      })
    );
  }

  resyncIntegration(): Observable<SyncResponse> {
    console.log('Syncing data from:', `${this.apiUrl}/integrations/sync`);
    return this.http.get<SyncResponse>(`${this.apiUrl}/integrations/sync`);
  }

  handleOAuthCallback(integrated: boolean): void {
    if (integrated) {
      localStorage.setItem('github_integrated', 'true');
      localStorage.setItem('github_connected_at', new Date().toISOString());
      localStorage.setItem('github_user', JSON.stringify({
        username: 'github-user',
        name: 'GitHub User'
      }));
      console.log('OAuth callback handled, data stored in localStorage');
    }
  }
}