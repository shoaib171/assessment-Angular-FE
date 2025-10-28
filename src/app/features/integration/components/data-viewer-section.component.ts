import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GithubDataService } from '../../../core/services/github-data.service';
import { GithubIntegrationService } from '../../../core/services/github-integration.service';
import { PaginatedResponse } from '../../../core/models/github-data.model';
import { CollectionSelectorComponent } from '../../data-viewer/components/collection-selector.component';
import { SearchBarComponent } from '../../data-viewer/components/search-bar.component';
import { DataGridComponent } from '../../data-viewer/components/data-grid.component';

import { OrganizationSelectorDialogComponent } from '../../../shared/components/organization-selector-dialog/organization-selector-dialog.component';

@Component({
  selector: 'app-data-viewer-section',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    TitleCasePipe,
    CollectionSelectorComponent,
    SearchBarComponent,
    DataGridComponent,

  ],
  template: `
    @if (isConnected) {
      <div class="data-viewer-section">
        <mat-card class="data-card">
          <!-- Controls -->
          <div class="controls-wrapper">
            <div class="controls-grid">
              <!-- Active Integration -->
              <div class="control-item">
                <div class="control-header">
                  <mat-icon class="control-icon">verified</mat-icon>
                  <span class="control-title">Active Integration</span>
                </div>
                <div class="integration-badge">
                  <mat-icon>check_circle</mat-icon>
                  <span>GitHub</span>
                </div>
              </div>
              
              <!-- Entity Dropdown -->
              <div class="control-item">
                <div class="control-header">
                  <mat-icon class="control-icon">storage</mat-icon>
                  <span class="control-title">Entity</span>
                </div>
                <app-collection-selector
                  [collections]="collections"
                  [selectedCollection]="selectedCollection"
                  (collectionChange)="onCollectionChange($event)">
                </app-collection-selector>
              </div>
              
              <!-- Search -->
              <div class="control-item search-item">
                <div class="control-header">
                  <mat-icon class="control-icon">search</mat-icon>
                  <span class="control-title">Search</span>
                </div>
                <app-search-bar
                  [searchQuery]="searchQuery"
                  (searchChange)="onSearchChange($event)">
                </app-search-bar>
              </div>
            </div>
          </div>

          <!-- Header with Organization Info -->
          <mat-card-header>
            <mat-card-title>
              <mat-icon>table_chart</mat-icon>
              @if (selectedCollection) {
                {{ selectedCollection | titlecase }}
                @if (selectedCollection === 'organizations' && currentOrgName) {
                  <span class="org-badge">{{ currentOrgName }}</span>
                }
              } @else {
                Select a Collection
              }
            </mat-card-title>
            @if (selectedCollection && totalRecords > 0) {
              <mat-card-subtitle>
                Showing {{ totalRecords }} total records
                @if (selectedCollection === 'organizations' && currentOrgName) {
                  from {{ currentOrgName }}
                }
              </mat-card-subtitle>
            }
          </mat-card-header>
          
          <mat-card-content>
            <!-- Syncing Overlay -->
            @if (syncingOrg) {
              <div class="syncing-overlay">
                <div class="syncing-content">
                  <mat-spinner diameter="60"></mat-spinner>
                  <h3>Fetching Organization Data</h3>
                  <p>Syncing data for <strong>{{ currentOrgName }}</strong>...</p>
                  <p class="syncing-details">
                    This will fetch repos, commits, issues, pull requests, changelogs, and members.
                    <br>Please wait, this may take 30-60 seconds.
                  </p>
                </div>
              </div>
            }

            <!-- Data Grid -->
            <app-data-grid
              [data]="tableData"
              [columnDefs]="columnDefs"
              [loading]="loading"
              [currentPage]="currentPage"
              [pageSize]="pageSize"
              [totalRecords]="totalRecords"
              (pageChange)="onPageChange($event)"
              (pageSizeChange)="onPageSizeChange($event)"
              (sortChange)="onSortChange($event)">
            </app-data-grid>
          </mat-card-content>
        </mat-card>
      </div>
    }
  `,
  styles: [`
    .data-viewer-section {
      margin-top: 24px;
      
      .data-card {
        background: white;
        border: 1px solid #e1e4e8;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
        border-radius: 8px;
        position: relative;
        
        .controls-wrapper {
          padding: 24px 24px 0 24px;
        }
        
        .controls-grid {
          display: grid;
          grid-template-columns: 200px 1fr 2fr;
          gap: 20px;
          align-items: start;
          margin-bottom: 24px;
          
          @media (max-width: 1200px) {
            grid-template-columns: 200px 1fr;
            
            .search-item {
              grid-column: 1 / -1;
            }
          }
          
          @media (max-width: 768px) {
            grid-template-columns: 1fr;
            
            .search-item {
              grid-column: auto;
            }
          }
        }
        
        .control-item {
          display: flex;
          flex-direction: column;
          gap: 12px;
          
          .control-header {
            display: flex;
            align-items: center;
            gap: 8px;
            
            .control-icon {
              font-size: 18px;
              width: 18px;
              height: 18px;
              color: #0366d6;
            }
            
            .control-title {
              font-size: 13px;
              font-weight: 600;
              color: #24292e;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
          }
          
          .integration-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 16px;
            background: linear-gradient(135deg, #28a745 0%, #22863a 100%);
            color: white;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 2px 4px rgba(40, 167, 69, 0.2);
            transition: all 0.2s;
            width: fit-content;
            
            mat-icon {
              font-size: 18px;
              width: 18px;
              height: 18px;
            }
          }
        }
        
        mat-card-header {
          padding: 20px 24px;
          border-bottom: 1px solid #e1e4e8;
          margin-bottom: 0;
          
          mat-card-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 18px;
            font-weight: 600;
            color: #24292e;
            margin: 0;
            
            mat-icon {
              color: #0366d6;
            }

            .org-badge {
              display: inline-flex;
              align-items: center;
              padding: 4px 12px;
              background: #0366d6;
              color: white;
              border-radius: 12px;
              font-size: 13px;
              font-weight: 500;
              margin-left: 8px;
            }
          }
          
          mat-card-subtitle {
            margin-top: 4px;
            font-size: 13px;
            color: #586069;
          }
        }
        
        mat-card-content {
          padding: 0;
          position: relative;
        }

        .syncing-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.98);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          border-radius: 0 0 8px 8px;

          .syncing-content {
            text-align: center;
            padding: 40px;

            mat-spinner {
              margin: 0 auto 24px;
            }

            h3 {
              font-size: 20px;
              font-weight: 600;
              color: #24292e;
              margin: 0 0 8px 0;
            }

            p {
              font-size: 14px;
              color: #586069;
              margin: 8px 0;
              line-height: 1.5;

              strong {
                color: #0366d6;
                font-weight: 600;
              }
            }

            .syncing-details {
              font-size: 13px;
              color: #959da5;
              max-width: 400px;
              margin: 16px auto 0;
            }
          }
        }
      }
    }
  `]
})
export class DataViewerSectionComponent implements OnInit, OnChanges {
  @Input() isConnected = false;
  
