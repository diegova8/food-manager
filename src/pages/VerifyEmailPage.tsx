import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import Header from '../components/Header';
import logo from '../assets/logo.png';

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Token de verificación no válido');
        return;
      }

      try {
        const response = await api.verifyEmail(token);
        setStatus('success');
        setMessage(response.message);
      } catch (err) {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Error al verificar el email');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <Header />

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
            {/* Logo Header */}
            <div className="bg-gradient-to-br from-slate-100 to-slate-50 px-8 py-6 text-center border-b-2 border-slate-200">
              <img
                src={logo}
                alt="Ceviche de mi Tata"
                className="mx-auto h-20 w-20 rounded-full border-4 border-white shadow-lg"
              />
            </div>

            <div className="px-8 py-10">
              {/* Verifying State */}
              {status === 'verifying' && (
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 mb-6">
                    <svg className="animate-spin h-16 w-16 text-sky-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">
                    Verificando tu email...
                  </h2>
                  <p className="text-slate-600 mb-6">
                    Por favor espera un momento mientras confirmamos tu cuenta
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-2 w-2 bg-sky-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="h-2 w-2 bg-sky-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="h-2 w-2 bg-sky-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}

              {/* Success State */}
              {status === 'success' && (
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6 animate-bounce">
                    <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">
                    ¡Email Verificado!
                  </h2>
                  <p className="text-lg text-slate-700 mb-2">
                    {message}
                  </p>
                  <p className="text-slate-600 mb-8">
                    Tu cuenta ha sido activada exitosamente. Ahora puedes iniciar sesión y comenzar a hacer pedidos.
                  </p>

                  {/* Success Features */}
                  <div className="bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-200 rounded-xl p-6 mb-8">
                    <h3 className="text-sm font-semibold text-green-900 mb-4">¿Qué puedes hacer ahora?</h3>
                    <ul className="space-y-3 text-left">
                      <li className="flex items-start gap-3">
                        <svg className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-green-800">Hacer pedidos de ceviches frescos</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <svg className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-green-800">Acceder a promociones exclusivas</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <svg className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-green-800">Ver tu historial de pedidos</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <svg className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-green-800">Guardar tus preferencias y direcciones</span>
                      </li>
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Iniciar Sesión
                    </Link>
                    <Link
                      to="/menu"
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-semibold"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Ver Menú
                    </Link>
                  </div>
                </div>
              )}

              {/* Error State */}
              {status === 'error' && (
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6">
                    <svg className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">
                    Error de Verificación
                  </h2>
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                    <p className="text-sm text-red-800 font-medium mb-2">
                      {message}
                    </p>
                    <p className="text-xs text-red-700">
                      El enlace de verificación puede haber expirado o ser inválido.
                    </p>
                  </div>

                  {/* Error Info */}
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-8 text-left">
                    <h3 className="text-sm font-semibold text-amber-900 mb-3 flex items-center gap-2">
                      <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      ¿Qué puedes hacer?
                    </h3>
                    <ul className="space-y-2 text-sm text-amber-800">
                      <li className="flex items-start gap-2">
                        <span className="font-semibold">1.</span>
                        <span>Verifica que copiaste el enlace completo del correo</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold">2.</span>
                        <span>Revisa tu bandeja de spam o correo no deseado</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold">3.</span>
                        <span>Si el problema persiste, registra una nueva cuenta</span>
                      </li>
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Link
                      to="/register"
                      className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Registrarse de Nuevo
                    </Link>
                    <Link
                      to="/login"
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-semibold"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Ir al Login
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Help Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              ¿Necesitas ayuda?{' '}
              <a href="mailto:admin@cevichedemitata.app" className="text-orange-600 hover:text-orange-700 font-medium">
                Contáctanos
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmailPage;
