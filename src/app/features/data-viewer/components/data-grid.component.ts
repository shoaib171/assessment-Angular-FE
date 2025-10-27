import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions, GridReadyEvent, GridApi } from 'ag-grid-community';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-data-grid',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    AgGridAngular,
    LoadingSpinnerComponent,
  ],
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.scss'],
})
export class DataGridComponent implements OnChanges {
  @Input() data: any[] = [];
  @Input() columnDefs: ColDef[] = [];
  @Input() loading: boolean = false;
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 50;
  @Input() totalRecords: number = 0;

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<{
    field: string;
    direction: 'asc' | 'desc';
  }>();

  gridOptions: GridOptions;
  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 100,
    flex: 1,
  };

  pageSizeOptions = [10, 25, 50, 100, 200, 500];
  private gridApi: GridApi | null = null;

  constructor() {
    this.gridOptions = {
      pagination: false,
      domLayout: 'autoHeight',
      suppressCellFocus: true,
      animateRows: true,
      rowHeight: 48,
      headerHeight: 48,
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columnDefs'] && this.columnDefs.length > 0) {
      this.columnDefs = this.columnDefs.map((col) => ({
        ...col,
        cellRenderer: this.cellRenderer.bind(this),
      }));
    }

    if (changes['data'] && this.gridApi) {
      setTimeout(() => {
        this.gridApi?.sizeColumnsToFit();
      }, 100);
    }
  }

  cellRenderer(params: any): string {
    const value = params.value;
    const field = params.colDef.field;

    if (value === null || value === undefined) {
      return '<span style="color: #999; font-style: italic;">N/A</span>';
    }

    // Handle MongoDB ObjectId
    if (field === '_id' && typeof value === 'string' && value.length === 24) {
      return `<span style="color: #6f42c1; font-family: monospace; font-size: 11px;">${this.escapeHtml(value)}</span>`;
    }

    // Handle owner/user objects (common in GitHub data)
    if (
      (field === 'owner' || field === 'user' || field === 'author' || field === 'committer') &&
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      const login = value.login || value.username || value.name || 'Unknown';
      const avatarUrl = value.avatar_url || value.avatarUrl;
      
      if (avatarUrl) {
        return `
          <div style="display: flex; align-items: center; gap: 8px;">
            <img src="${this.escapeHtml(avatarUrl)}" 
                 style="width: 24px; height: 24px; border-radius: 50%;" 
                 alt="${this.escapeHtml(login)}">
            <span style="color: #24292e;">${this.escapeHtml(login)}</span>
          </div>
        `;
      }
      
      return `<span style="color: #24292e;">${this.escapeHtml(login)}</span>`;
    }

    // Handle assignee/assignees
    if (field === 'assignee' && typeof value === 'object' && !Array.isArray(value)) {
      const login = value.login || 'Unknown';
      return `<span style="color: #24292e;">👤 ${this.escapeHtml(login)}</span>`;
    }

    if (field === 'assignees' && Array.isArray(value)) {
      if (value.length === 0) return '<span style="color: #999;">None</span>';
      const names = value.map(a => a.login || 'Unknown').join(', ');
      return `<span style="color: #24292e;">👥 ${this.escapeHtml(names)}</span>`;
    }

    // Handle labels array
    if (field === 'labels' && Array.isArray(value)) {
      if (value.length === 0) return '<span style="color: #999;">No labels</span>';
      const labels = value.slice(0, 3).map(l => {
        const name = l.name || l;
        const color = l.color || '999';
        return `<span style="background: #${color}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-right: 4px;">${this.escapeHtml(name)}</span>`;
      }).join('');
      const more = value.length > 3 ? `<span style="color: #999;">+${value.length - 3}</span>` : '';
      return labels + more;
    }

    // Handle topics array (repos)
    if (field === 'topics' && Array.isArray(value)) {
      if (value.length === 0) return '<span style="color: #999;">No topics</span>';
      const topics = value.slice(0, 3).map(t => 
        `<span style="background: #0366d6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-right: 4px;">${this.escapeHtml(t)}</span>`
      ).join('');
      const more = value.length > 3 ? `<span style="color: #999;">+${value.length - 3}</span>` : '';
      return topics + more;
    }

    // Handle state field with colors
    if (field === 'state') {
      const stateColors: { [key: string]: string } = {
        'open': '#28a745',
        'closed': '#d73a49',
        'merged': '#6f42c1',
        'pending': '#ffa500'
      };
      const color = stateColors[value.toLowerCase()] || '#999';
      return `<span style="color: ${color}; font-weight: 600;">● ${this.escapeHtml(value.toUpperCase())}</span>`;
    }

    // Handle merged boolean for PRs
    if (field === 'merged' && typeof value === 'boolean') {
      return value
        ? '<span style="color: #6f42c1; font-weight: 600;">✓ MERGED</span>'
        : '<span style="color: #999;">NOT MERGED</span>';
    }

    // Handle private boolean for repos
    if (field === 'private' && typeof value === 'boolean') {
      return value
        ? '<span style="color: #d73a49;">🔒 Private</span>'
        : '<span style="color: #28a745;">🌐 Public</span>';
    }

    // Handle nested objects (show as expandable JSON)
    if (typeof value === 'object' && !Array.isArray(value)) {
      const preview = JSON.stringify(value).substring(0, 50) + '...';
      return `<span style="color: #0366d6; cursor: pointer; font-size: 12px;" title="${this.escapeHtml(
        JSON.stringify(value, null, 2)
      )}">${this.escapeHtml(preview)}</span>`;
    }

    // Handle arrays
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return '<span style="color: #999;">Empty</span>';
      }
      return `<span style="color: #6f42c1; cursor: pointer;" title="${this.escapeHtml(
        JSON.stringify(value, null, 2)
      )}">[${value.length} items]</span>`;
    }

    // Handle booleans with visual indicators
    if (typeof value === 'boolean') {
      return value
        ? '<span style="color: #28a745; font-weight: 500;">✓ True</span>'
        : '<span style="color: #d73a49; font-weight: 500;">✗ False</span>';
    }

    // Handle numbers with formatting
    if (typeof value === 'number') {
      if (field.includes('count') || field.includes('Count')) {
        return `<span style="color: #0366d6; font-weight: 500;">${value.toLocaleString()}</span>`;
      }
      return `<span style="color: #24292e;">${value.toLocaleString()}</span>`;
    }

    // Handle URLs
    if (typeof value === 'string' && value.startsWith('http')) {
      const displayUrl = value.length > 50 ? value.substring(0, 47) + '...' : value;
      return `<a href="${this.escapeHtml(value)}" target="_blank" style="color: #0366d6; text-decoration: none;">${this.escapeHtml(displayUrl)}</a>`;
    }

    // Handle dates
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
      const date = new Date(value);
      const formatted = date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      return `<span style="color: #586069;" title="${value}">${formatted}</span>`;
    }

    // Handle git commit SHA
    if (field === 'sha' && typeof value === 'string') {
      const short = value.substring(0, 7);
      return `<span style="color: #0366d6; font-family: monospace; font-size: 12px;" title="${this.escapeHtml(value)}">${this.escapeHtml(short)}</span>`;
    }

    // Handle regular strings
    const strValue = String(value);
    if (strValue.length > 100) {
      return `<span style="color: #24292e;" title="${this.escapeHtml(strValue)}">${this.escapeHtml(strValue.substring(0, 97))}...</span>`;
    }

    return `<span style="color: #24292e;">${this.escapeHtml(strValue)}</span>`;
  }

  escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return String(text).replace(/[&<>"']/g, (m) => map[m]);
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    console.log('✅ Grid ready, API stored');

    setTimeout(() => {
      if (this.gridApi) {
        this.gridApi.sizeColumnsToFit();
      }
    }, 100);
  }

  onPreviousPage(): void {
    if (this.currentPage > 1) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  onNextPage(): void {
    const totalPages = this.getTotalPages();
    if (this.currentPage < totalPages) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }

  onPageSizeChangeEvent(size: number): void {
    this.pageSizeChange.emit(size);
  }

  getTotalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  getStartRecord(): number {
    return this.totalRecords === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  getEndRecord(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalRecords);
  }
}