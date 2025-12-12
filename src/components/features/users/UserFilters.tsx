import { SearchInput } from '../../shared/SearchInput';

interface UserFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  emailVerifiedFilter: string;
  onEmailVerifiedChange: (value: string) => void;
  isAdminFilter: string;
  onIsAdminChange: (value: string) => void;
  totalCount: number;
  selectedCount: number;
  onBulkDelete?: () => void;
  onClearFilters: () => void;
  onExport?: () => void;
}

export function UserFilters({
  search,
  onSearchChange,
  emailVerifiedFilter,
  onEmailVerifiedChange,
  isAdminFilter,
  onIsAdminChange,
  totalCount,
  selectedCount,
  onBulkDelete,
  onClearFilters,
  onExport,
}: UserFiltersProps) {
  const hasFilters = search || emailVerifiedFilter || isAdminFilter;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Gestión de Usuarios</h2>
          <p className="text-slate-500 text-sm mt-1">
            <span className="font-semibold text-slate-800">{totalCount}</span> usuarios encontrados
            {selectedCount > 0 && (
              <span className="ml-2 text-blue-600">({selectedCount} seleccionados)</span>
            )}
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
        </div>
      </div>

      {/* Filters row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <SearchInput
            value={search}
            onChange={onSearchChange}
            placeholder="Buscar por nombre, email..."
          />
        </div>

        {/* Email Verified Filter */}
        <div>
          <select
            value={emailVerifiedFilter}
            onChange={(e) => onEmailVerifiedChange(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
          >
            <option value="">Estado del Email</option>
            <option value="true">Verificado</option>
            <option value="false">No verificado</option>
          </select>
        </div>

        {/* Admin Filter */}
        <div>
          <select
            value={isAdminFilter}
            onChange={(e) => onIsAdminChange(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
          >
            <option value="">Tipo de Usuario</option>
            <option value="false">Clientes</option>
            <option value="true">Administradores</option>
          </select>
        </div>

        {/* Clear Filters */}
        <div className="flex items-center">
          {hasFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpiar filtros
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserFilters;
