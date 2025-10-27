import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { GithubDataService } from '../../../core/services/github-data.service';
import { GithubIntegrationService } from '../../../core/services/github-integration.service';
import { GithubOrganizationService } from '../../../core/services/github-organization.service';
import { PaginatedResponse } from '../../../core/models/github-data.model';
import { CollectionSelectorComponent } from '../../data-viewer/components/collection-selector.component';
import { SearchBarComponent } from '../../data-viewer/components/search-bar.component';
import { DataGridComponent } from '../../data-viewer/components/data-grid.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-data-viewer-section',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    MatButtonModule,
    MatSnackBarModule,
    TitleCasePipe,
    CollectionSelectorComponent,
    SearchBarComponent,
    DataGridComponent,
    LoadingSpinnerComponent
  ],
  templateUrl:'./data-viewer-section.component.html',
  styleUrls: ['./data-viewer-section.component.scss']
})
export class DataViewerSectionComponent implements OnInit, OnChanges {
  @Input() isConnected = false;
  
  selectedTab = 0;
  
  // Data Viewer
  collections: string[] = [];
  selectedCollection: string = '';
  searchQuery: string = '';
  loading: boolean = false;
  currentPage: number = 1;
  pageSize: number = 50;
  totalRecords: number = 0;
  tableData: any[] = [];
  columnDefs: any[] = [];
  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  // Organizations
  organizations: any[] = [];
  loadingOrgs = false;

  constructor(
    private githubDataService: GithubDataService,
    private integrationService: GithubIntegrationService,
    private orgService: GithubOrganizationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    console.log('🚀 DataViewerSectionComponent initialized');
    if (this.isConnected) {
      this.loadCollections();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isConnected'] && changes['isConnected'].currentValue) {
      console.log('✅ Connection established, loading collections...');
      this.loadCollections();
    }
  }

  onTabChange(index: number): void {
    this.selectedTab = index;
    console.log('📑 Tab changed to:', index === 0 ? 'Data Viewer' : 'Organizations');
    
    if (index === 1 && this.organizations.length === 0) {
      this.loadOrganizations();
    }
  }

  // Data Viewer Methods
  loadCollections(): void {
    console.log('📚 Loading collections...');
    this.githubDataService.getCollections().subscribe({
      next: (collections) => {
        console.log('✅ Collections loaded:', collections);
        this.collections = collections;
        
        if (collections.length > 0) {
          this.showInfoMessage(`${collections.length} collections available`);
        }
      },
      error: (err) => {
        console.error('❌ Error loading collections:', err);
        this.showErrorMessage('Failed to load collections');
      }
    });
  }

  onCollectionChange(collection: string): void {
    console.log('📂 Collection changed to:', collection);
    this.selectedCollection = collection;
    this.currentPage = 1;
    this.searchQuery = '';
    this.tableData = [];
    this.columnDefs = [];
    this.totalRecords = 0;
    
    if (collection) {
      this.loadData();
    }
  }

  onSearchChange(query: string): void {
    console.log('🔍 Search query:', query);
    this.searchQuery = query;
    this.currentPage = 1;
    this.loadData();
  }

  onPageChange(page: number): void {
    console.log('📄 Page changed to:', page);
    this.currentPage = page;
    this.loadData();
  }

  onPageSizeChange(size: number): void {
    console.log('📏 Page size changed to:', size);
    this.pageSize = size;
    this.currentPage = 1;
    this.loadData();
  }

  onSortChange(event: { field: string; direction: 'asc' | 'desc' }): void {
    console.log('🔄 Sort changed:', event);
    this.sortField = event.field;
    this.sortDirection = event.direction;
    this.loadData();
  }

