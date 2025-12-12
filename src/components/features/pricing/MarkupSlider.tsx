import { cn } from '../../../utils/cn';

interface MarkupSliderProps {
  value: number;
  onChange: (value: number) => void;
  minValue?: number;
  maxValue?: number;
  step?: number;
}

export function MarkupSlider({
  value,
  onChange,
  minValue = 1.0,
  maxValue = 4.0,
  step = 0.1,
}: MarkupSliderProps) {
  const percentage = ((value - minValue) / (maxValue - minValue)) * 100;
  const profitMargin = ((value - 1) / value) * 100;

  const getMarkupLabel = () => {
    if (value < 1.5) return { text: 'Mínimo', color: 'text-red-600' };
    if (value < 2.0) return { text: 'Bajo', color: 'text-orange-600' };
    if (value < 2.5) return { text: 'Normal', color: 'text-green-600' };
    if (value < 3.0) return { text: 'Alto', color: 'text-blue-600' };
    return { text: 'Premium', color: 'text-purple-600' };
  };

  const label = getMarkupLabel();

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Multiplicador de Precio</h3>
          <p className="text-sm text-slate-500">Ajusta el margen de ganancia</p>
        </div>
        <div className="text-right">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-orange-600">{value.toFixed(1)}</span>
            <span className="text-slate-400">x</span>
          </div>
          <span className={cn('text-sm font-semibold', label.color)}>{label.text}</span>
        </div>
      </div>

      {/* Slider */}
      <div className="relative mb-6">
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 to-purple-400 rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          min={minValue}
          max={maxValue}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-3 opacity-0 cursor-pointer"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-orange-500 rounded-full shadow-lg transition-all pointer-events-none"
          style={{ left: `calc(${percentage}% - 12px)` }}
        />
      </div>

      {/* Scale markers */}
      <div className="flex justify-between text-xs text-slate-400 mb-6">
        <span>1.0x</span>
        <span>2.0x</span>
        <span>3.0x</span>
        <span>4.0x</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Costo</p>
          <p className="text-lg font-bold text-slate-700">₡1,000</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 text-center">
          <p className="text-xs text-orange-600 uppercase tracking-wide mb-1">Venta</p>
          <p className="text-lg font-bold text-orange-600">₡{(1000 * value).toLocaleString()}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <p className="text-xs text-green-600 uppercase tracking-wide mb-1">Margen</p>
          <p className="text-lg font-bold text-green-600">{profitMargin.toFixed(0)}%</p>
        </div>
      </div>

      {/* Quick presets */}
      <div className="mt-4 flex gap-2">
        <span className="text-xs text-slate-500 self-center">Presets:</span>
        {[1.5, 2.0, 2.5, 3.0].map((preset) => (
          <button
            key={preset}
            onClick={() => onChange(preset)}
            className={cn(
              'px-3 py-1 text-xs font-medium rounded-lg transition-colors',
              value === preset
                ? 'bg-orange-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            {preset}x
          </button>
        ))}
      </div>
    </div>
  );
}

export default MarkupSlider;
