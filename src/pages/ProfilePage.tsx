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
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
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
  });

  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);

  useEffect(() => {
    // Check if user is authenticated
    if (!api.isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Load user profile from API
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
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      [name]: value,
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
      });

      setProfile(editedProfile);
      setIsEditing(false);
      setSuccess('Perfil actualizado correctamente');

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <Header />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Mi Perfil
            </h1>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Editar
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  Guardar
                </button>
              </div>
            )}
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600">
              {success}
            </div>
          )}

          {/* Loading State */}
          {loadingProfile && (
            <div className="flex justify-center py-8">
              <svg className="animate-spin w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}

          {/* Profile Form */}
          <div className={`space-y-6 ${loadingProfile ? 'hidden' : ''}`}>
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nombre
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={editedProfile.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Tu nombre"
                  />
                ) : (
                  <p className="px-4 py-3 bg-slate-50 rounded-lg text-slate-800">
                    {profile.firstName || <span className="text-slate-400 italic">No especificado</span>}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Apellidos
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={editedProfile.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Tus apellidos"
                  />
                ) : (
                  <p className="px-4 py-3 bg-slate-50 rounded-lg text-slate-800">
                    {profile.lastName || <span className="text-slate-400 italic">No especificado</span>}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Correo electrónico
              </label>
              <p className="px-4 py-3 bg-slate-100 rounded-lg text-slate-600">
                {profile.email || <span className="text-slate-400 italic">No especificado</span>}
                <span className="text-xs text-slate-400 ml-2">(No editable)</span>
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Teléfono
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={editedProfile.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="Tu número de teléfono"
                />
              ) : (
                <p className="px-4 py-3 bg-slate-50 rounded-lg text-slate-800">
                  {profile.phone || <span className="text-slate-400 italic">No especificado</span>}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Dirección de entrega
              </label>
              {isEditing ? (
                <textarea
                  name="address"
                  value={editedProfile.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                  placeholder="Tu dirección de entrega"
                />
              ) : (
                <p className="px-4 py-3 bg-slate-50 rounded-lg text-slate-800">
                  {profile.address || <span className="text-slate-400 italic">No especificado</span>}
                </p>
              )}
            </div>

            {/* Birthday */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fecha de cumpleaños
              </label>
              {isEditing ? (
                <BirthdayPicker
                  value={editedProfile.birthday}
                  onChange={(date) => setEditedProfile(prev => ({ ...prev, birthday: date }))}
                />
              ) : (
                <p className="px-4 py-3 bg-slate-50 rounded-lg text-slate-800">
                  {profile.birthday ? formatDateDisplay(profile.birthday, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : <span className="text-slate-400 italic">No especificado</span>}
                </p>
              )}
            </div>

            {/* Dietary Preferences */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Preferencias alimentarias / Alergias
              </label>
              {isEditing ? (
                <textarea
                  name="dietaryPreferences"
                  value={editedProfile.dietaryPreferences}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                  placeholder="Ej: Sin cebolla, sin culantro, alergia a..."
                />
              ) : (
                <p className="px-4 py-3 bg-slate-50 rounded-lg text-slate-800">
                  {profile.dietaryPreferences || <span className="text-slate-400 italic">No especificado</span>}
                </p>
              )}
            </div>
          </div>

          {/* Back to Menu */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <button
              onClick={() => navigate('/menu')}
              className="w-full md:w-auto px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al Menú
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
