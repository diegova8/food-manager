import { cn } from '../../../utils/cn';
import { SearchInput } from '../../shared/SearchInput';

interface OrderFiltersProps {
  statusFilter: string;
  onStatusChange: (status: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalOrders: number;
  totalAmount: number;
  selectedCount?: number;
  onBulkDelete?: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
}

interface StatusFilter {
  id: string;
  label: string;
  color: 'slate' | 'amber' | 'blue' | 'emerald' | 'red';
  count?: number;
}

const statusFilters: StatusFilter[] = [
  { id: '', label: 'Todos', color: 'slate' },
  { id: 'pending', label: 'Pendientes', color: 'amber' },
  { id: 'confirmed', label: 'Confirmados', color: 'blue' },
  { id: 'ready', label: 'Listos', color: 'emerald' },
  { id: 'completed', label: 'Completados', color: 'slate' },
  { id: 'cancelled', label: 'Cancelados', color: 'red' },
];

const colorClasses = {
  slate: {
    active: 'bg-slate-600 text-white',
    inactive: 'bg-slate-100 text-slate-600 hover:bg-slate-200',
  },
  amber: {
    active: 'bg-amber-500 text-white',
    inactive: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
  },
  blue: {
    active: 'bg-blue-500 text-white',
    inactive: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  },
  emerald: {
    active: 'bg-emerald-500 text-white',
    inactive: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
  },
  red: {
    active: 'bg-red-500 text-white',
    inactive: 'bg-red-100 text-red-700 hover:bg-red-200',
  },
};

export function OrderFilters({
  statusFilter,
  onStatusChange,
  searchQuery,
  onSearchChange,
  totalOrders,
  totalAmount,
  selectedCount = 0,
  onBulkDelete,
  onRefresh,
  onExport,
}: OrderFiltersProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 space-y-4">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Gestión de Pedidos</h2>
          <p className="text-slate-500 text-sm mt-1">
            {totalOrders} pedidos • Total:{' '}
            <span className="font-bold text-orange-600">
              {new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC' }).format(totalAmount)}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedCount > 0 && onBulkDelete && (
            <button
              onClick={onBulkDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Eliminar ({selectedCount})
            </button>
          )}
          {onExport && (
            <button
              onClick={onExport}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-xl font-medium transition-colors"
              title="Exportar a CSV"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden sm:inline">Exportar</span>
            </button>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
              title="Actualizar lista"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">Actualizar</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and filters row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="w-full sm:w-72">
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Buscar por nombre, teléfono, ID..."
          />
        </div>

        {/* Status filters */}
        <div className="flex gap-2 flex-wrap flex-1">
          {statusFilters.map((filter) => {
            const isActive = statusFilter === filter.id;
            const classes = colorClasses[filter.color];

            return (
              <button
                key={filter.id}
                onClick={() => onStatusChange(filter.id)}
                className={cn(
                  'px-4 py-2 rounded-xl font-medium transition-all text-sm',
                  isActive ? classes.active : classes.inactive
                )}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default OrderFilters;
