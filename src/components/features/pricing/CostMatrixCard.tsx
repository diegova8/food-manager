import type { RawMaterialPrices } from '../../../types';
import { formatCurrency, calculateMezclaJugoCostPerLiter } from '../../../utils';

interface CostMatrixCardProps {
  prices: RawMaterialPrices;
  onPriceChange: (key: keyof RawMaterialPrices, value: number) => void;
}

interface PriceInputRowProps {
  label: string;
  value: number;
  unit: string;
  onChange: (value: number) => void;
  icon: React.ReactNode;
  color: string;
}

function PriceInputRow({ label, value, unit, onChange, icon, color }: PriceInputRowProps) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${color}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-700">{label}</p>
        <p className="text-xs text-slate-400">{unit}</p>
      </div>
      <div className="w-32">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₡</span>
          <input
            type="number"
            step="0.01"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-right font-medium"
          />
        </div>
      </div>
    </div>
  );
}

export function CostMatrixCard({ prices, onPriceChange }: CostMatrixCardProps) {
  const mezclaJugoCostPerLiter = calculateMezclaJugoCostPerLiter(prices);

  const proteinItems = [
    { key: 'pescado' as const, label: 'Pescado', unit: 'colones/g', icon: '🐟', color: 'bg-blue-100' },
    { key: 'camaron' as const, label: 'Camarón', unit: 'colones/g', icon: '🦐', color: 'bg-pink-100' },
    { key: 'pulpo' as const, label: 'Pulpo', unit: 'colones/g', icon: '🐙', color: 'bg-purple-100' },
    { key: 'piangua' as const, label: 'Piangua', unit: 'colones/unidad', icon: '🐚', color: 'bg-amber-100' },
  ];

  const liquidItems = [
    { key: 'jugoLimon' as const, label: 'Jugo de Limón', unit: 'colones/mL', icon: '🍋', color: 'bg-yellow-100' },
    { key: 'jugoNaranja' as const, label: 'Jugo de Naranja', unit: 'colones/mL', icon: '🍊', color: 'bg-orange-100' },
  ];

  const otherItems = [
    { key: 'olores' as const, label: 'Olores', unit: 'colones/g', icon: '🌿', color: 'bg-green-100' },
    { key: 'sal' as const, label: 'Sal', unit: 'colones/g', icon: '🧂', color: 'bg-slate-100' },
    { key: 'azucar' as const, label: 'Azúcar', unit: 'colones/g', icon: '🍬', color: 'bg-rose-100' },
    { key: 'envase' as const, label: 'Envase', unit: 'colones/unidad', icon: '📦', color: 'bg-slate-100' },
  ];

  return (
    <div className="space-y-6">
      {/* Proteins Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
            Proteínas
          </h3>
          <p className="text-blue-100 text-sm">Mariscos y pescados frescos</p>
        </div>
        <div className="p-4 divide-y divide-slate-100">
          {proteinItems.map((item) => (
            <PriceInputRow
              key={item.key}
              label={item.label}
              value={prices[item.key]}
              unit={item.unit}
              onChange={(value) => onPriceChange(item.key, value)}
              icon={item.icon}
              color={item.color}
            />
          ))}
        </div>
      </div>

      {/* Liquids Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            Líquidos
          </h3>
          <p className="text-yellow-100 text-sm">Jugos para la mezcla base</p>
        </div>
        <div className="p-4 divide-y divide-slate-100">
          {liquidItems.map((item) => (
            <PriceInputRow
              key={item.key}
              label={item.label}
              value={prices[item.key]}
              unit={item.unit}
              onChange={(value) => onPriceChange(item.key, value)}
              icon={item.icon}
              color={item.color}
            />
          ))}
        </div>

        {/* Mezcla calculation */}
        <div className="mx-4 mb-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-800">Costo de Mezcla de Jugo</p>
              <p className="text-xs text-orange-600">500mL limón + 500mL naranja + 33g sal + 33g azúcar</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(mezclaJugoCostPerLiter)}</p>
              <p className="text-xs text-orange-500">por litro</p>
            </div>
          </div>
        </div>
      </div>

      {/* Other Items Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-teal-500 px-6 py-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            Otros Ingredientes
          </h3>
          <p className="text-green-100 text-sm">Especias, condimentos y empaque</p>
        </div>
        <div className="p-4 divide-y divide-slate-100">
          {otherItems.map((item) => (
            <PriceInputRow
              key={item.key}
              label={item.label}
              value={prices[item.key]}
              unit={item.unit}
              onChange={(value) => onPriceChange(item.key, value)}
              icon={item.icon}
              color={item.color}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default CostMatrixCard;
