import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-dialog" [class]="data.type || 'info'">
      <h2 mat-dialog-title>
        <mat-icon>{{ getIcon() }}</mat-icon>
        {{ data.title }}
      </h2>
      
      <mat-dialog-content>
        <p [innerHTML]="formatMessage(data.message)"></p>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button 
          mat-raised-button 
          [color]="data.type === 'danger' ? 'warn' : 'primary'"
          (click)="onConfirm()">
          {{ data.confirmText || 'Confirm' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      h2 {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0;
        color: #24292e;
        
        mat-icon {
          font-size: 28px;
          width: 28px;
          height: 28px;
        }
      }
      
      &.danger h2 mat-icon { color: #d73a49; }
      &.warning h2 mat-icon { color: #ffa500; }
      &.info h2 mat-icon { color: #0366d6; }
      
      mat-dialog-content {
        padding: 20px 0;
        
        p {
          margin: 0;
          line-height: 1.6;
          color: #586069;
          white-space: pre-line;
        }
      }
      
      mat-dialog-actions {
        padding: 12px 0 0 0;
        margin: 0;
        
        button {
          margin-left: 8px;
        }
      }
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  getIcon(): string {
    switch (this.data.type) {
      case 'danger': return 'warning';
      case 'warning': return 'error_outline';
      default: return 'info';
    }
  }

  formatMessage(message: string): string {
    return message.replace(/\n/g, '<br>');
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}