import { useMemo } from 'react';
import { cn } from '../../../utils/cn';
import { Button } from '../Button';

export interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
  showPageNumbers?: boolean;
  maxPageButtons?: number;
}

export function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className,
  showPageNumbers = true,
  maxPageButtons = 5,
}: TablePaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const pageNumbers = useMemo(() => {
    if (totalPages <= maxPageButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis')[] = [];
    const halfButtons = Math.floor(maxPageButtons / 2);

    // Always show first page
    pages.push(1);

    // Calculate start and end of middle section
    let start = Math.max(2, currentPage - halfButtons);
    let end = Math.min(totalPages - 1, currentPage + halfButtons);

    // Adjust if we're near the beginning
    if (currentPage <= halfButtons + 1) {
      end = Math.min(totalPages - 1, maxPageButtons - 1);
    }

    // Adjust if we're near the end
    if (currentPage >= totalPages - halfButtons) {
      start = Math.max(2, totalPages - maxPageButtons + 2);
    }

    // Add ellipsis and pages
    if (start > 2) {
      pages.push('ellipsis');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push('ellipsis');
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages, maxPageButtons]);

  if (totalPages <= 1 && totalItems <= pageSize) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50',
        className
      )}
    >
      {/* Items info */}
      <div className="text-sm text-gray-600">
        Mostrando{' '}
        <span className="font-medium">{startItem}</span>
        {' - '}
        <span className="font-medium">{endItem}</span>
        {' de '}
        <span className="font-medium">{totalItems}</span>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="sr-only">Anterior</span>
        </Button>

        {/* Page numbers */}
        {showPageNumbers && (
          <div className="hidden sm:flex items-center gap-1">
            {pageNumbers.map((page, index) =>
              page === 'ellipsis' ? (
                <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={cn(
                    'min-w-[32px] h-8 px-2 text-sm font-medium rounded-lg transition-colors',
                    currentPage === page
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  {page}
                </button>
              )
            )}
          </div>
        )}

        {/* Mobile page indicator */}
        {showPageNumbers && (
          <span className="sm:hidden text-sm text-gray-600">
            {currentPage} / {totalPages}
          </span>
        )}

        {/* Next button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <span className="sr-only">Siguiente</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