  loadData(): void {
    if (!this.selectedCollection) {
      console.warn('⚠️ No collection selected');
      return;
    }

    this.loading = true;
    const sortParam = this.sortField ? `${this.sortField}:${this.sortDirection}` : undefined;
    
    console.log('🔄 Loading data for collection:', this.selectedCollection, {
      page: this.currentPage,
      limit: this.pageSize,
      search: this.searchQuery,
      sort: sortParam
    });
    
    this.githubDataService.getCollectionData(this.selectedCollection, {
      page: this.currentPage,
      limit: this.pageSize,
      q: this.searchQuery || undefined,
      sort: sortParam
    }).subscribe({
      next: (response: PaginatedResponse<any>) => {
        console.log('✅ Data loaded:', response);
        this.tableData = this.transformDataForDisplay(response.docs);
        this.totalRecords = response.total;
        
        if (response.docs.length > 0) {
          this.generateColumnDefs(response.docs[0]);
          this.showSuccessMessage(
            `Loaded ${response.docs.length} of ${response.total} records`
          );
        } else {
          this.columnDefs = [];
          this.showInfoMessage('No records found');
        }
        
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error loading data:', err);
        this.loading = false;
        this.tableData = [];
        this.columnDefs = [];
        this.totalRecords = 0;
        
        const errorMessage = err.error?.error || err.message || 'Failed to load data';
        this.showErrorMessage(errorMessage);
      }
    });
  }

  transformDataForDisplay(data: any[]): any[] {
    return data.map(item => {
      const transformed: any = {};
      
      for (const key in item) {
        // Skip internal MongoDB fields
        if (key === '__v') continue;
        
        const value = item[key];
        transformed[key] = value;
      }
      
      return transformed;
    });
  }

  generateColumnDefs(sampleData: any): void {
    const excludeFields = ['__v'];
    const priorityFields = ['_id', 'name', 'title', 'login', 'state', 'number'];
    
    const allFields = Object.keys(sampleData)
      .filter(key => !excludeFields.includes(key));
    
    // Sort fields: priority fields first, then alphabetically
    const sortedFields = allFields.sort((a, b) => {
      const aPriority = priorityFields.indexOf(a);
      const bPriority = priorityFields.indexOf(b);
      
      if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority;
      if (aPriority !== -1) return -1;
      if (bPriority !== -1) return 1;
      
      return a.localeCompare(b);
    });
    
    this.columnDefs = sortedFields.map(key => {
      const colDef: any = {
        field: key,
        headerName: this.formatHeaderName(key),
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 150
      };
      
      // Adjust width for specific fields
      if (key === '_id') colDef.minWidth = 200;
      if (key === 'message' || key === 'body' || key === 'description') colDef.minWidth = 300;
      if (key === 'sha') colDef.minWidth = 120;
      if (key === 'state' || key === 'merged' || key === 'private') colDef.minWidth = 120;
      
      return colDef;
    });
    
    console.log('📊 Column definitions generated:', this.columnDefs.length, 'columns');
  }

  formatHeaderName(field: string): string {
    // Special cases
    const specialCases: { [key: string]: string } = {
      '_id': 'ID',
      'html_url': 'URL',
      'avatar_url': 'Avatar',
      'repos_url': 'Repos URL',
      'repoId': 'Repository ID',
      'repoName': 'Repository',
      'orgId': 'Organization ID',
      'orgName': 'Organization',
      'userId': 'User ID',
      'pullId': 'Pull Request ID',
      'issueId': 'Issue ID',
      'sha': 'SHA',
      'full_name': 'Full Name',
    };
    
    if (specialCases[field]) return specialCases[field];
    
    return field
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Organizations Methods
  loadOrganizations(): void {
    console.log('🏢 Loading organizations...');
    this.loadingOrgs = true;
    this.orgService.getOrganizations().subscribe({
      next: (orgs) => {
        console.log('✅ Organizations loaded:', orgs.length);
        this.organizations = orgs;
        this.loadingOrgs = false;
        
        if (orgs.length > 0) {
          this.showSuccessMessage(`${orgs.length} organizations loaded`);
        }
      },
      error: (err) => {
        console.error('❌ Error loading organizations:', err);
        this.loadingOrgs = false;
        this.organizations = [];
        
        const errorMessage = err.error?.error || err.message || 'Failed to load organizations';
        this.showErrorMessage(errorMessage);
      }
    });
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  private showInfoMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 2000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['info-snackbar']
    });
  }
}