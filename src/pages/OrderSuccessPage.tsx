import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

function OrderSuccessPage() {
  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center py-8 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <img src={logo} alt="Ceviche de mi Tata" className="mx-auto h-24 mb-4 rounded-full" />

          <div className="text-6xl mb-4">🎉</div>

          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            ¡Pedido Recibido!
          </h1>

          <p className="text-gray-600 mb-6">
            Hemos recibido tu pedido y estamos verificando tu pago.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-lg mb-2">📱 ¿Qué sigue?</h3>
            <ul className="text-sm text-gray-700 space-y-2 text-left">
              <li>✓ Verificaremos tu comprobante de pago</li>
              <li>✓ Confirmaremos tu pedido</li>
              <li>✓ Te contactaremos por WhatsApp</li>
              <li>✓ Prepararemos tu pedido</li>
            </ul>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            Si proporcionaste un email, también recibirás una confirmación por correo.
          </p>

          <div className="space-y-3">
            <Link
              to="/menu"
              className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Hacer Otro Pedido
            </Link>

            <Link
              to="/"
              className="block w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Volver al Inicio
            </Link>
          </div>

          <div className="mt-6 text-xs text-gray-400">
            <p>Tiempo estimado de preparación: 15-30 minutos</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccessPage;
