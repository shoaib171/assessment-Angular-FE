import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-collection-selector',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatSelectModule, MatIconModule, TitleCasePipe],
  template: `
    <mat-form-field appearance="outline" class="collection-field">
      <mat-select 
        [value]="selectedCollection" 
        placeholder="Select a collection"
        (selectionChange)="onSelectionChange($event.value)">
        <mat-option value="">Select a collection</mat-option>
        @for (collection of collections; track collection) {
          <mat-option [value]="collection">
            <mat-icon>{{ getCollectionIcon(collection) }}</mat-icon>
            <span class="option-text">{{ collection | titlecase }}</span>
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
        }
      }
    }
    
    mat-icon {
      vertical-align: middle;
      margin-right: 8px;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    
    .option-text {
      vertical-align: middle;
    }
  `]
})
export class CollectionSelectorComponent {
  @Input() collections: string[] = [];
  @Input() selectedCollection: string = '';
  @Output() collectionChange = new EventEmitter<string>();

  onSelectionChange(collection: string): void {
    console.log('Collection selected:', collection);
    this.collectionChange.emit(collection);
  }

  getCollectionIcon(collection: string): string {
    const iconMap: { [key: string]: string } = {
      'organizations': 'business',
      'repos': 'folder',
      'commits': 'commit',
      'issues': 'bug_report',
      'pulls': 'merge_type',
      'users': 'people'
    };
    return iconMap[collection] || 'database';
  }
}