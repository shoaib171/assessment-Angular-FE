import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';

interface PublicOrganization {
  name: string;
  displayName: string;
  description: string;
  avatar?: string;
  stars?: string;
  repos?: number;
  category?: string;
}

@Component({
  selector: 'app-organization-selector-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatChipsModule,
    FormsModule
  ],
  template: `
    <div class="org-selector-dialog">
      <!-- Header -->
      <div class="dialog-header">
        <div class="header-content">
          <mat-icon class="header-icon">business</mat-icon>
          <div class="header-text">
            <h2 mat-dialog-title>Select Public Organization</h2>
            <p class="header-subtitle">Choose from popular organizations or enter a custom one</p>
          </div>
        </div>
        <button mat-icon-button (click)="onCancel()" class="close-btn" matTooltip="Close">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      
      <mat-dialog-content>
        <!-- Search and Filter -->
        <div class="search-section">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search organizations</mat-label>
            <input 
              matInput 
              [(ngModel)]="searchQuery" 
              placeholder="Type to filter..."
              (input)="onSearchInput()"
              #searchInput>
            <mat-icon matPrefix class="search-icon">search</mat-icon>
            <button mat-icon-button matSuffix *ngIf="searchQuery" (click)="clearSearch()">
              <mat-icon>close</mat-icon>
            </button>
          </mat-form-field>

          <!-- Category Filters -->
          <div class="category-chips">
            <mat-chip-option 
              *ngFor="let category of categories"
              [selected]="selectedCategory === category"
              (click)="filterByCategory(category)">
              {{ category }}
            </mat-chip-option>
          </div>
        </div>

        <!-- Stats -->
        <div class="stats-bar" *ngIf="!searchQuery && selectedCategory === 'All'">
          <div class="stat">
            <mat-icon>business</mat-icon>
            <span>{{ publicOrganizations.length }} organizations</span>
          </div>
          <div class="stat">
            <mat-icon>star</mat-icon>
            <span>{{ getTotalStars() }} total stars</span>
          </div>
        </div>

        <!-- Organization List -->
        <div class="org-list" #orgList>
          <div class="list-header" *ngIf="getFilteredOrganizations().length > 0">
            <span class="result-count">{{ getFilteredOrganizations().length }} results</span>
            <button mat-button class="sort-btn" (click)="toggleSort()">
              <mat-icon>{{ sortAsc ? 'arrow_upward' : 'arrow_downward' }}</mat-icon>
              Sort by {{ sortBy }}
            </button>
          </div>

          <div class="org-items">
            <div 
              *ngFor="let org of getFilteredOrganizations(); trackBy: trackByOrgName"
              class="org-item"
              [class.selected]="selectedOrg === org.name"
              [class.animate-in]="animateItems"
              (click)="selectOrg(org.name)"
              [matTooltip]="'Click to select ' + org.displayName"
              matTooltipPosition="right">
              
              <div class="org-item-content">
                <!-- Avatar -->
                <div class="org-avatar-container">
                  <img 
                    *ngIf="org.avatar" 
                    [src]="org.avatar" 
                    [alt]="org.displayName" 
                    class="org-avatar"
                    (error)="onImageError($event)">
                  <div *ngIf="!org.avatar" class="org-avatar-placeholder">
                    <mat-icon>business</mat-icon>
                  </div>
                  <div class="selection-indicator" *ngIf="selectedOrg === org.name">
                    <mat-icon>check_circle</mat-icon>
                  </div>
                </div>
                
                <!-- Info -->
                <div class="org-info">
                  <div class="org-name-row">
                    <h3>{{ org.displayName }}</h3>
                    <mat-chip class="category-chip" *ngIf="org.category">
                      {{ org.category }}
                    </mat-chip>
                  </div>
                  <p class="org-handle">{{ org.name }}</p>
                  <p class="org-description">{{ org.description }}</p>
                  
                  <!-- Metrics -->
                  <div class="org-metrics">
                    <span class="metric" *ngIf="org.stars">
                      <mat-icon>star</mat-icon>
                      {{ org.stars }}
                    </span>
                    <span class="metric" *ngIf="org.repos">
                      <mat-icon>folder</mat-icon>
                      {{ org.repos }} repos
                    </span>
                  </div>
                </div>
                
                <!-- Action Icon -->
                <div class="org-action">
                  <mat-icon class="chevron-icon">chevron_right</mat-icon>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div class="empty-state" *ngIf="getFilteredOrganizations().length === 0">
            <div class="empty-icon">
              <mat-icon>search_off</mat-icon>
            </div>
            <h3>No organizations found</h3>
            <p>Try adjusting your search or filter criteria</p>
            <button mat-stroked-button (click)="clearFilters()">
              <mat-icon>refresh</mat-icon>
              Clear Filters
            </button>
          </div>
        </div>

        <!-- Custom Organization Section -->
        <div class="custom-org-section">
          <div class="section-divider">
            <span>OR</span>
          </div>
          
          <div class="custom-org-content">
            <p class="section-label">
              <mat-icon>add_circle_outline</mat-icon>
              Enter a custom organization name
            </p>
            
            <mat-form-field appearance="outline" class="custom-org-field">
              <mat-label>Organization name</mat-label>
              <input 
                matInput 
                [(ngModel)]="customOrgName" 
                placeholder="e.g., microsoft, google, facebook"
                (keyup.enter)="selectCustomOrg()"
                (input)="onCustomOrgInput()">
              <mat-icon matPrefix>link</mat-icon>
              <mat-hint *ngIf="!customOrgName">Enter any GitHub organization username</mat-hint>
              <mat-hint *ngIf="customOrgName && isValidOrgName(customOrgName)">
                <span class="valid-hint">✓ Valid organization name</span>
              </mat-hint>
            </mat-form-field>
            
            <button 
              *ngIf="customOrgName && isValidOrgName(customOrgName)"
              mat-stroked-button 
              color="primary"
              (click)="selectCustomOrg()"
              class="custom-org-btn">
              <mat-icon>add</mat-icon>
              Use "{{ customOrgName }}"
            </button>
          </div>
        </div>
      </mat-dialog-content>
      
      <!-- Footer Actions -->
      <mat-dialog-actions align="end">
        <div class="action-hint" *ngIf="selectedOrg">
          <mat-icon>info</mat-icon>
          <span>Selected: <strong>{{ selectedOrg }}</strong></span>
        </div>
        <div class="spacer"></div>
        <button mat-button (click)="onCancel()">
          Cancel
        </button>
        <button 
          mat-raised-button 
          color="primary"
          [disabled]="!selectedOrg"
          (click)="onConfirm()"
          class="fetch-btn">
          <mat-icon>cloud_download</mat-icon>
          Fetch Organization Data
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .org-selector-dialog {
      display: flex;
      flex-direction: column;
      max-height: 90vh;
      
      // Header
      .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 24px 24px 16px;
        border-bottom: 1px solid #e1e4e8;
        
        .header-content {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          flex: 1;
          
          .header-icon {
            font-size: 36px;
            width: 36px;
            height: 36px;
            color: #0366d6;
            background: linear-gradient(135deg, rgba(3, 102, 214, 0.1), rgba(3, 102, 214, 0.05));
            border-radius: 12px;
            padding: 8px;
          }
          
          .header-text {
            flex: 1;
            
            h2 {
              margin: 0;
              font-size: 24px;
              font-weight: 600;
              color: #24292e;
            }
            
            .header-subtitle {
              margin: 4px 0 0 0;
              font-size: 14px;
              color: #586069;
            }
          }
        }
        
        .close-btn {
          flex-shrink: 0;
        }
      }
      
      mat-dialog-content {
        padding: 0 !important;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        
        // Search Section
        .search-section {
          padding: 20px 24px 16px;
          background: #f6f8fa;
          border-bottom: 1px solid #e1e4e8;
          
          .search-field {
            width: 100%;
            margin-bottom: 16px;
            
            .search-icon {
              color: #0366d6;
            }
          }
          
          .category-chips {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            
            mat-chip-option {
              font-size: 12px;
              height: 28px;
              transition: all 0.2s;
              
              &:hover {
                background-color: rgba(3, 102, 214, 0.1);
              }
              
              &.mat-mdc-chip-selected {
                background-color: #0366d6;
                color: white;
              }
            }
          }
        }
        
        // Stats Bar
        .stats-bar {
          display: flex;
          gap: 24px;
          padding: 12px 24px;
          background: white;
          border-bottom: 1px solid #e1e4e8;
          
          .stat {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            color: #586069;
            
            mat-icon {
              font-size: 18px;
              width: 18px;
              height: 18px;
              color: #0366d6;
            }
          }
        }
        
        // Organization List
        .org-list {
          flex: 1;
          overflow-y: auto;
          min-height: 300px;
          max-height: 400px;
          
          .list-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 24px;
            background: white;
            border-bottom: 1px solid #e1e4e8;
            position: sticky;
            top: 0;
            z-index: 1;
            
            .result-count {
              font-size: 13px;
              color: #586069;
              font-weight: 500;
            }
            
            .sort-btn {
              font-size: 12px;
              height: 32px;
              
              mat-icon {
                font-size: 18px;
                width: 18px;
                height: 18px;
                margin-right: 4px;
              }
            }
          }
          
          .org-items {
            .org-item {
              cursor: pointer;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              border-bottom: 1px solid #e1e4e8;
              position: relative;
              
              &:last-child {
                border-bottom: none;
              }
              
              &:hover {
                background-color: #f6f8fa;
                
                .chevron-icon {
                  transform: translateX(4px);
                  color: #0366d6;
                }
              }
              
              &.selected {
                background: linear-gradient(90deg, #e6f3ff 0%, transparent 100%);
                border-left: 4px solid #0366d6;
                
                .org-avatar-container {
                  .org-avatar {
                    border-color: #0366d6;
                    box-shadow: 0 0 0 3px rgba(3, 102, 214, 0.2);
                  }
                }
              }
              
              &.animate-in {
                animation: slideInUp 0.4s ease-out;
              }
              
              @keyframes slideInUp {
                from {
                  opacity: 0;
                  transform: translateY(10px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              
              .org-item-content {
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 16px 24px;
                
                .org-avatar-container {
                  position: relative;
                  flex-shrink: 0;
                  
                  .org-avatar,
                  .org-avatar-placeholder {
                    width: 64px;
                    height: 64px;
                    border-radius: 12px;
                    border: 2px solid #e1e4e8;
                    transition: all 0.3s;
                  }
                  
                  .org-avatar-placeholder {
                    background: linear-gradient(135deg, #f6f8fa, #e1e4e8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    
                    mat-icon {
                      font-size: 32px;
                      width: 32px;
                      height: 32px;
                      color: #959da5;
                    }
                  }
                  
                  .selection-indicator {
                    position: absolute;
                    top: -6px;
                    right: -6px;
                    background: white;
                    border-radius: 50%;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                    animation: bounceIn 0.4s;
                    
                    mat-icon {
                      font-size: 24px;
                      width: 24px;
                      height: 24px;
                      color: #28a745;
                    }
                  }
                  
                  @keyframes bounceIn {
                    0% {
                      transform: scale(0);
                    }
                    50% {
                      transform: scale(1.2);
                    }
                    100% {
                      transform: scale(1);
                    }
                  }
                }
                
                .org-info {
                  flex: 1;
                  min-width: 0;
                  
                  .org-name-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 4px;
                    
                    h3 {
                      font-size: 17px;
                      font-weight: 600;
                      color: #24292e;
                      margin: 0;
                    }
                    
                    .category-chip {
                      height: 20px;
                      font-size: 10px;
                      background: rgba(3, 102, 214, 0.1);
                      color: #0366d6;
                    }
                  }
                  
                  .org-handle {
                    font-size: 13px;
                    color: #586069;
                    margin: 0 0 6px 0;
                    font-family: 'Courier New', monospace;
                  }
                  
                  .org-description {
                    font-size: 14px;
                    color: #586069;
                    margin: 0 0 8px 0;
                    line-height: 1.5;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                  }
                  
                  .org-metrics {
                    display: flex;
                    gap: 16px;
                    
                    .metric {
                      display: inline-flex;
                      align-items: center;
                      gap: 4px;
                      font-size: 12px;
                      color: #586069;
                      font-weight: 500;
                      
                      mat-icon {
                        font-size: 16px;
                        width: 16px;
                        height: 16px;
                        color: #0366d6;
                      }
                    }
                  }
                }
                
                .org-action {
                  flex-shrink: 0;
                  
                  .chevron-icon {
                    font-size: 24px;
                    width: 24px;
                    height: 24px;
                    color: #959da5;
                    transition: all 0.3s;
                  }
                }
              }
            }
          }
          
          // Empty State
          .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 24px;
            text-align: center;
            
            .empty-icon {
              width: 80px;
              height: 80px;
              border-radius: 50%;
              background: #f6f8fa;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 16px;
              
              mat-icon {
                font-size: 48px;
                width: 48px;
                height: 48px;
                color: #959da5;
              }
            }
            
            h3 {
              font-size: 18px;
              font-weight: 600;
              color: #24292e;
              margin: 0 0 8px 0;
            }
            
            p {
              font-size: 14px;
              color: #586069;
              margin: 0 0 20px 0;
            }
          }
        }
        
        // Custom Organization Section
        .custom-org-section {
          padding: 20px 24px;
          background: #f6f8fa;
          border-top: 1px solid #e1e4e8;
          
          .section-divider {
            position: relative;
            text-align: center;
            margin-bottom: 20px;
            
            &::before {
              content: '';
              position: absolute;
              left: 0;
              right: 0;
              top: 50%;
              height: 1px;
              background: #e1e4e8;
            }
            
            span {
              position: relative;
              display: inline-block;
              padding: 0 16px;
              background: #f6f8fa;
              color: #959da5;
              font-size: 12px;
              font-weight: 600;
            }
          }
          
          .custom-org-content {
            .section-label {
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 14px;
              color: #586069;
              margin: 0 0 12px 0;
              font-weight: 500;
              
              mat-icon {
                font-size: 20px;
                width: 20px;
                height: 20px;
                color: #0366d6;
              }
            }
            
            .custom-org-field {
              width: 100%;
              margin-bottom: 12px;
              
              .valid-hint {
                color: #28a745;
                font-weight: 500;
              }
            }
            
            .custom-org-btn {
              width: 100%;
              height: 44px;
              
              mat-icon {
                margin-right: 8px;
              }
            }
          }
        }
      }
      
      // Footer Actions
      mat-dialog-actions {
        padding: 16px 24px;
        margin: 0;
        border-top: 1px solid #e1e4e8;
        background: white;
        display: flex;
        align-items: center;
        
        .action-hint {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #586069;
          
          mat-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
            color: #0366d6;
          }
          
          strong {
            color: #0366d6;
          }
        }
        
        .spacer {
          flex: 1;
        }
        
        button {
          margin-left: 12px;
          
          &.fetch-btn {
            min-width: 220px;
            
            mat-icon {
              margin-right: 8px;
            }
          }
        }
      }
    }
    
    // Scrollbar Styling
    .org-list::-webkit-scrollbar {
      width: 8px;
    }
    
    .org-list::-webkit-scrollbar-track {
      background: #f6f8fa;
    }
    
    .org-list::-webkit-scrollbar-thumb {
      background: #d1d5da;
      border-radius: 4px;
      
      &:hover {
        background: #959da5;
      }
    }
    
    // Responsive
    @media (max-width: 768px) {
      .org-selector-dialog {
        mat-dialog-content {
          .search-section {
            padding: 16px;
          }
          
          .org-list {
            .org-items {
              .org-item {
                .org-item-content {
                  padding: 12px 16px;
                  
                  .org-avatar-container {
                    .org-avatar,
                    .org-avatar-placeholder {
                      width: 48px;
                      height: 48px;
                    }
                  }
                  
                  .org-info {
                    .org-name-row h3 {
                      font-size: 15px;
                    }
                    
                    .org-description {
                      -webkit-line-clamp: 1;
                    }
                  }
                }
              }
            }
          }
        }
        
        mat-dialog-actions {
          .action-hint {
            display: none;
          }
        }
      }
    }
  `]
})
export class OrganizationSelectorDialogComponent {
  searchQuery = '';
  customOrgName = '';
  selectedOrg: string = '';
  selectedCategory = 'All';
  sortBy = 'stars';
  sortAsc = false;
  animateItems = true;
  
