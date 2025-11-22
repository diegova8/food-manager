import { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  minDate?: Date;
  recommendedDate?: Date;
}

function DatePicker({ value, onChange, minDate, recommendedDate }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? new Date(value + 'T00:00:00') : undefined;
  const today = startOfDay(new Date());
  const defaultMinDate = minDate || addDays(today, 1);
  const defaultRecommendedDate = recommendedDate || addDays(today, 2);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange(format(date, 'yyyy-MM-dd'));
      setIsOpen(false);
    }
  };

  const isDateDisabled = (date: Date) => {
    return isBefore(date, defaultMinDate);
  };

  const isRecommended = (date: Date) => {
    return date >= defaultRecommendedDate;
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Input Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3.5 bg-white border-2 rounded-xl text-left transition-all duration-200 flex items-center justify-between ${
          isOpen
            ? 'border-teal-400 ring-2 ring-teal-100'
            : 'border-teal-200 hover:border-teal-300'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            selectedDate ? 'bg-teal-100' : 'bg-slate-100'
          }`}>
            <svg className={`w-5 h-5 ${selectedDate ? 'text-teal-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            {selectedDate ? (
              <>
                <p className="font-semibold text-slate-800">
                  {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                </p>
                <p className="text-xs text-slate-500">
                  {format(selectedDate, 'yyyy')}
                </p>
              </>
            ) : (
              <>
                <p className="text-slate-400 font-medium">Selecciona una fecha</p>
                <p className="text-xs text-slate-400">Toca para abrir el calendario</p>
              </>
            )}
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Calendar Header */}
          <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-3">
            <p className="text-teal-100 text-xs font-medium">Selecciona la fecha de tu pedido</p>
            <p className="text-white font-bold">
              {selectedDate
                ? format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })
                : 'Ninguna fecha seleccionada'
              }
            </p>
          </div>

          {/* Calendar */}
          <div className="p-3">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleSelect}
              disabled={isDateDisabled}
              locale={es}
              showOutsideDays
              fixedWeeks
              modifiers={{
                recommended: (date) => isRecommended(date) && !isDateDisabled(date),
              }}
              modifiersClassNames={{
                recommended: 'rdp-day_recommended',
              }}
              classNames={{
                root: 'w-full',
                months: 'w-full',
                month: 'w-full space-y-2',
                month_grid: 'w-full',
                caption: 'flex justify-between items-center mb-3 px-1',
                caption_label: 'text-sm font-bold text-slate-800 capitalize',
                nav: 'flex gap-1',
                button_previous: 'w-8 h-8 rounded-lg bg-slate-100 hover:bg-teal-100 flex items-center justify-center text-slate-600 hover:text-teal-600 transition-colors',
                button_next: 'w-8 h-8 rounded-lg bg-slate-100 hover:bg-teal-100 flex items-center justify-center text-slate-600 hover:text-teal-600 transition-colors',
                weekdays: 'w-full flex',
                weekday: 'flex-1 text-xs font-semibold text-slate-400 uppercase text-center py-1',
                week: 'w-full flex',
                day: 'flex-1 p-px text-center',
                day_button: 'w-full h-9 rounded-lg text-sm font-medium transition-all duration-150 hover:bg-teal-50 hover:text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-1 flex items-center justify-center',
                selected: '!bg-gradient-to-br !from-teal-500 !to-emerald-500 !text-white !font-bold !shadow-md !shadow-teal-200 hover:!from-teal-600 hover:!to-emerald-600',
                today: 'bg-orange-100 text-orange-700 font-bold',
                outside: 'text-slate-300 hover:bg-slate-50',
                disabled: '!text-slate-200 !cursor-not-allowed hover:!bg-transparent',
                hidden: 'invisible',
              }}
            />
          </div>

          {/* Legend */}
          <div className="px-4 pb-4 flex items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-gradient-to-br from-teal-500 to-emerald-500"></span>
              <span className="text-slate-500">Seleccionado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-orange-100"></span>
              <span className="text-slate-500">Hoy</span>
            </div>
          </div>

          {/* Quick Select */}
          <div className="border-t border-slate-100 p-3 bg-slate-50">
            <p className="text-xs text-slate-500 mb-2 font-medium">Selección rápida:</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleSelect(addDays(today, 2))}
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:border-teal-300 hover:bg-teal-50 transition-colors"
              >
                En 2 días
              </button>
              <button
                type="button"
                onClick={() => handleSelect(addDays(today, 3))}
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:border-teal-300 hover:bg-teal-50 transition-colors"
              >
                En 3 días
              </button>
              <button
                type="button"
                onClick={() => handleSelect(addDays(today, 7))}
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:border-teal-300 hover:bg-teal-50 transition-colors"
              >
                En 1 semana
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DatePicker;
