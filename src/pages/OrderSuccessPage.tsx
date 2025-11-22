import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import logo from '../assets/logo.png';

function OrderSuccessPage() {
  const location = useLocation();
  const orderId = location.state?.orderId;

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <Header />

      <div className="flex items-center justify-center py-8 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-8 text-center">
              <div className="w-20 h-20 mx-auto bg-white rounded-full p-1 shadow-lg mb-4">
                <img src={logo} alt="Ceviche de mi Tata" className="w-full h-full rounded-full object-cover" />
              </div>
              <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">
                ¡Pedido Recibido!
              </h1>
              {orderId && (
                <p className="text-emerald-100 mt-2 font-mono">
                  #{orderId.slice(-8)}
                </p>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-slate-600 text-center mb-6">
                Hemos recibido tu pedido y estamos verificando tu pago.
              </p>

              {/* Steps */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-5 mb-6 border border-orange-200">
                <h3 className="font-bold text-orange-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  ¿Qué sigue?
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-sm text-slate-600">Verificaremos tu comprobante de pago</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-sm text-slate-600">Confirmaremos tu pedido</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-sm text-slate-600">Te contactaremos por WhatsApp</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-sm text-slate-600">Prepararemos tu delicioso ceviche</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link
                  to={orderId ? `/profile/orders/${orderId}` : '/profile/orders'}
                  className="block w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all text-center shadow-lg shadow-orange-200"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Ver Estado del Pedido
                  </span>
                </Link>

                <Link
                  to="/menu"
                  className="block w-full px-6 py-4 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors text-center"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Volver al Menú
                  </span>
                </Link>
              </div>

              {/* Email notice */}
              <p className="text-xs text-slate-400 text-center mt-6">
                Si proporcionaste un email, también recibirás una confirmación por correo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccessPage;
