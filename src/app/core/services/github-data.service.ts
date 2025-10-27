import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PaginatedResponse, CollectionQueryParams } from '../models/github-data.model';

@Injectable({
  providedIn: 'root'
})
export class GithubDataService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCollections(): Observable<string[]> {
    const url = `${this.apiUrl}/data/collections`;
    console.log('Fetching collections from:', url);
    return this.http.get<string[]>(url).pipe(
      tap(data => console.log('Collections received:', data))
    );
  }

  getCollectionData<T>(
    collection: string,
    params: CollectionQueryParams
  ): Observable<PaginatedResponse<T>> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('limit', params.limit.toString());

    if (params.q) {
      httpParams = httpParams.set('q', params.q);
    }

    if (params.sort) {
      httpParams = httpParams.set('sort', params.sort);
    }

    if (params.filter) {
      httpParams = httpParams.set('filter', params.filter);
    }

    const url = `${this.apiUrl}/data/${collection}`;
    console.log('Fetching collection data from:', url, 'with params:', params);
    
    return this.http.get<PaginatedResponse<T>>(url, { params: httpParams }).pipe(
      tap(data => console.log(`${collection} data received:`, data))
    );
  }
}