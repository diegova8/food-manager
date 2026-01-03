import { useState, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/layout/PageHeader';
import { LoadingState } from '../../components/shared/LoadingState';
import { OrderCalculator } from '../../components/features/pricing';
import type { RawMaterialPrices, CevicheCost } from '../../types';
import { getCevichesList, calculateCevicheCost, calculateMezclaJugoCostPerLiter } from '../../utils';
import { api } from '../../services/api';
import defaultConfig from '../../config/defaultPrices.json';

export function PricingPage() {
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


  if (loading) {
    return (
      <div>
        <PageHeader
          title="Calculadora"
          description="Calcula las materias primas necesarias para tus pedidos"
        />
        <LoadingState variant="skeleton" rows={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calculadora"
        description="Calcula las materias primas necesarias para tus pedidos"
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
          </div>
        }
      />

      <OrderCalculator
        cevicheCosts={cevicheCosts}
        customPrices={customPrices}
      />
    </div>
  );
}

export default PricingPage;
