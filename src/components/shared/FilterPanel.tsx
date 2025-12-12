import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
  value: string | string[];
  multiple?: boolean;
}

export interface FilterPanelProps {
  filters: FilterGroup[];
  onChange: (filterId: string, value: string | string[]) => void;
  onClear?: () => void;
  className?: string;
  layout?: 'horizontal' | 'vertical';
}

export function FilterPanel({
  filters,
  onChange,
  onClear,
  className,
  layout = 'horizontal',
}: FilterPanelProps) {
  const hasActiveFilters = filters.some((filter) =>
    Array.isArray(filter.value)
      ? filter.value.length > 0
      : filter.value !== '' && filter.value !== 'all'
  );

  return (
    <div
      className={cn(
        'flex gap-4',
        layout === 'vertical' ? 'flex-col' : 'flex-wrap items-center',
        className
      )}
    >
      {filters.map((filter) => (
        <FilterGroupComponent
          key={filter.id}
          filter={filter}
          onChange={(value) => onChange(filter.id, value)}
          layout={layout}
        />
      ))}

      {onClear && hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-gray-500 hover:text-gray-700"
        >
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}

interface FilterGroupComponentProps {
  filter: FilterGroup;
  onChange: (value: string | string[]) => void;
  layout: 'horizontal' | 'vertical';
}

function FilterGroupComponent({
  filter,
  onChange,
  layout,
}: FilterGroupComponentProps) {
  const { id, label, options, value, multiple } = filter;

  if (multiple) {
    return (
      <div className={cn(layout === 'vertical' && 'space-y-2')}>
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <div className="flex flex-wrap gap-2 mt-1">
          {options.map((option) => {
            const isSelected = Array.isArray(value) && value.includes(option.value);
            return (
              <button
                key={option.value}
                onClick={() => {
                  const currentValue = Array.isArray(value) ? value : [];
                  const newValue = isSelected
                    ? currentValue.filter((v) => v !== option.value)
                    : [...currentValue, option.value];
                  onChange(newValue);
                }}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                  isSelected
                    ? 'bg-orange-50 border-orange-200 text-orange-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                )}
              >
                {option.label}
                {option.count !== undefined && (
                  <span className="ml-1.5 text-xs opacity-70">({option.count})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(layout === 'vertical' && 'space-y-2')}>
      {layout === 'vertical' && (
        <span className="text-sm font-medium text-gray-700">{label}</span>
      )}
      <select
        id={id}
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white',
          'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500',
          'transition-colors'
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
            {option.count !== undefined && ` (${option.count})`}
          </option>
        ))}
      </select>
    </div>
  );
}

// Pill-style filter tabs (like the current status filter)
export interface FilterTabsProps {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function FilterTabs({ options, value, onChange, className }: FilterTabsProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            value === option.value
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          {option.label}
          {option.count !== undefined && (
            <span
              className={cn(
                'ml-2 px-1.5 py-0.5 text-xs rounded-full',
                value === option.value
                  ? 'bg-orange-400 text-white'
                  : 'bg-gray-200 text-gray-600'
              )}
            >
              {option.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
