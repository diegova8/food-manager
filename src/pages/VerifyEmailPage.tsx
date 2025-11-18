import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center py-8 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <img src={logo} alt="Ceviche de mi Tata" className="mx-auto h-24 mb-4 rounded-full" />
          </div>

          {status === 'verifying' && (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Verificando tu email...
              </h2>
              <p className="text-gray-600">
                Por favor espera un momento
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                ¡Email Verificado!
              </h2>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              <Link
                to="/login"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Ir al Login
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Error de Verificación
              </h2>
              <p className="text-red-600 mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  El token de verificación puede haber expirado o ser inválido.
                </p>
                <Link
                  to="/register"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Registrarse de Nuevo
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifyEmailPage;
