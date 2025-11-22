import { useState, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import MatrizCostos from '../components/MatrizCostos';
import CatalogoCeviches from '../components/CatalogoCeviches';
import CalculadoraPedidos from '../components/CalculadoraPedidos';
import OrdersManagementPage from './OrdersManagementPage';
import Header from '../components/Header';
import type { RawMaterialPrices, CevicheCost } from '../types';
import { getCevichesList, calculateCevicheCost, calculateMezclaJugoCostPerLiter } from '../utils';
import { api } from '../services/api';
import defaultConfig from '../config/defaultPrices.json';

type AdminTab = 'orders' | 'prices';

function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [prices, setPrices] = useState<RawMaterialPrices>(defaultConfig.rawMaterials);
  const [markup, setMarkup] = useState<number>(defaultConfig.markup);
  const [customPrices, setCustomPrices] = useState<{ [key: string]: number }>(defaultConfig.customPrices);

  // Cargar configuración desde la API
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

  // Guardar configuración en la API cuando cambie (con debounce)
  useEffect(() => {
    if (loading) return; // No guardar durante la carga inicial

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
    }, 1000); // Guardar 1 segundo después del último cambio

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

  const resetToDefaults = async () => {
    if (confirm('¿Estás seguro de que quieres resetear todos los precios a los valores por defecto?')) {
      setPrices(defaultConfig.rawMaterials);
      setMarkup(defaultConfig.markup);
      setCustomPrices(defaultConfig.customPrices);

      try {
        await api.updateConfig({
          rawMaterials: defaultConfig.rawMaterials,
          markup: defaultConfig.markup,
          customPrices: defaultConfig.customPrices
        });
        toast.success('Precios reseteados a valores por defecto');
      } catch (error) {
        toast.error('Error al resetear los precios');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-orange-100 rounded-2xl flex items-center justify-center mb-4">
            <svg className="animate-spin h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-slate-600 font-medium">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: 'orders' as AdminTab,
      label: 'Pedidos',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      id: 'prices' as AdminTab,
      label: 'Precios',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <Header />

      <div className="max-w-7xl mx-auto py-8 px-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Panel de Administración
              </h1>
              <p className="text-slate-500 mt-1">
                Gestiona pedidos y configura precios
              </p>
            </div>

            {/* Saving Indicator */}
            {saving && (
              <div className="flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-xl">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm font-medium">Guardando...</span>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-2 mb-8 inline-flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'orders' ? (
          <OrdersManagementPage />
        ) : (
          <div className="space-y-8">
            {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Acciones Rápidas
              </h2>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={copyMenuLink}
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-medium hover:from-teal-600 hover:to-emerald-600 transition-all shadow-md hover:shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copiar link del menú
                </button>
                <button
                  onClick={exportConfiguration}
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md hover:shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Exportar configuración
                </button>
                <button
                  onClick={resetToDefaults}
                  className="flex items-center gap-2 px-5 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-all border border-slate-200"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Resetear precios
                </button>
              </div>
            </div>

            {/* Price Components */}
            <MatrizCostos
              prices={prices}
              setPrices={setPrices}
              markup={markup}
              setMarkup={setMarkup}
            />

            <CatalogoCeviches
              cevicheCosts={cevicheCosts}
              customPrices={customPrices}
              setCustomPrices={setCustomPrices}
            />

            <CalculadoraPedidos cevicheCosts={cevicheCosts} customPrices={customPrices} />

            {/* Footer */}
            <div className="text-center py-6 text-sm text-slate-500">
              <p>Sistema de Gestión de Ceviches • Todos los precios en colones (₡)</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
