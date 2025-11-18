import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MatrizCostos from '../components/MatrizCostos';
import CatalogoCeviches from '../components/CatalogoCeviches';
import CalculadoraPedidos from '../components/CalculadoraPedidos';
import OrdersManagementPage from './OrdersManagementPage';
import type { RawMaterialPrices, CevicheCost } from '../types';
import { getCevichesList, calculateCevicheCost, calculateMezclaJugoCostPerLiter } from '../utils';
import { api } from '../services/api';
import defaultConfig from '../config/defaultPrices.json';

type AdminTab = 'prices' | 'orders';

function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('prices');
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
        alert('Error al guardar la configuración');
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
    alert('¡Link del menú copiado al portapapeles!');
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
        alert('Precios reseteados a valores por defecto');
      } catch (error) {
        alert('Error al resetear los precios');
      }
    }
  };

  const handleLogout = () => {
    if (confirm('¿Cerrar sesión?')) {
      api.logout();
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8 relative">
          <button
            onClick={handleLogout}
            className="absolute top-0 right-0 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            🚪 Cerrar Sesión
          </button>

          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Panel de Administración
          </h1>
          <p className="text-gray-600">
            Gestión de precios y pedidos
          </p>
          {saving && (
            <p className="text-sm text-blue-600 mt-2">
              💾 Guardando cambios...
            </p>
          )}
        </header>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 justify-center">
          <button
            onClick={() => setActiveTab('prices')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'prices'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            💰 Gestión de Precios
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'orders'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            📦 Pedidos
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'orders' ? (
          <OrdersManagementPage />
        ) : (
          <div>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <button
                onClick={copyMenuLink}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
              >
                📋 Copiar link del menú público
              </button>
              <button
                onClick={exportConfiguration}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
              >
                💾 Exportar configuración
              </button>
              <button
                onClick={resetToDefaults}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg"
              >
                🔄 Resetear a valores por defecto
              </button>
            </div>

            <div className="space-y-8">
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
            </div>

            <footer className="mt-8 text-center text-sm text-gray-600">
              <p>Sistema de Gestión de Ceviches - Todos los precios en colones (₡)</p>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
