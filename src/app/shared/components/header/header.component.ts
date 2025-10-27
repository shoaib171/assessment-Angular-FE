import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule],
  template: `
    <mat-toolbar class="header">
      <button mat-icon-button (click)="navigateHome()">
        <mat-icon>home</mat-icon>
      </button>
      <span class="title">{{ title }}</span>
      <span class="spacer"></span>
      
      <button mat-button [matMenuTriggerFor]="menu" class="menu-btn">
        <mat-icon>menu</mat-icon>
        Menu
      </button>
      <mat-menu #menu="matMenu">
        <button mat-menu-item (click)="navigateHome()">
          <mat-icon>settings_input_component</mat-icon>
          <span>Integration</span>
        </button>
        <button mat-menu-item (click)="navigateToDataViewer()">
          <mat-icon>dashboard</mat-icon>
          <span>Data Viewer</span>
        </button>
        <button mat-menu-item (click)="navigateToOrgExplorer()">
          <mat-icon>business</mat-icon>
          <span>Organization Explorer</span>
        </button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [`
    .header {
      background: #24292e;
      color: white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
      position: sticky;
      top: 0;
      z-index: 100;
      
      .title {
        font-size: 18px;
        font-weight: 600;
        margin-left: 8px;
      }
      
      .spacer {
        flex: 1 1 auto;
      }
      
      .menu-btn {
        color: white;
      }
    }
  `]
})
export class HeaderComponent {
  @Input() title: string = 'GitHub Integration Dashboard';
  
  constructor(private router: Router) {}
  
  navigateHome(): void {
    this.router.navigate(['/integration']);
  }
  
  navigateToDataViewer(): void {
    this.router.navigate(['/data-viewer']);
  }
  
  navigateToOrgExplorer(): void {
    this.router.navigate(['/organization-explorer']);
  }
}