  categories = ['All', 'Tech', 'Cloud', 'AI/ML', 'Framework', 'Other'];
  
  // Popular public organizations with enhanced data
  publicOrganizations: PublicOrganization[] = [
    {
      name: 'facebook',
      displayName: 'Facebook',
      description: 'Open source projects from Facebook including React, React Native, and more',
      avatar: 'https://avatars.githubusercontent.com/u/69631?s=200&v=4',
      stars: '500K+',
      repos: 178,
      category: 'Tech'
    },
    {
      name: 'google',
      displayName: 'Google',
      description: 'Google Open Source - Android, TensorFlow, Angular, and hundreds more',
      avatar: 'https://avatars.githubusercontent.com/u/1342004?s=200&v=4',
      stars: '1M+',
      repos: 2500,
      category: 'Tech'
    },
    {
      name: 'microsoft',
      displayName: 'Microsoft',
      description: 'Open source projects and samples from Microsoft including VS Code, TypeScript',
      avatar: 'https://avatars.githubusercontent.com/u/6154722?s=200&v=4',
      stars: '800K+',
      repos: 4000,
      category: 'Tech'
    },
    {
      name: 'vercel',
      displayName: 'Vercel',
      description: 'Develop. Preview. Ship. Creators of Next.js and deployment platform',
      avatar: 'https://avatars.githubusercontent.com/u/14985020?s=200&v=4',
      stars: '200K+',
      repos: 150,
      category: 'Cloud'
    },
    {
      name: 'angular',
      displayName: 'Angular',
      description: 'The modern web developer\'s platform for building web applications',
      avatar: 'https://avatars.githubusercontent.com/u/139426?s=200&v=4',
      stars: '95K+',
      repos: 80,
      category: 'Framework'
    },
    {
      name: 'nodejs',
      displayName: 'Node.js',
      description: 'Node.js JavaScript runtime built on Chrome\'s V8 JavaScript engine',
      avatar: 'https://avatars.githubusercontent.com/u/9950313?s=200&v=4',
      stars: '106K+',
      repos: 120,
      category: 'Framework'
    },
    {
      name: 'tensorflow',
      displayName: 'TensorFlow',
      description: 'An Open Source Machine Learning Framework for Everyone',
      avatar: 'https://avatars.githubusercontent.com/u/15658638?s=200&v=4',
      stars: '185K+',
      repos: 90,
      category: 'AI/ML'
    },
    {
      name: 'openai',
      displayName: 'OpenAI',
      description: 'Creating safe artificial general intelligence that benefits humanity',
      avatar: 'https://avatars.githubusercontent.com/u/14957082?s=200&v=4',
      stars: '100K+',
      repos: 45,
      category: 'AI/ML'
    },
    {
      name: 'netflix',
      displayName: 'Netflix',
      description: 'Netflix Open Source Software Center - Microservices and cloud tools',
      avatar: 'https://avatars.githubusercontent.com/u/913567?s=200&v=4',
      stars: '75K+',
      repos: 230,
      category: 'Cloud'
    },
    {
      name: 'docker',
      displayName: 'Docker',
      description: 'Docker: the open-source application container engine',
      avatar: 'https://avatars.githubusercontent.com/u/5429470?s=200&v=4',
      stars: '150K+',
      repos: 140,
      category: 'Cloud'
    },
    {
      name: 'aws',
      displayName: 'Amazon Web Services',
      description: 'Amazon Web Services - Cloud computing services and SDKs',
      avatar: 'https://avatars.githubusercontent.com/u/2232217?s=200&v=4',
      stars: '300K+',
      repos: 800,
      category: 'Cloud'
    },
    {
      name: 'kubernetes',
      displayName: 'Kubernetes',
      description: 'Production-Grade Container Orchestration',
      avatar: 'https://avatars.githubusercontent.com/u/13629408?s=200&v=4',
      stars: '110K+',
      repos: 150,
      category: 'Cloud'
    }
  ];

