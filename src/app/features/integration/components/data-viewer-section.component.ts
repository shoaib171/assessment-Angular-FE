import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
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
  
  selectedTab = 0; // 0 = Data Viewer, 1 = Organizations
  
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
    private orgService: GithubOrganizationService
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
      },
      error: (err) => {
        console.error('❌ Error loading collections:', err);
      }
    });
  }

  onCollectionChange(collection: string): void {
    console.log('📂 Collection changed to:', collection);
    this.selectedCollection = collection;
    this.currentPage = 1;
    this.searchQuery = '';
    this.loadData();
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
          this.generateColumnDefs(this.tableData[0]);
        } else {
          this.columnDefs = [];
        }
        
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error loading data:', err);
        this.loading = false;
        this.tableData = [];
        this.columnDefs = [];
        this.totalRecords = 0;
      }
    });
  }

  transformDataForDisplay(data: any[]): any[] {
    return data.map(item => {
      const transformed: any = {};
      
      for (const key in item) {
        if (key === '_id' || key === '__v') continue;
        
        const value = item[key];
        
        // Handle nested user/owner objects
        if ((key === 'owner' || key === 'user' || key === 'author') && typeof value === 'object' && value !== null) {
          transformed[key] = value.login || value.username || value.name || 'Unknown';
          continue;
        }
        
        transformed[key] = value;
      }
      
      return transformed;
    });
  }

  generateColumnDefs(sampleData: any): void {
    const excludeFields = ['_id', '__v'];
    
    this.columnDefs = Object.keys(sampleData)
      .filter(key => !excludeFields.includes(key))
      .map(key => ({
        field: key,
        headerName: this.formatHeaderName(key),
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 150
      }));
    
    console.log('📊 Column definitions generated:', this.columnDefs.length, 'columns');
  }

  formatHeaderName(field: string): string {
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
      },
      error: (err) => {
        console.error('❌ Error loading organizations:', err);
        this.loadingOrgs = false;
        this.organizations = [];
      }
    });
  }
}