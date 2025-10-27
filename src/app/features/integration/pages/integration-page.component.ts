import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { GithubIntegrationService } from '../../../core/services/github-integration.service';
import { IntegrationPanelComponent } from '../components/integration-panel.component';
import { DataViewerSectionComponent } from '../components/data-viewer-section.component';

@Component({
  selector: 'app-integration-page',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    IntegrationPanelComponent,
    DataViewerSectionComponent
  ],
  template: `
    <div class="integration-page">
      <div class="page-header">
        <h1>GitHub Integration</h1>
      </div>
      
      <div class="content-container">
        <!-- Integration Panel -->
        <app-integration-panel></app-integration-panel>
        
        <!-- Data Viewer Section (Shows when connected) -->
        <app-data-viewer-section></app-data-viewer-section>
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
        padding: 20px 24px;
        
        h1 {
          font-size: 24px;
          font-weight: 600;
          color: #24292e;
          margin: 0;
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private integrationService: GithubIntegrationService
  ) {}

  ngOnInit(): void {
    console.log('IntegrationPageComponent initialized');
    
    this.route.queryParams.subscribe(params => {
      console.log('Query params:', params);
      
      if (params['integrated'] === 'true') {
        console.log('OAuth callback detected, handling...');
        this.integrationService.handleOAuthCallback(true);
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true
        });
      }
    });
  }
}