import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  consequences?: string[];
  requireConfirmation?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatIconModule, 
    MatDividerModule,
    MatCheckboxModule,
    FormsModule
  ],
  template: `
    <div class="confirm-dialog" [class]="data.type || 'info'">
      <!-- Icon Header -->
      <div class="dialog-icon-wrapper">
        <div class="icon-container" [class]="data.type || 'info'">
          <mat-icon class="main-icon">{{ getIcon() }}</mat-icon>
        </div>
      </div>
      
      <!-- Title -->
      <h2 mat-dialog-title>{{ data.title }}</h2>
      
      <!-- Content -->
      <mat-dialog-content>
        <p class="main-message">{{ data.message }}</p>
        
        <!-- Consequences List -->
        <div class="consequences-section" *ngIf="data.consequences && data.consequences.length > 0">
          <div class="section-label">
            <mat-icon>warning</mat-icon>
            <span>This will:</span>
          </div>
          <ul class="consequences-list">
            <li *ngFor="let consequence of data.consequences">
              <mat-icon>close</mat-icon>
              <span>{{ consequence }}</span>
            </li>
          </ul>
        </div>
        
        <!-- Warning Box -->
        <div class="warning-box" *ngIf="data.type === 'danger'">
          <mat-icon>error</mat-icon>
          <div class="warning-content">
            <strong>This action cannot be undone.</strong>
            <p>All data will be permanently deleted from the database.</p>
          </div>
        </div>
        
        <!-- Confirmation Checkbox -->
        <div class="confirmation-checkbox" *ngIf="data.requireConfirmation">
          <mat-checkbox [(ngModel)]="isConfirmed" color="warn">
            I understand the consequences and want to proceed
          </mat-checkbox>
        </div>
      </mat-dialog-content>
      
      <mat-divider></mat-divider>
      
      <!-- Actions -->
      <mat-dialog-actions>
        <button 
          mat-stroked-button 
          (click)="onCancel()"
          class="cancel-btn">
          <mat-icon>close</mat-icon>
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button 
          mat-raised-button 
          [color]="data.type === 'danger' ? 'warn' : 'primary'"
          [disabled]="data.requireConfirmation && !isConfirmed"
          (click)="onConfirm()"
          class="confirm-btn">
          <mat-icon>{{ data.type === 'danger' ? 'delete_forever' : 'check' }}</mat-icon>
          {{ data.confirmText || 'Confirm' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      padding: 0;
      max-width: 540px;
      
      // Icon Header
      .dialog-icon-wrapper {
        display: flex;
        justify-content: center;
        padding: 32px 24px 0;
        
        .icon-container {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          animation: iconPulse 2s ease-in-out infinite;
          
          &.danger {
            background: linear-gradient(135deg, #dc3545, #c82333);
            box-shadow: 0 8px 24px rgba(220, 53, 69, 0.3);
          }
          
          &.warning {
            background: linear-gradient(135deg, #ffc107, #ff9800);
            box-shadow: 0 8px 24px rgba(255, 193, 7, 0.3);
          }
          
          &.info {
            background: linear-gradient(135deg, #0366d6, #0256b0);
            box-shadow: 0 8px 24px rgba(3, 102, 214, 0.3);
          }
          
          .main-icon {
            font-size: 48px;
            width: 48px;
            height: 48px;
            color: white;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
          }
          
          // Pulse animation ring
          &::before {
            content: '';
            position: absolute;
            top: -8px;
            left: -8px;
            right: -8px;
            bottom: -8px;
            border-radius: 50%;
            border: 3px solid currentColor;
            opacity: 0;
            animation: ringPulse 2s ease-in-out infinite;
          }
        }
      }
      
      @keyframes iconPulse {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
      }
      
      @keyframes ringPulse {
        0% {
          transform: scale(0.8);
          opacity: 0;
        }
        50% {
          transform: scale(1.2);
          opacity: 0.4;
        }
        100% {
          transform: scale(1.4);
          opacity: 0;
        }
      }
      
      // Title
      h2[mat-dialog-title] {
        text-align: center;
        padding: 20px 24px 8px;
        margin: 0;
        font-size: 24px;
        font-weight: 600;
        color: #24292e;
      }
      
      // Content
      mat-dialog-content {
        padding: 16px 24px 24px !important;
        
        .main-message {
          text-align: center;
          margin: 0 0 24px 0;
          font-size: 15px;
          line-height: 1.6;
          color: #586069;
        }
        
        // Consequences Section
        .consequences-section {
          background: #f6f8fa;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 20px;
          border-left: 3px solid #ffc107;
          
          .section-label {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 600;
            color: #856404;
            margin-bottom: 12px;
            font-size: 14px;
            
            mat-icon {
              font-size: 20px;
              width: 20px;
              height: 20px;
              color: #ffc107;
            }
          }
          
          .consequences-list {
            list-style: none;
            padding: 0;
            margin: 0;
            
            li {
              display: flex;
              align-items: flex-start;
              gap: 12px;
              padding: 8px 0;
              color: #586069;
              font-size: 14px;
              line-height: 1.5;
              
              &:not(:last-child) {
                border-bottom: 1px solid #e1e4e8;
              }
              
              mat-icon {
                font-size: 18px;
                width: 18px;
                height: 18px;
                color: #dc3545;
                flex-shrink: 0;
                margin-top: 2px;
              }
              
              span {
                flex: 1;
              }
            }
          }
        }
        
        // Warning Box
        .warning-box {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: rgba(220, 53, 69, 0.1);
          border: 2px solid rgba(220, 53, 69, 0.3);
          border-radius: 8px;
          margin-bottom: 20px;
          animation: warningPulse 3s ease-in-out infinite;
          
          mat-icon {
            font-size: 24px;
            width: 24px;
            height: 24px;
            color: #dc3545;
            flex-shrink: 0;
          }
          
          .warning-content {
            flex: 1;
            
            strong {
              display: block;
              color: #721c24;
              font-size: 14px;
              margin-bottom: 4px;
            }
            
            p {
              margin: 0;
              color: #721c24;
              font-size: 13px;
              line-height: 1.5;
            }
          }
        }
        
        @keyframes warningPulse {
          0%, 100% {
            background: rgba(220, 53, 69, 0.1);
            border-color: rgba(220, 53, 69, 0.3);
          }
          50% {
            background: rgba(220, 53, 69, 0.15);
            border-color: rgba(220, 53, 69, 0.4);
          }
        }
        
        // Confirmation Checkbox
        .confirmation-checkbox {
          padding: 16px;
          background: #fff3cd;
          border-radius: 8px;
          border: 1px solid #ffc107;
          
          ::ng-deep .mat-mdc-checkbox {
            .mdc-checkbox__background {
              border-color: #dc3545;
            }
            
            &.mat-mdc-checkbox-checked .mdc-checkbox__background {
              background-color: #dc3545;
              border-color: #dc3545;
            }
          }
          
          ::ng-deep .mdc-label {
            color: #856404;
            font-weight: 500;
            font-size: 14px;
          }
        }
      }
      
      mat-divider {
        margin: 0;
        border-top-color: #e1e4e8;
      }
      
      // Actions
      mat-dialog-actions {
        padding: 20px 24px;
        margin: 0;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        background: #f6f8fa;
        
        button {
          min-width: 120px;
          height: 40px;
          font-weight: 600;
          transition: all 0.3s ease;
          
          mat-icon {
            margin-right: 6px;
            font-size: 20px;
            width: 20px;
            height: 20px;
          }
          
          &.cancel-btn {
            &:hover {
              background-color: #e1e4e8;
              transform: translateY(-1px);
            }
          }
          
          &.confirm-btn {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            
            &:hover:not([disabled]) {
              transform: translateY(-2px);
              box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
            }
            
            &[disabled] {
              opacity: 0.5;
              cursor: not-allowed;
              box-shadow: none;
            }
            
            &[color="warn"]:not([disabled]) {
              background: linear-gradient(135deg, #dc3545, #c82333);
              
              &:hover {
                background: linear-gradient(135deg, #c82333, #bd2130);
                box-shadow: 0 4px 16px rgba(220, 53, 69, 0.4);
              }
              
              &:active {
                transform: translateY(0);
                box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
              }
            }
          }
        }
      }
      
      // Type-specific styling
      &.danger {
        h2 {
          color: #721c24;
        }
        
        .icon-container::before {
          color: #dc3545;
        }
      }
      
      &.warning {
        h2 {
          color: #856404;
        }
        
        .icon-container::before {
          color: #ffc107;
        }
      }
      
      &.info {
        h2 {
          color: #004085;
        }
        
        .icon-container::before {
          color: #0366d6;
        }
      }
    }
    
    // Responsive
    @media (max-width: 600px) {
      .confirm-dialog {
        .dialog-icon-wrapper {
          .icon-container {
            width: 64px;
            height: 64px;
            
            .main-icon {
              font-size: 36px;
              width: 36px;
              height: 36px;
            }
          }
        }
        
        h2[mat-dialog-title] {
          font-size: 20px;
        }
        
        mat-dialog-content {
          .main-message {
            font-size: 14px;
          }
          
          .consequences-section .consequences-list li {
            font-size: 13px;
          }
        }
        
        mat-dialog-actions {
          flex-direction: column-reverse;
          
          button {
            width: 100%;
          }
        }
      }
    }
  `]
})
export class ConfirmDialogComponent {
  isConfirmed = false;

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

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}