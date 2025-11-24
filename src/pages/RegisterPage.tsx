import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import Header from '../components/Header';
import BirthdayPicker from '../components/BirthdayPicker';
import logo from '../assets/logo.png';

function RegisterPage() {
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (api.isAuthenticated()) {
      navigate('/menu');
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    birthday: '',
    dietaryPreferences: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  // Password validation rules
  const getPasswordValidation = (password: string) => {
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password),
    };
  };

  const passwordValidation = getPasswordValidation(formData.password);
  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

  // Password strength calculator
  const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    const validation = getPasswordValidation(password);
    const passedRules = Object.values(validation).filter(Boolean).length;

    if (passedRules <= 2) return { strength: 1, label: 'Débil', color: 'bg-red-500' };
    if (passedRules <= 4) return { strength: 2, label: 'Media', color: 'bg-amber-500' };
    return { strength: 3, label: 'Fuerte', color: 'bg-green-500' };
  };

  const passwordStrength = formData.password ? getPasswordStrength(formData.password) : null;

  // Email validation
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  // Check if form is valid for submission
  const isFormValid =
    formData.email &&
    isEmailValid &&
    formData.password &&
    isPasswordValid &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword &&
    formData.firstName.length >= 2 &&
    formData.lastName.length >= 2 &&
    formData.phone.length >= 8;

  // Translate error messages to Spanish
  const translateError = (error: string): string => {
    const translations: Record<string, string> = {
      'Password must be at least 8 characters long': 'La contraseña debe tener al menos 8 caracteres',
      'Password must contain at least one uppercase letter': 'La contraseña debe contener al menos una mayúscula',
      'Password must contain at least one lowercase letter': 'La contraseña debe contener al menos una minúscula',
      'Password must contain at least one number': 'La contraseña debe contener al menos un número',
      'Password must contain at least one special character': 'La contraseña debe contener al menos un carácter especial (!@#$%...)',
      'Invalid email format': 'Formato de email inválido',
      'First name must be at least 2 characters': 'El nombre debe tener al menos 2 caracteres',
      'Last name must be at least 2 characters': 'Los apellidos deben tener al menos 2 caracteres',
      'Invalid phone number format': 'Formato de teléfono inválido',
      'A user with this email already exists': 'Ya existe un usuario con este email',
    };

    // Check if error contains any known message
    for (const [en, es] of Object.entries(translations)) {
      if (error.includes(en)) {
        return error.replace(en, es);
      }
    }

    return error;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validations
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (!isPasswordValid) {
      setError('La contraseña no cumple con todos los requisitos');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;

      // Remove empty optional fields
      const cleanData = Object.fromEntries(
        Object.entries(registerData).filter(([_, value]) => value !== '')
      );

      await api.register(cleanData as typeof registerData);
      setSuccess(true);

      // User will click button to go to login
    } catch (err) {
      let errorMessage = 'Error al registrarse. Por favor intenta de nuevo.';

      if (err instanceof Error) {
        errorMessage = translateError(err.message);
      } else if (typeof err === 'string') {
        errorMessage = translateError(err);
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
        <Header />
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl shadow-xl p-10 text-center border border-green-200">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                ¡Registro Exitoso!
              </h2>
              <p className="text-slate-700 mb-2 text-lg">
                Bienvenido, <span className="font-semibold text-orange-600">{formData.firstName} {formData.lastName}</span>
              </p>
              <p className="text-slate-600 mb-6">
                Hemos enviado un correo de verificación a:
              </p>
              <p className="font-semibold text-orange-600 mb-6 bg-orange-50 rounded-lg px-4 py-3 border-2 border-orange-200">
                {formData.email}
              </p>
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-6 space-y-2">
                <p className="text-sm text-amber-800 font-medium">
                  Por favor, revisa tu bandeja de entrada y haz clic en el enlace de verificación para activar tu cuenta.
                </p>
                <p className="text-xs text-amber-700 flex items-center gap-1">
                  <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Si no lo encuentras, revisa tu carpeta de spam o correo no deseado.
                </p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 px-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-semibold rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Ir a Iniciar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <Header />

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
            {/* Header Section */}
            <div className="bg-gradient-to-br from-orange-600 to-orange-500 px-8 py-10 text-center">
              <img
                src={logo}
                alt="Ceviche de mi Tata"
                className="mx-auto h-20 w-20 rounded-full border-4 border-white shadow-lg mb-4"
              />
              <h1 className="text-3xl font-bold text-white mb-2">
                Crear Cuenta
              </h1>
              <p className="text-orange-100 text-sm">
                Regístrate para hacer pedidos más rápido y acceder a promociones exclusivas
              </p>
            </div>

            {/* Form Section */}
            <div className="px-8 py-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Account Information */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b-2 border-orange-100">
                    Información de Cuenta
                  </h3>

                  <div className="space-y-4">
                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                          </svg>
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder-slate-400"
                          placeholder="tu@email.com"
                        />
                      </div>
                    </div>

                    {/* Password Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Password */}
                      <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                          Contraseña <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full pl-10 pr-12 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder-slate-400"
                            placeholder="Mínimo 8 caracteres"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? (
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        {/* Password Requirements */}
                        {formData.password && (
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all ${passwordStrength?.color}`}
                                  style={{ width: `${((passwordStrength?.strength || 0) / 3) * 100}%` }}
                                ></div>
                              </div>
                              <span className={`text-xs font-medium ${
                                passwordStrength?.strength === 1 ? 'text-red-600' :
                                passwordStrength?.strength === 2 ? 'text-amber-600' :
                                'text-green-600'
                              }`}>
                                {passwordStrength?.label}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-1 text-xs">
                              <div className={`flex items-center gap-1 ${passwordValidation.minLength ? 'text-green-600' : 'text-orange-600 font-medium'}`}>
                                {passwordValidation.minLength ? '✓' : '○'} 8+ caracteres
                              </div>
                              <div className={`flex items-center gap-1 ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-orange-600 font-medium'}`}>
                                {passwordValidation.hasUppercase ? '✓' : '○'} Una mayúscula
                              </div>
                              <div className={`flex items-center gap-1 ${passwordValidation.hasLowercase ? 'text-green-600' : 'text-orange-600 font-medium'}`}>
                                {passwordValidation.hasLowercase ? '✓' : '○'} Una minúscula
                              </div>
                              <div className={`flex items-center gap-1 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-orange-600 font-medium'}`}>
                                {passwordValidation.hasNumber ? '✓' : '○'} Un número
                              </div>
                              <div className={`flex items-center gap-1 col-span-2 ${passwordValidation.hasSpecial ? 'text-green-600' : 'text-orange-600 font-medium'}`}>
                                {passwordValidation.hasSpecial ? '✓' : '○'} Un carácter especial (!@#$%...)
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-2">
                          Confirmar Contraseña <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder-slate-400 ${
                              formData.confirmPassword && formData.password !== formData.confirmPassword
                                ? 'border-red-300 focus:border-red-500'
                                : 'border-slate-200 focus:border-transparent'
                            }`}
                            placeholder="Repite tu contraseña"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                          >
                            {showConfirmPassword ? (
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Las contraseñas no coinciden
                          </p>
                        )}
                        {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password && (
                          <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Las contraseñas coinciden
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b-2 border-amber-100">
                    Información Personal
                  </h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* First Name */}
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-semibold text-slate-700 mb-2">
                          Nombre <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder-slate-400"
                            placeholder="Juan"
                          />
                        </div>
                      </div>

                      {/* Last Name */}
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-semibold text-slate-700 mb-2">
                          Apellidos <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder-slate-400"
                            placeholder="Pérez"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                        Teléfono <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder-slate-400"
                          placeholder="+506 1234 5678"
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label htmlFor="address" className="block text-sm font-semibold text-slate-700 mb-2">
                        Dirección <span className="text-slate-400 font-normal">(Opcional)</span>
                      </label>
                      <div className="relative">
                        <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                          <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder-slate-400"
                          placeholder="San José, Costa Rica"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Birthday */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Fecha de Nacimiento <span className="text-slate-400 font-normal">(Opcional)</span>
                        </label>
                        <BirthdayPicker
                          value={formData.birthday}
                          onChange={(date) => setFormData({ ...formData, birthday: date })}
                        />
                        <p className="text-xs text-slate-500 mt-1.5 ml-1">
                          Para enviarte promociones en tu cumpleaños
                        </p>
                      </div>

                      {/* Dietary Preferences */}
                      <div>
                        <label htmlFor="dietaryPreferences" className="block text-sm font-semibold text-slate-700 mb-2">
                          Alergias / Preferencias <span className="text-slate-400 font-normal">(Opcional)</span>
                        </label>
                        <textarea
                          id="dietaryPreferences"
                          name="dietaryPreferences"
                          value={formData.dietaryPreferences}
                          onChange={handleChange}
                          rows={3}
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder-slate-400 resize-none"
                          placeholder="Ej: Alérgico a mariscos"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <svg className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !isFormValid}
                  className="w-full px-6 py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creando tu cuenta...
                    </span>
                  ) : (
                    'Crear Cuenta'
                  )}
                </button>
              </form>

              {/* Login Link */}
              <div className="mt-8 text-center">
                <p className="text-sm text-slate-600">
                  ¿Ya tienes cuenta?{' '}
                  <Link to="/login" className="text-orange-600 hover:text-orange-700 font-semibold">
                    Inicia sesión aquí
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
