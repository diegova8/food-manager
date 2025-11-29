import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import BirthdayPicker from '../components/BirthdayPicker';
import { api } from '../services/api';
import { formatDateDisplay } from '../utils';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  birthday: string;
  dietaryPreferences: string;
  marketingConsent: boolean;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    birthday: '',
    dietaryPreferences: '',
    marketingConsent: false,
  });

  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate('/login');
      return;
    }

    const loadProfile = async () => {
      try {
        setLoadingProfile(true);
        const response = await api.getProfile();
        const userData = response.data;

        const profileData = {
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address || '',
          birthday: userData.birthday ? userData.birthday.split('T')[0] : '',
          dietaryPreferences: userData.dietaryPreferences || '',
          marketingConsent: userData.marketingConsent || false,
        };

        setProfile(profileData);
        setEditedProfile(profileData);
      } catch (err) {
        setError('Error al cargar el perfil');
        console.error('Failed to load profile:', err);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setEditedProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.updateProfile({
        firstName: editedProfile.firstName,
        lastName: editedProfile.lastName,
        phone: editedProfile.phone,
        address: editedProfile.address,
        birthday: editedProfile.birthday || undefined,
        dietaryPreferences: editedProfile.dietaryPreferences,
        marketingConsent: editedProfile.marketingConsent,
      });

      setProfile(editedProfile);
      setShowEditModal(false);
      setSuccess('Perfil actualizado correctamente');

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = () => {
    setEditedProfile(profile);
    setError('');
    setShowEditModal(true);
  };

  const handleCloseEdit = () => {
    setEditedProfile(profile);
    setShowEditModal(false);
    setError('');
  };

  const getInitials = () => {
    const first = profile.firstName?.charAt(0) || '';
    const last = profile.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  };

  const getFullName = () => {
    const name = [profile.firstName, profile.lastName].filter(Boolean).join(' ');
    return name || 'Usuario';
  };

  // Edit Modal Component
  const EditModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Editar Perfil</h2>
            <button
              onClick={handleCloseEdit}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nombre</label>
              <input
                type="text"
                name="firstName"
                value={editedProfile.firstName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Apellidos</label>
              <input
                type="text"
                name="lastName"
                value={editedProfile.lastName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="Tus apellidos"
              />
            </div>
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Correo electrónico</label>
            <div className="px-4 py-3 bg-slate-100 rounded-xl text-slate-500 text-sm">
              {profile.email}
              <span className="text-xs text-slate-400 ml-2">(No editable)</span>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Teléfono</label>
            <input
              type="tel"
              name="phone"
              value={editedProfile.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="Tu número de teléfono"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Dirección de entrega</label>
            <textarea
              name="address"
              value={editedProfile.address}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
              placeholder="Tu dirección de entrega"
            />
          </div>

          {/* Birthday */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Fecha de cumpleaños</label>
            <BirthdayPicker
              value={editedProfile.birthday}
              onChange={(date) => setEditedProfile(prev => ({ ...prev, birthday: date }))}
            />
          </div>

          {/* Dietary Preferences */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Preferencias alimentarias / Alergias</label>
            <textarea
              name="dietaryPreferences"
              value={editedProfile.dietaryPreferences}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
              placeholder="Ej: Sin cebolla, sin culantro, alergia a..."
            />
          </div>

          {/* Marketing Consent */}
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="marketingConsent"
                checked={editedProfile.marketingConsent}
                onChange={handleInputChange}
                className="mt-1 h-5 w-5 rounded border-orange-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="flex-1">
                <span className="block text-sm font-medium text-slate-700">Acepto recibir ofertas y promociones</span>
                <span className="block text-xs text-slate-500 mt-1">
                  Enviaremos ocasionalmente ofertas especiales y novedades.
                </span>
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCloseEdit}
              className="flex-1 px-5 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 px-5 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Guardar cambios
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <Header />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Success Message */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {success}
          </div>
        )}

        {/* Loading State */}
        {loadingProfile ? (
          <div className="bg-white rounded-3xl shadow-lg p-12 flex justify-center">
            <div className="text-center">
              <svg className="animate-spin w-12 h-12 text-orange-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-slate-500">Cargando perfil...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-8">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-2xl font-bold text-orange-600 shadow-lg">
                    {getInitials()}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-white">{getFullName()}</h1>
                    <p className="text-orange-100 mt-1">{profile.email}</p>
                  </div>
                  <button
                    onClick={handleOpenEdit}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Editar
                  </button>
                </div>
              </div>

              {/* Profile Info */}
              <div className="p-6 space-y-6">
                {/* Contact Info Section */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Información de Contacto</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Teléfono</p>
                        <p className="text-slate-800 font-semibold">{profile.phone || <span className="text-slate-400 font-normal">No especificado</span>}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Cumpleaños</p>
                        <p className="text-slate-800 font-semibold">
                          {profile.birthday ? formatDateDisplay(profile.birthday, { year: 'numeric', month: 'long', day: 'numeric' }) : <span className="text-slate-400 font-normal">No especificado</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Section */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Dirección de Entrega</h3>
                  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-slate-800">{profile.address || <span className="text-slate-400">No especificado</span>}</p>
                  </div>
                </div>

                {/* Dietary Preferences Section */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Preferencias Alimentarias</h3>
                  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <p className="text-slate-800">{profile.dietaryPreferences || <span className="text-slate-400">No especificado</span>}</p>
                  </div>
                </div>

                {/* Marketing Preference */}
                <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${profile.marketingConsent ? 'bg-green-100' : 'bg-slate-100'}`}>
                    {profile.marketingConsent ? (
                      <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-slate-800 font-medium">Ofertas y promociones</p>
                    <p className="text-sm text-slate-500">
                      {profile.marketingConsent ? 'Recibirás nuestras ofertas especiales' : 'No recibirás comunicaciones promocionales'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-3xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Accesos Rápidos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => navigate('/profile/orders')}
                  className="flex items-center gap-4 p-4 bg-orange-50 rounded-2xl hover:bg-orange-100 transition-colors text-left group"
                >
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                    <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">Mis Pedidos</p>
                    <p className="text-sm text-slate-500">Ver historial de pedidos</p>
                  </div>
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => navigate('/profile/tickets')}
                  className="flex items-center gap-4 p-4 bg-teal-50 rounded-2xl hover:bg-teal-100 transition-colors text-left group"
                >
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                    <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">Mis Tickets</p>
                    <p className="text-sm text-slate-500">Ver sugerencias y reportes</p>
                  </div>
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-teal-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Back to Menu */}
            <button
              onClick={() => navigate('/menu')}
              className="w-full px-6 py-4 bg-white text-slate-700 rounded-2xl shadow-lg hover:bg-slate-50 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al Menú
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && <EditModal />}
    </div>
  );
};

export default ProfilePage;
