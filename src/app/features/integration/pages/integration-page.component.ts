import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { IntegrationPanelComponent } from '../components/integration-panel.component';
import { DataViewerSectionComponent } from '../components/data-viewer-section.component';

@Component({
  selector: 'app-integration-page',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    MatSnackBarModule,
    IntegrationPanelComponent,
    DataViewerSectionComponent
    
  ],
  template: `
    <div class="integration-page">
      <div class="page-header">
        <div class="header-content">
          <div class="header-left">
            <mat-icon class="header-icon">integration_instructions</mat-icon>
            <div>
              <h1>GitHub Integration</h1>
              <p class="header-subtitle">Connect and manage your GitHub data</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="content-container">
        <!-- Integration Panel -->
        <app-integration-panel 
          (statusChanged)="onStatusChanged($event)">
        </app-integration-panel>
        
        <!-- Data Viewer Section (Shows when connected) -->
        <app-data-viewer-section 
          [isConnected]="isConnected">
        </app-data-viewer-section>
      </div>
    </div>
  `,
  styles: [`
    .integration-page {
      min-height: 100vh;
      background: #f5f7fa;
      
      .page-header {
        background: white;
        border-bottom: 1px solid #e1e4e8;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
        
        .header-content {
          max-width: 1600px;
          margin: 0 auto;
          padding: 24px;
          
          .header-left {
            display: flex;
            align-items: center;
            gap: 16px;
            
            .header-icon {
              font-size: 40px;
              width: 40px;
              height: 40px;
              color: #0366d6;
            }
            
            h1 {
              font-size: 28px;
              font-weight: 600;
              color: #24292e;
              margin: 0;
            }
            
            .header-subtitle {
              font-size: 14px;
              color: #586069;
              margin: 4px 0 0 0;
            }
          }
        }
      }
      
      .content-container {
        max-width: 1600px;
        margin: 0 auto;
        padding: 24px;
      }
    }
  `]
})
export class IntegrationPageComponent implements OnInit {
  isConnected = false;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    console.log('🚀 IntegrationPageComponent initialized');
    // Handle OAuth callback
    this.route.queryParams.subscribe(params => {
      console.log('📋 Query params:', params);
      if (params['integrated'] === 'true') {
        console.log('✅ OAuth callback detected - Integration successful!');
        const userId = params['userId'];
        console.log('👤 User ID:', userId);
        // Show success message
        this.snackBar.open(
          '✅ GitHub integration successful! Your account has been connected.',
          'Close',
          {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          }
        );
        // Clean up URL
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true
        }).then(() => {
          // Force a reload of the integration status
          window.location.reload();
        });
      } else if (params['error']) {
        console.error('❌ OAuth error:', params['error']);
        
        this.snackBar.open(
          `❌ Integration failed: ${params['error']}`,
          'Close',
          {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          }
        );
        // Clean up URL
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true
        });
      }
    });
  }

  onStatusChanged(status: any): void {
    console.log('📊 Integration status changed:', status);
    this.isConnected = status.connected;
  }
}