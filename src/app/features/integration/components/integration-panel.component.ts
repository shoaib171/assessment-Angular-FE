import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { GithubIntegrationService } from '../../../core/services/github-integration.service';
import { IntegrationStatus } from '../../../core/models/integration.model';
import { FormatDatePipe } from '../../../shared/pipes/format-date.pipe';

@Component({
  selector: 'app-integration-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    FormatDatePipe
  ],
  templateUrl: './integration-panel.component.html',
  styleUrls: ['./integration-panel.component.scss']
})
export class IntegrationPanelComponent implements OnInit {
  integrationStatus: IntegrationStatus = {
    connected: false,
    connectedAt: null,
    user: null
  };
  loading = true;
  syncing = false;
  panelExpanded = false;

  constructor(
    private integrationService: GithubIntegrationService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    console.log('IntegrationPanelComponent initialized');
    this.checkStatus();
  }

  checkStatus(): void {
    this.loading = true;
    this.integrationService.checkIntegrationStatus().subscribe({
      next: (status) => {
        console.log('Integration status:', status);
        this.integrationStatus = status;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error checking integration status:', err);
        this.loading = false;
        this.snackBar.open('Failed to check integration status', 'Close', { duration: 3000 });
      }
    });
  }

  connectGithub(): void {
    console.log('Connect GitHub button clicked');
    this.integrationService.connectGithub();
  }

  removeIntegration(): void {
    if (confirm('Are you sure you want to remove this integration?')) {
      this.loading = true;
      this.integrationService.removeIntegration(true).subscribe({
        next: (result) => {
          console.log('Integration removed:', result);
          this.snackBar.open('Integration removed successfully', 'Close', { duration: 3000 });
          this.checkStatus();
        },
        error: (err) => {
          console.error('Error removing integration:', err);
          this.loading = false;
          this.snackBar.open('Failed to remove integration', 'Close', { duration: 3000 });
        }
      });
    }
  }

  resyncIntegration(): void {
    this.syncing = true;
    console.log('Starting resync...');
    this.integrationService.resyncIntegration().subscribe({
      next: (result) => {
        console.log('Sync result:', result);
        this.syncing = false;
        this.snackBar.open(
          `Synced: ${result.orgs} orgs, ${result.repos} repos, ${result.commits} commits, ${result.pulls} PRs, ${result.issues} issues`,
          'Close',
          { duration: 5000 }
        );
      },
      error: (err) => {
        console.error('Error syncing:', err);
        this.syncing = false;
        this.snackBar.open('Sync failed. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  navigateToDataViewer(): void {
    if (this.integrationStatus.connected) {
      this.router.navigate(['/data-viewer']);
    }
  }

  navigateToOrgExplorer(): void {
    if (this.integrationStatus.connected) {
      this.router.navigate(['/organization-explorer']);
    }
  }
}