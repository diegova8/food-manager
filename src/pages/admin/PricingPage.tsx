import { useState, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/shared/LoadingState';
import {
  PricingTabs,
  MarkupSlider,
  CostMatrixCard,
  CevicheCatalogCard,
  OrderCalculator,
} from '../../components/features/pricing';
import type { RawMaterialPrices, CevicheCost } from '../../types';
import { getCevichesList, calculateCevicheCost, calculateMezclaJugoCostPerLiter } from '../../utils';
import { api } from '../../services/api';
import defaultConfig from '../../config/defaultPrices.json';

type PricingTab = 'costs' | 'catalog' | 'calculator';

export function PricingPage() {
  const [activeTab, setActiveTab] = useState<PricingTab>('costs');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [prices, setPrices] = useState<RawMaterialPrices>(defaultConfig.rawMaterials);
  const [markup, setMarkup] = useState<number>(defaultConfig.markup);
  const [customPrices, setCustomPrices] = useState<{ [key: string]: number }>(defaultConfig.customPrices);

  // Load config from API
  useEffect(() => {
    async function loadConfig() {
      try {
        const config = await api.getConfig();
        setPrices(config.rawMaterials);
        setMarkup(config.markup);
        setCustomPrices(config.customPrices);
      } catch (error) {
        console.error('Error loading config:', error);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  // Save config to API with debounce
  useEffect(() => {
    if (loading) return;

    const timeoutId = setTimeout(async () => {
      try {
        setSaving(true);
        await api.updateConfig({ rawMaterials: prices, markup, customPrices });
      } catch (error) {
        console.error('Error saving config:', error);
        toast.error('Error al guardar la configuración');
      } finally {
        setSaving(false);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [prices, markup, customPrices, loading]);

  const cevicheCosts = useMemo<CevicheCost[]>(() => {
    const ceviches = getCevichesList();
    const mezclaJugoCostPerLiter = calculateMezclaJugoCostPerLiter(prices);

    return ceviches.map(ceviche => {
      const costoProd = calculateCevicheCost(ceviche, prices, mezclaJugoCostPerLiter);
      const precioVenta = costoProd * markup;

      return {
        ceviche,
        costoProd,
        precioVenta
      };
    });
  }, [prices, markup]);

  const handlePriceChange = (key: keyof RawMaterialPrices, value: number) => {
    setPrices({ ...prices, [key]: value });
  };

  const handleCustomPriceChange = (cevicheId: string, value: number) => {
    setCustomPrices({ ...customPrices, [cevicheId]: value });
  };

  const copyMenuLink = () => {
    const menuUrl = `${window.location.origin}/menu`;
    navigator.clipboard.writeText(menuUrl);
    toast.success('Link del menú copiado al portapapeles');
  };

  const exportConfiguration = () => {
    const config = {
      rawMaterials: prices,
      markup: markup,
      customPrices: customPrices
    };

    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'defaultPrices.json';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Configuración exportada');
  };

  const resetToDefaults = () => {
    setPrices(defaultConfig.rawMaterials);
    setMarkup(defaultConfig.markup);
    setCustomPrices(defaultConfig.customPrices);
    toast.success('Precios restablecidos a los valores por defecto');
  };

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Configuración de Precios"
          description="Administra los costos y precios de venta"
        />
        <LoadingState variant="skeleton" rows={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración de Precios"
        description="Administra los costos y precios de venta"
        actions={
          <div className="flex items-center gap-2">
            {saving && (
              <span className="text-sm text-slate-500 flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-orange-500" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Guardando...
              </span>
            )}
            <Button variant="outline" size="sm" onClick={copyMenuLink}>
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copiar Menú
            </Button>
            <Button variant="outline" size="sm" onClick={exportConfiguration}>
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Exportar
            </Button>
            <Button variant="ghost" size="sm" onClick={resetToDefaults}>
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Restablecer
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <PricingTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      {activeTab === 'costs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CostMatrixCard
              prices={prices}
              onPriceChange={handlePriceChange}
            />
          </div>
          <div>
            <MarkupSlider
              value={markup}
              onChange={setMarkup}
            />
          </div>
        </div>
      )}

      {activeTab === 'catalog' && (
        <CevicheCatalogCard
          cevicheCosts={cevicheCosts}
          customPrices={customPrices}
          onPriceChange={handleCustomPriceChange}
        />
      )}

      {activeTab === 'calculator' && (
        <OrderCalculator
          cevicheCosts={cevicheCosts}
          customPrices={customPrices}
        />
      )}
    </div>
  );
}

export default PricingPage;