  constructor(
    public dialogRef: MatDialogRef<OrganizationSelectorDialogComponent>
  ) {}

  getFilteredOrganizations(): PublicOrganization[] {
    let filtered = this.publicOrganizations;
    
    // Filter by category
    if (this.selectedCategory !== 'All') {
      filtered = filtered.filter(org => org.category === this.selectedCategory);
    }
    
    // Filter by search query
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(org => 
        org.name.toLowerCase().includes(query) ||
        org.displayName.toLowerCase().includes(query) ||
        org.description.toLowerCase().includes(query)
      );
    }
    
    // Sort
    filtered = [...filtered].sort((a, b) => {
      const aValue = this.getSortValue(a);
      const bValue = this.getSortValue(b);
      return this.sortAsc ? aValue - bValue : bValue - aValue;
    });
    
    return filtered;
  }

  getSortValue(org: PublicOrganization): number {
    if (this.sortBy === 'stars') {
      return parseInt(org.stars?.replace(/[^\d]/g, '') || '0');
    } else if (this.sortBy === 'repos') {
      return org.repos || 0;
    }
    return 0;
  }

  getTotalStars(): string {
    const total = this.publicOrganizations.reduce((sum, org) => {
      return sum + parseInt(org.stars?.replace(/[^\d]/g, '') || '0');
    }, 0);
    if (total >= 1000) {
      return Math.floor(total / 1000) + 'M+';
    }
    return total + 'K+';
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.animateItems = true;
    setTimeout(() => this.animateItems = false, 500);
  }

  toggleSort(): void {
    this.sortAsc = !this.sortAsc;
  }

  selectOrg(orgName: string): void {
    this.selectedOrg = orgName;
    this.customOrgName = '';
  }

  selectCustomOrg(): void {
    if (this.customOrgName.trim() && this.isValidOrgName(this.customOrgName)) {
      this.selectedOrg = this.customOrgName.trim().toLowerCase();
    }
  }

  isValidOrgName(name: string): boolean {
    // GitHub username validation: alphanumeric and hyphens, max 39 chars
    const regex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;
    return regex.test(name);
  }

  clearSearch(): void {
    this.searchQuery = '';
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = 'All';
  }

  onSearchInput(): void {
    this.animateItems = true;
    setTimeout(() => this.animateItems = false, 500);
  }

  onCustomOrgInput(): void {
    if (this.customOrgName) {
      this.selectedOrg = '';
    }
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  trackByOrgName(index: number, org: PublicOrganization): string {
    return org.name;
  }

  onConfirm(): void {
    if (this.selectedOrg) {
      this.dialogRef.close(this.selectedOrg);
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}