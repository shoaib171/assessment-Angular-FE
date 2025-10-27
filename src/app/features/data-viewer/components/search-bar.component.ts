import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule],
  template: `
    <div class="search-wrapper">
      <mat-form-field appearance="outline" class="search-field">
        <input 
          matInput 
          type="text" 
          [value]="searchQuery"
          (input)="onSearchInput($event)"
          placeholder="Search across all fields...">
        @if (searchQuery) {
          <button 
            mat-icon-button 
            matSuffix 
            (click)="clearSearch()"
            class="clear-btn">
            <mat-icon>close</mat-icon>
          </button>
        }
      </mat-form-field>
      <p class="search-hint">
        <mat-icon>info</mat-icon>
        Search applies to all columns
      </p>
    </div>
  `,
  styles: [`
    .search-wrapper {
      width: 100%;
    }
    
    .search-field {
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
        
        input {
          font-size: 14px;
        }
        
        .clear-btn {
          mat-icon {
            font-size: 18px;
          }
        }
      }
    }
    
    .search-hint {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #586069;
      margin: 6px 0 0 0;
      
      mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }
    }
  `]
})
export class SearchBarComponent implements OnDestroy {
  @Input() searchQuery: string = '';
  @Output() searchChange = new EventEmitter<string>();
  
  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(query => {
      console.log('Search query:', query);
      this.searchChange.emit(query);
    });
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchChange.emit('');
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }
}