  // Data Viewer
  collections: string[] = [];
  selectedCollection: string = '';
  searchQuery: string = '';
  loading: boolean = false;
  syncingOrg: boolean = false;
  currentPage: number = 1;
  pageSize: number = 50;
  totalRecords: number = 0;
  tableData: any[] = [];
  columnDefs: any[] = [];
  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  currentOrgName: string = '';

  constructor(
    private githubDataService: GithubDataService,
    private integrationService: GithubIntegrationService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
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
    
    if (collection === 'organizations') {
      // Show organization selector dialog
      this.showOrganizationSelector();
    } else if (collection) {
      this.loadData();
    }
  }

  showOrganizationSelector(): void {
    const dialogRef = this.dialog.open(OrganizationSelectorDialogComponent, {
      width: '600px',
      disableClose: false,
      panelClass: 'org-selector-dialog'
    });

    dialogRef.afterClosed().subscribe(orgName => {
      if (orgName) {
        console.log('✅ Organization selected:', orgName);
        this.currentOrgName = orgName;
        this.syncPublicOrganization(orgName);
      } else {
        console.log('❌ Organization selection cancelled');
        // Reset selection
        this.selectedCollection = '';
        this.showInfoMessage('Organization selection cancelled');
      }
    });
  }

  syncPublicOrganization(orgName: string): void {
    this.syncingOrg = true;
    console.log('🔄 Syncing public organization:', orgName);
    
    this.showInfoMessage(`Fetching data for ${orgName}... This may take 30-60 seconds.`);

    // Call service method to sync public org data
    this.integrationService.syncPublicOrganization(orgName).subscribe({
      next: (result: any) => {
        console.log('✅ Organization sync completed:', result);
        this.syncingOrg = false;
        
        this.showSuccessMessage(
          `✅ Synced ${orgName}: ${result.organizations || 0} org, ${result.repos || 0} repos, ` +
          `${result.commits || 0} commits, ${result.pulls || 0} PRs, ${result.issues || 0} issues, ` +
          `${result.users || 0} users, ${result.changelogs || 0} changelogs`,
          7000
        );
        
        // Now load the data
        this.loadData();
      },
      error: (err) => {
        console.error('❌ Organization sync failed:', err);
        this.syncingOrg = false;
        this.selectedCollection = '';
        this.currentOrgName = '';
        
        const errorMessage = err.error?.error || err.error?.details || err.message || 'Sync failed';
        this.showErrorMessage(`Failed to sync ${orgName}: ${errorMessage}`, 7000);
      }
    });
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
        if (key === '__v') continue;
        transformed[key] = item[key];
      }
      
      return transformed;
    });
  }

  generateColumnDefs(sampleData: any): void {
    const excludeFields = ['__v'];
    const priorityFields = ['_id', 'name', 'title', 'login', 'state', 'number'];
    
    const allFields = Object.keys(sampleData)
      .filter(key => !excludeFields.includes(key));
    
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
      
      if (key === '_id') colDef.minWidth = 200;
      if (key === 'message' || key === 'body' || key === 'description') colDef.minWidth = 300;
      if (key === 'sha') colDef.minWidth = 120;
      if (key === 'state' || key === 'merged' || key === 'private') colDef.minWidth = 120;
      
      return colDef;
    });
    
    console.log('📊 Column definitions generated:', this.columnDefs.length, 'columns');
  }

  formatHeaderName(field: string): string {
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

  private showSuccessMessage(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Close', {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  private showErrorMessage(message: string, duration: number = 5000): void {
    this.snackBar.open(message, 'Close', {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  private showInfoMessage(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Close', {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['info-snackbar']
    });
  }
}