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
import { ColDef, GridOptions, GridReadyEvent } from 'ag-grid-community';
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
  private gridApi: any;

  constructor() {
    this.gridOptions = {
      pagination: false,
      domLayout: 'autoHeight',
      suppressCellFocus: true,
      animateRows: true,
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columnDefs'] && this.columnDefs.length > 0) {
      this.columnDefs = this.columnDefs.map((col) => ({
        ...col,
        cellRenderer: this.cellRenderer.bind(this),
      }));
    }
  }

  cellRenderer(params: any): string {
    const value = params.value;
    const field = params.colDef.field;

    if (value === null || value === undefined) {
      return '<span style="color: #999; font-style: italic;">N/A</span>';
    }

    // Special handling for owner object
    if (
      field === 'owner' &&
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      const login = value.login || value.username || value.name || 'Unknown';
      return `<span style="color: #24292e;">${this.escapeHtml(login)}</span>`;
    }

    // Special handling for user object
    if (
      (field === 'user' || field === 'author') &&
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      const login = value.login || value.username || value.name || 'Unknown';
      return `<span style="color: #24292e;">${this.escapeHtml(login)}</span>`;
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

    // Handle URLs
    if (typeof value === 'string' && value.startsWith('http')) {
      const displayUrl =
        value.length > 50 ? value.substring(0, 47) + '...' : value;
      return `<a href="${this.escapeHtml(
        value
      )}" target="_blank" style="color: #0366d6; text-decoration: none;">${this.escapeHtml(
        displayUrl
      )}</a>`;
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
      return `<span style="color: #24292e;">${formatted}</span>`;
    }

    // Handle regular strings and numbers
    const strValue = String(value);
    if (strValue.length > 100) {
      return `<span style="color: #24292e;" title="${this.escapeHtml(
        strValue
      )}">${this.escapeHtml(strValue.substring(0, 97))}...</span>`;
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
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    console.log('Grid ready, API stored');

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
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getEndRecord(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalRecords);
  }
}
