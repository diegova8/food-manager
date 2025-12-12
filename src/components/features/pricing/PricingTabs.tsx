import { cn } from '../../../utils/cn';

type PricingTab = 'costs' | 'catalog' | 'calculator';

interface PricingTabsProps {
  activeTab: PricingTab;
  onTabChange: (tab: PricingTab) => void;
}

const tabs: { id: PricingTab; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: 'costs',
    label: 'Matriz de Costos',
    description: 'Configura precios de materias primas',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'catalog',
    label: 'Catálogo',
    description: 'Precios de venta por ceviche',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    id: 'calculator',
    label: 'Calculadora',
    description: 'Simula pedidos y ganancias',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export function PricingTabs({ activeTab, onTabChange }: PricingTabsProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-2">
      <div className="grid grid-cols-3 gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex flex-col items-center gap-1 px-4 py-3 rounded-xl transition-all',
              activeTab === tab.id
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                : 'text-slate-600 hover:bg-slate-50'
            )}
          >
            <div className={cn(
              'p-2 rounded-lg',
              activeTab === tab.id ? 'bg-orange-400' : 'bg-slate-100'
            )}>
              {tab.icon}
            </div>
            <span className="font-semibold text-sm">{tab.label}</span>
            <span className={cn(
              'text-xs',
              activeTab === tab.id ? 'text-orange-100' : 'text-slate-400'
            )}>
              {tab.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default PricingTabs;
