import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GithubOrganizationService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getOrganizations(): Observable<any[]> {
    const url = `${this.apiUrl}/organizations`;
    console.log('Fetching organizations from:', url);
    return this.http.get<any[]>(url).pipe(
      tap(data => console.log('Organizations received:', data))
    );
  }

  getOrgRepos(org: string): Observable<any[]> {
    const url = `${this.apiUrl}/organizations/${org}/repos`;
    console.log('Fetching repos from:', url);
    return this.http.get<any[]>(url).pipe(
      tap(data => console.log('Repos received:', data))
    );
  }

  getCommits(org: string, repo: string): Observable<any[]> {
    const url = `${this.apiUrl}/organizations/${org}/repos/${repo}/commits`;
    console.log('Fetching commits from:', url);
    return this.http.get<any[]>(url).pipe(
      tap(data => console.log('Commits received:', data))
    );
  }

  getPullRequests(org: string, repo: string): Observable<any[]> {
    const url = `${this.apiUrl}/organizations/${org}/repos/${repo}/pulls`;
    console.log('Fetching pull requests from:', url);
    return this.http.get<any[]>(url).pipe(
      tap(data => console.log('Pull requests received:', data))
    );
  }

  getIssues(org: string, repo: string): Observable<any[]> {
    const url = `${this.apiUrl}/organizations/${org}/repos/${repo}/issues`;
    console.log('Fetching issues from:', url);
    return this.http.get<any[]>(url).pipe(
      tap(data => console.log('Issues received:', data))
    );
  }

  getIssueChangelogs(org: string, repo: string): Observable<any[]> {
    const url = `${this.apiUrl}/organizations/${org}/repos/${repo}/issues/changelogs`;
    console.log('Fetching changelogs from:', url);
    return this.http.get<any[]>(url).pipe(
      tap(data => console.log('Changelogs received:', data))
    );
  }

  getOrgUsers(org: string): Observable<any[]> {
    const url = `${this.apiUrl}/organizations/${org}/users`;
    console.log('Fetching org users from:', url);
    return this.http.get<any[]>(url).pipe(
      tap(data => console.log('Org users received:', data))
    );
  }
}