import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { GithubIntegrationService } from '../../../core/services/github-integration.service';
import { IntegrationStatus } from '../../../core/models/integration.model';
import { FormatDatePipe } from '../../../shared/pipes/format-date.pipe';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

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
    MatDialogModule,
    FormatDatePipe
  ],
  templateUrl: './integration-panel.component.html',
  styleUrls: ['./integration-panel.component.scss']
})
export class IntegrationPanelComponent implements OnInit {
  integrationStatus: IntegrationStatus = {
    connected: false,
    connectedAt: null,
    user: null,
    lastSyncedAt: null,
    syncStatus: 'pending',
    dataCounts: null
  };
  
  loading = true;
  syncing = false;
  panelExpanded = false;

  @Output() statusChanged = new EventEmitter<IntegrationStatus>();

  constructor(
    private integrationService: GithubIntegrationService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    console.log('🚀 IntegrationPanelComponent initialized');
    this.checkStatus();
  }

  checkStatus(): void {
    this.loading = true;
    console.log('🔍 Checking integration status...');
    
    this.integrationService.checkIntegrationStatus().subscribe({
      next: (status) => {
        console.log('✅ Integration status loaded:', status);
        this.integrationStatus = status;
        this.loading = false;
        this.statusChanged.emit(status);
        
        if (status.connected) {
          console.log('✅ Integration is active');
          console.log('👤 User:', status.user);
          console.log('📊 Data counts:', status.dataCounts);
        } else {
          console.log('⚠️ No active integration');
        }
      },
      error: (err) => {
        console.error('❌ Error checking integration status:', err);
        this.loading = false;
        
        // If error, assume not connected
        this.integrationStatus = {
          connected: false,
          connectedAt: null,
          user: null,
          lastSyncedAt: null,
          syncStatus: 'pending',
          dataCounts: null
        };
        this.statusChanged.emit(this.integrationStatus);
        
        const errorMessage = err.error?.error || err.message || 'Failed to check integration status';
        this.showErrorMessage(errorMessage);
      }
    });
  }

  connectGithub(): void {
    console.log('🔗 Initiating GitHub OAuth flow...');
    this.showInfoMessage('Redirecting to GitHub...');
    this.integrationService.connectGithub();
  }

  removeIntegration(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        title: 'Remove GitHub Integration',
        message: `Are you sure you want to remove this integration?\n\nThis will:\n• Disconnect your GitHub account\n• Delete ALL synced data from the database\n• Remove all organizations, repos, commits, issues, and pull requests\n• Delete your user information\n\nThis action cannot be undone.`,
        confirmText: 'Remove Integration',
        cancelText: 'Cancel',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.performRemoveIntegration();
      }
    });
  }

  private performRemoveIntegration(): void {
    this.loading = true;
    console.log('🗑️ Removing integration...');
    
    this.integrationService.removeIntegration(true).subscribe({
      next: (result) => {
        console.log('✅ Integration removed successfully:', result);
        
        // Update status immediately to disconnected
        this.integrationStatus = {
          connected: false,
          connectedAt: null,
          user: null,
          lastSyncedAt: null,
          syncStatus: 'pending',
          dataCounts: null
        };
        
        this.loading = false;
        this.panelExpanded = false;
        this.statusChanged.emit(this.integrationStatus);
        
        this.showSuccessMessage('✅ Integration removed successfully. All data has been deleted.');
      },
      error: (err) => {
        console.error('❌ Error removing integration:', err);
        this.loading = false;
        
        const errorMessage = err.error?.error || err.message || 'Failed to remove integration';
        this.showErrorMessage(errorMessage);
      }
    });
  }

  resyncIntegration(): void {
    this.syncing = true;
    console.log('🔄 Starting data sync...');
    this.showInfoMessage('Syncing GitHub data... This may take a few moments.');
    
    this.integrationService.resyncIntegration().subscribe({
      next: (result) => {
        console.log('✅ Sync completed:', result);
        this.syncing = false;
        
        this.showSuccessMessage(
          `✅ Synced: ${result.organizations} orgs, ${result.repos} repos, ` +
          `${result.commits} commits, ${result.pulls} PRs, ${result.issues} issues, ` +
          `${result.users} users, ${result.changelogs} changelogs`,
          5000
        );
        
        // Refresh status to get updated counts
        this.checkStatus();
      },
      error: (err) => {
        console.error('❌ Sync failed:', err);
        this.syncing = false;
        
        const errorMessage = err.error?.error || err.error?.details || err.message || 'Sync failed';
        this.showErrorMessage(`Sync failed: ${errorMessage}`);
      }
    });
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