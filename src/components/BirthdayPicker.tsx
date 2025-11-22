import { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, subYears, isAfter, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface BirthdayPickerProps {
  value: string;
  onChange: (date: string) => void;
}

function BirthdayPicker({ value, onChange }: BirthdayPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? new Date(value + 'T00:00:00') : undefined;
  const today = startOfDay(new Date());

  // Default to showing a reasonable birth year (30 years ago)
  const defaultMonth = selectedDate || subYears(today, 30);

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

  // Can't select future dates for birthday
  const isDateDisabled = (date: Date) => {
    return isAfter(date, today);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Input Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 bg-white border-2 rounded-lg text-left transition-all duration-200 flex items-center justify-between ${
          isOpen
            ? 'border-orange-400 ring-2 ring-orange-100'
            : 'border-slate-200 hover:border-orange-300'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            selectedDate ? 'bg-orange-100' : 'bg-slate-100'
          }`}>
            <svg className={`w-5 h-5 ${selectedDate ? 'text-orange-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0A2.704 2.704 0 003 15.546V12a9 9 0 0118 0v3.546z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m-4 2.5l.7.7M4 12h1m14 0h1m-3.3-4.8l.7-.7M12 4a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </div>
          <div>
            {selectedDate ? (
              <>
                <p className="font-semibold text-slate-800">
                  {format(selectedDate, "d 'de' MMMM", { locale: es })}
                </p>
                <p className="text-xs text-slate-500">
                  {format(selectedDate, 'yyyy')}
                </p>
              </>
            ) : (
              <>
                <p className="text-slate-400 font-medium">Selecciona tu fecha</p>
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
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3">
            <p className="text-orange-100 text-xs font-medium">Fecha de cumpleaños</p>
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
              defaultMonth={defaultMonth}
              locale={es}
              showOutsideDays
              fixedWeeks
              captionLayout="dropdown"
              fromYear={1920}
              toYear={new Date().getFullYear()}
              classNames={{
                root: 'w-full',
                months: 'w-full',
                month: 'w-full space-y-2',
                month_grid: 'w-full',
                caption: 'flex justify-between items-center mb-3 px-1',
                caption_label: 'hidden',
                nav: 'flex gap-1',
                button_previous: 'w-8 h-8 rounded-lg bg-slate-100 hover:bg-orange-100 flex items-center justify-center text-slate-600 hover:text-orange-600 transition-colors',
                button_next: 'w-8 h-8 rounded-lg bg-slate-100 hover:bg-orange-100 flex items-center justify-center text-slate-600 hover:text-orange-600 transition-colors',
                weekdays: 'w-full flex',
                weekday: 'flex-1 text-xs font-semibold text-slate-400 uppercase text-center py-1',
                week: 'w-full flex',
                day: 'flex-1 p-px text-center',
                day_button: 'w-full h-9 rounded-lg text-sm font-medium transition-all duration-150 hover:bg-orange-50 hover:text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-1 flex items-center justify-center',
                selected: '!bg-gradient-to-br !from-orange-500 !to-amber-500 !text-white !font-bold !shadow-md !shadow-orange-200 hover:!from-orange-600 hover:!to-amber-600',
                today: 'bg-teal-100 text-teal-700 font-bold',
                outside: 'text-slate-300 hover:bg-slate-50',
                disabled: '!text-slate-200 !cursor-not-allowed hover:!bg-transparent',
                hidden: 'invisible',
                dropdown: 'appearance-none bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400 cursor-pointer hover:border-orange-300 transition-colors capitalize',
                dropdowns: 'flex gap-2 items-center flex-1 justify-center',
                dropdown_root: 'relative',
              }}
            />
          </div>

          {/* Legend */}
          <div className="px-4 pb-4 flex items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-gradient-to-br from-orange-500 to-amber-500"></span>
              <span className="text-slate-500">Seleccionado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-teal-100"></span>
              <span className="text-slate-500">Hoy</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BirthdayPicker;
