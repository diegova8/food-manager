import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';

interface BusinessInfo {
  businessName: string;
  phone: string;
  email: string;
  address: string;
  schedule: string;
}

interface NotificationPrefs {
  soundEnabled: boolean;
  desktopNotifications: boolean;
  emailNotifications: boolean;
}

const BUSINESS_INFO_KEY = 'ceviche-manager-business-info';
const NOTIFICATION_PREFS_KEY = 'ceviche-manager-notification-prefs';

const defaultBusinessInfo: BusinessInfo = {
  businessName: 'Ceviche Manager',
  phone: '',
  email: '',
  address: '',
  schedule: '',
};

const defaultNotificationPrefs: NotificationPrefs = {
  soundEnabled: true,
  desktopNotifications: false,
  emailNotifications: true,
};

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(defaultBusinessInfo);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>(defaultNotificationPrefs);
  const [paypalEnabled, setPaypalEnabled] = useState(true);
  const [loadingPaypal, setLoadingPaypal] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const storedBusinessInfo = localStorage.getItem(BUSINESS_INFO_KEY);
    if (storedBusinessInfo) {
      try {
        setBusinessInfo(JSON.parse(storedBusinessInfo));
      } catch (e) {
        console.error('Error parsing business info:', e);
      }
    }

    const storedNotificationPrefs = localStorage.getItem(NOTIFICATION_PREFS_KEY);
    if (storedNotificationPrefs) {
      try {
        setNotificationPrefs(JSON.parse(storedNotificationPrefs));
      } catch (e) {
        console.error('Error parsing notification prefs:', e);
      }
    }
  }, []);

  // Load PayPal setting from database
  useEffect(() => {
    async function loadPaypalSetting() {
      try {
        const config = await api.getConfig();
        setPaypalEnabled(config.paypalEnabled ?? true);
      } catch (error) {
        console.error('Error loading PayPal setting:', error);
      } finally {
        setLoadingPaypal(false);
      }
    }
    loadPaypalSetting();
  }, []);

  const handleSaveBusinessInfo = () => {
    setSaving(true);
    try {
      localStorage.setItem(BUSINESS_INFO_KEY, JSON.stringify(businessInfo));
      toast.success('Información del negocio guardada');
    } catch (e) {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotificationPrefs = () => {
    setSaving(true);
    try {
      localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(notificationPrefs));
      toast.success('Preferencias guardadas');
    } catch (e) {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Tu navegador no soporta notificaciones');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationPrefs(prev => ({ ...prev, desktopNotifications: true }));
      toast.success('Notificaciones habilitadas');
    } else {
      toast.error('Permiso de notificaciones denegado');
    }
  };

  const handleTogglePaypal = async (enabled: boolean) => {
    setPaypalEnabled(enabled);
    setSaving(true);
    try {
      const config = await api.getConfig();
      await api.updateConfig({
        ...config,
        paypalEnabled: enabled
      });
      toast.success(enabled ? 'PayPal habilitado' : 'PayPal deshabilitado');
    } catch (error) {
      console.error('Error updating PayPal setting:', error);
      toast.error('Error al guardar configuración');
      setPaypalEnabled(!enabled); // Revert on error
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración"
        description="Administra las preferencias del sistema"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Information */}
        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Información del Negocio
              </h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Datos de contacto y ubicación
              </p>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Nombre del Negocio
                </label>
                <input
                  type="text"
                  value={businessInfo.businessName}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, businessName: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Ceviche Manager"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={businessInfo.phone}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="+506 8888-8888"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Email de Contacto
                </label>
                <input
                  type="email"
                  value={businessInfo.email}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="contacto@ceviche.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  value={businessInfo.address}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="San José, Costa Rica"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Horario de Atención
                </label>
                <input
                  type="text"
                  value={businessInfo.schedule}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, schedule: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Lun-Vie: 9am-6pm"
                />
              </div>
              <button
                onClick={handleSaveBusinessInfo}
                disabled={saving}
                className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar Información'}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Apariencia
              </h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Personaliza el aspecto visual
              </p>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
                  Tema
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      theme === 'light'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                    }`}
                  >
                    <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Claro</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      theme === 'dark'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                    }`}
                  >
                    <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Oscuro</span>
                  </button>
                  <button
                    onClick={() => setTheme('system')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      theme === 'system'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                    }`}
                  >
                    <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Sistema</span>
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Métodos de Pago
              </h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Configura los métodos de pago disponibles
              </p>
            </div>
            <div className="p-4 space-y-4">
              {loadingPaypal ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500" />
                </div>
              ) : (
                <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-xl cursor-pointer">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.76-4.852a.932.932 0 0 1 .922-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z"/>
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">PayPal</p>
                      <p className="text-sm text-gray-500 dark:text-slate-400">
                        {paypalEnabled ? 'Activo' : 'Desactivado'}
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={paypalEnabled}
                    onChange={(e) => handleTogglePaypal(e.target.checked)}
                    disabled={saving}
                    className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500 disabled:opacity-50"
                  />
                </label>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notificaciones
              </h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Configura cómo recibir alertas
              </p>
            </div>
            <div className="p-4 space-y-4">
              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-xl cursor-pointer">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Sonidos</p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Reproducir sonido en nuevos pedidos</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPrefs.soundEnabled}
                  onChange={(e) => setNotificationPrefs(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                  className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-xl cursor-pointer">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Notificaciones de escritorio</p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Mostrar alertas del navegador</p>
                  </div>
                </div>
                <button
                  onClick={requestNotificationPermission}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    notificationPrefs.desktopNotifications
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-200 text-gray-600 dark:bg-slate-600 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-500'
                  }`}
                >
                  {notificationPrefs.desktopNotifications ? 'Habilitado' : 'Habilitar'}
                </button>
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-xl cursor-pointer">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Notificaciones por email</p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Recibir resumen diario</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPrefs.emailNotifications}
                  onChange={(e) => setNotificationPrefs(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                  className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                />
              </label>

              <button
                onClick={handleSaveNotificationPrefs}
                disabled={saving}
                className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar Preferencias'}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Keyboard Shortcuts */}
        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Atajos de Teclado
              </h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Navega más rápido con el teclado
              </p>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <ShortcutItem keys={['⌘', 'K']} description="Abrir búsqueda global" />
                <ShortcutItem keys={['g', 'd']} description="Ir al Dashboard" />
                <ShortcutItem keys={['g', 'o']} description="Ir a Órdenes" />
                <ShortcutItem keys={['g', 'u']} description="Ir a Usuarios" />
                <ShortcutItem keys={['g', 't']} description="Ir a Tickets" />
                <ShortcutItem keys={['g', 'p']} description="Ir a Precios" />
                <ShortcutItem keys={['g', 's']} description="Ir a Configuración" />
                <ShortcutItem keys={['?']} description="Mostrar ayuda de atajos" />
                <ShortcutItem keys={['Esc']} description="Cerrar modal/panel" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ShortcutItem({ keys, description }: { keys: string[]; description: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600 dark:text-slate-400">{description}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, i) => (
          <span key={i}>
            <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded border border-gray-200 dark:border-slate-600">
              {key}
            </kbd>
            {i < keys.length - 1 && <span className="text-gray-400 mx-0.5">+</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

export default SettingsPage;
