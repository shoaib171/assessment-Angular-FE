import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PaginatedResponse, CollectionQueryParams } from '../models/github-data.model';

@Injectable({
  providedIn: 'root'
})
export class GithubDataService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  /**
   * Get list of all available collections
   */
  getCollections(): Observable<string[]> {
    const url = `${this.apiUrl}/data/collections`;
    console.log('📚 Fetching collections from:', url);
    return this.http.get<string[]>(url).pipe(
      tap(data => console.log('✅ Collections received:', data)),
      catchError(error => {
        console.error('❌ Error fetching collections:', error);
        throw error;
      })
    );
  }

  /**
   * Get collection schema (field definitions)
   */
  getCollectionSchema(collection: string): Observable<any> {
    const url = `${this.apiUrl}/data/${collection}/schema`;
    console.log('📋 Fetching schema for:', collection);
    
    return this.http.get<any>(url).pipe(
      tap(data => console.log('✅ Schema received:', data)),
      catchError(error => {
        console.error('❌ Error fetching schema:', error);
        throw error;
      })
    );
  }

  /**
   * Get collection statistics
   */
  getCollectionStats(collection: string): Observable<any> {
    const url = `${this.apiUrl}/data/${collection}/stats`;
    console.log('📊 Fetching stats for:', collection);
    
    return this.http.get<any>(url).pipe(
      tap(data => console.log('✅ Stats received:', data)),
      catchError(error => {
        console.error('❌ Error fetching stats:', error);
        throw error;
      })
    );
  }

  /**
   * Get paginated collection data with filtering, sorting, and search
   */
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
    console.log('🔄 Fetching collection data from:', url, 'with params:', params);
    
    return this.http.get<PaginatedResponse<T>>(url, { params: httpParams }).pipe(
      tap(data => console.log(`✅ ${collection} data received:`, data)),
      catchError(error => {
        console.error(`❌ Error fetching ${collection} data:`, error);
        throw error;
      })
    );
  }

  /**
   * Get single document by ID
   */
  getDocument(collection: string, id: string): Observable<any> {
    const url = `${this.apiUrl}/data/${collection}/${id}`;
    console.log('🔍 Fetching document:', url);
    
    return this.http.get<any>(url).pipe(
      tap(data => console.log('✅ Document received:', data)),
      catchError(error => {
        console.error('❌ Error fetching document:', error);
        throw error;
      })
    );
  }

  /**
   * Global search across all collections
   */
  globalSearch(query: string, limit: number = 10): Observable<any> {
    let httpParams = new HttpParams()
      .set('q', query)
      .set('limit', limit.toString());

    const url = `${this.apiUrl}/data/search`;
    console.log('🔍 Global search:', url, 'query:', query);
    
    return this.http.get<any>(url, { params: httpParams }).pipe(
      tap(data => console.log('✅ Search results:', data)),
      catchError(error => {
        console.error('❌ Error in global search:', error);
        throw error;
      })
    );
  }
}