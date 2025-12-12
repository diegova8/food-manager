import { useMemo } from 'react';
import { cn } from '../../../utils/cn';
import { TablePagination } from './TablePagination';
import { EmptyState } from '../../shared/EmptyState';
import { LoadingState } from '../../shared/LoadingState';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render: (item: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  getRowKey: (item: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  emptyTitle?: string;
  emptyAction?: {
    label: string;
    onClick: () => void;
  };
  // Selection
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  // Sorting
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  // Pagination
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
  };
  // Row interactions
  onRowClick?: (item: T) => void;
  rowClassName?: (item: T) => string;
  // Styling
  className?: string;
  compact?: boolean;
  striped?: boolean;
  hoverable?: boolean;
}

export function DataTable<T>({
  data,
  columns,
  getRowKey,
  isLoading = false,
  emptyMessage = 'No hay datos disponibles',
  emptyTitle,
  emptyAction,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  sortBy,
  sortOrder,
  onSort,
  pagination,
  onRowClick,
  rowClassName,
  className,
  compact = false,
  striped = false,
  hoverable = true,
}: DataTableProps<T>) {
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const allSelected = useMemo(
    () => data.length > 0 && data.every((item) => selectedSet.has(getRowKey(item))),
    [data, selectedSet, getRowKey]
  );

  const someSelected = useMemo(
    () => data.some((item) => selectedSet.has(getRowKey(item))),
    [data, selectedSet, getRowKey]
  );

  const handleSelectAll = () => {
    if (!onSelectionChange) return;

    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map(getRowKey));
    }
  };

  const handleSelectRow = (id: string) => {
    if (!onSelectionChange) return;

    const newSelection = selectedSet.has(id)
      ? selectedIds.filter((i) => i !== id)
      : [...selectedIds, id];
    onSelectionChange(newSelection);
  };

  const handleSort = (columnKey: string) => {
    if (!onSort) return;
    onSort(columnKey);
  };

  if (isLoading) {
    return (
      <div className={cn('bg-white rounded-xl border border-gray-200', className)}>
        <LoadingState variant="skeleton" rows={5} />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn('bg-white rounded-xl border border-gray-200', className)}>
        <EmptyState
          title={emptyTitle}
          message={emptyMessage}
          action={emptyAction}
        />
      </div>
    );
  }

  return (
    <div
      className={cn('bg-white rounded-xl border border-gray-200 overflow-hidden', className)}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected && !allSelected;
                    }}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600',
                    compact ? 'py-2' : 'py-3',
                    column.sortable && 'cursor-pointer select-none hover:bg-gray-100',
                    column.width,
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right'
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div
                    className={cn(
                      'flex items-center gap-1',
                      column.align === 'center' && 'justify-center',
                      column.align === 'right' && 'justify-end'
                    )}
                  >
                    {column.header}
                    {column.sortable && sortBy === column.key && (
                      <span className="text-orange-500">
                        {sortOrder === 'asc' ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </span>
                    )}
                    {column.sortable && sortBy !== column.key && (
                      <span className="text-gray-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item, index) => {
              const id = getRowKey(item);
              const isSelected = selectedSet.has(id);
              const customRowClass = rowClassName?.(item);

              return (
                <tr
                  key={id}
                  className={cn(
                    'transition-colors',
                    isSelected && 'bg-orange-50',
                    striped && index % 2 === 1 && !isSelected && 'bg-gray-50/50',
                    hoverable && !isSelected && 'hover:bg-gray-50',
                    onRowClick && 'cursor-pointer',
                    customRowClass
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {selectable && (
                    <td
                      className={cn('px-4', compact ? 'py-2' : 'py-3')}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(id)}
                        className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        'px-4 text-sm text-gray-900',
                        compact ? 'py-2' : 'py-3',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right'
                      )}
                    >
                      {column.render(item, index)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pagination && (
        <TablePagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          onPageChange={pagination.onPageChange}
        />
      )}
    </div>
  );
}
