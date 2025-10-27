import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-collection-selector',
  standalone: true,
  imports: [
    CommonModule, 
    MatFormFieldModule, 
    MatSelectModule, 
    MatIconModule, 
    MatBadgeModule,
    
  ],
  template: `
    <mat-form-field appearance="outline" class="collection-field">
      <mat-label>Select Entity</mat-label>
      <mat-select 
        [value]="selectedCollection" 
        placeholder="Choose a collection"
        (selectionChange)="onSelectionChange($event.value)">
        <mat-option value="">-- Select a collection --</mat-option>
        @for (collection of collections; track collection) {
          <mat-option [value]="collection">
            <div class="option-content">
              <mat-icon [class]="'collection-icon ' + collection">
                {{ getCollectionIcon(collection) }}
              </mat-icon>
              <span class="option-text">{{ formatCollectionName(collection) }}</span>
            </div>
          </mat-option>
        }
      </mat-select>
    </mat-form-field>
  `,
  styles: [`
    .collection-field {
      width: 100%;
      
      ::ng-deep {
        .mat-mdc-form-field-wrapper {
          padding-bottom: 0;
        }
        
        .mat-mdc-text-field-wrapper {
          background: white;
        }
        
        .mat-mdc-form-field-infix {
          padding: 10px 0;
        }
        
        .mat-mdc-select-value {
          font-size: 14px;
          color: #24292e;
          font-weight: 500;
        }
      }
    }
    
    .option-content {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 4px 0;
    }
    
    .collection-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      
      &.organizations { color: #0366d6; }
      &.repos { color: #6f42c1; }
      &.commits { color: #28a745; }
      &.issues { color: #d73a49; }
      &.pulls { color: #6f42c1; }
      &.users { color: #0366d6; }
      &.changelogs { color: #ffa500; }
    }
    
    .option-text {
      font-size: 14px;
      color: #24292e;
    }
  `]
})
export class CollectionSelectorComponent {
  @Input() collections: string[] = [];
  @Input() selectedCollection: string = '';
  @Output() collectionChange = new EventEmitter<string>();

  onSelectionChange(collection: string): void {
    console.log('📂 Collection selected:', collection);
    this.collectionChange.emit(collection);
  }

  getCollectionIcon(collection: string): string {
    const iconMap: { [key: string]: string } = {
      'organizations': 'business',
      'repos': 'folder',
      'commits': 'commit',
      'issues': 'bug_report',
      'pulls': 'merge_type',
      'users': 'people',
      'changelogs': 'history'
    };
    return iconMap[collection] || 'storage';
  }

  formatCollectionName(collection: string): string {
    const nameMap: { [key: string]: string } = {
      'organizations': 'Organizations',
      'repos': 'Repositories',
      'commits': 'Commits',
      'issues': 'Issues',
      'pulls': 'Pull Requests',
      'users': 'Users',
      'changelogs': 'Change Logs'
    };
    return nameMap[collection] || collection;
  }
}