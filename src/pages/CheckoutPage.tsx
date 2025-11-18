import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { formatCurrency } from '../utils';
import logo from '../assets/logo.png';

type DeliveryMethod = 'pickup' | 'uber-flash';

interface PersonalInfo {
  name: string;
  phone: string;
  email?: string;
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if user is authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Form data
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: '',
    phone: '',
    email: ''
  });
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('pickup');
  const [notes, setNotes] = useState('');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string>('');

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/menu');
    }
  }, [items, navigate]);

  // Load user data if authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const isValid = await api.verifyToken();
          if (isValid) {
            setIsAuthenticated(true);
            // TODO: Fetch user data from token
            // For now, we'll need to decode the token or make an API call
          }
        } catch (error) {
          console.error('Auth check failed:', error);
        }
      }
    };
    checkAuth();
  }, []);

  // Dropzone for payment proof
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setPaymentProof(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setPaymentProofPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  });

  const handleNextStep = () => {
    setError('');

    if (currentStep === 1) {
      // Validate personal info
      if (!personalInfo.name.trim() || !personalInfo.phone.trim()) {
        setError('Por favor completa tu nombre y teléfono');
        return;
      }
    }

    if (currentStep === 3) {
      // Validate payment proof
      if (!paymentProof) {
        setError('Por favor sube el comprobante de pago');
        return;
      }
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmitOrder();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  const handleSubmitOrder = async () => {
    setLoading(true);
    setError('');

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Image = reader.result as string;

          const orderData = {
            items: items.map(item => ({
              cevicheType: item.name,
              quantity: item.quantity,
              price: item.price
            })),
            total: getTotalPrice(),
            personalInfo,
            deliveryMethod,
            notes,
            paymentProof: base64Image
          };

          // Send order to API
          await api.createOrder(orderData);

          // Clear cart and navigate to success page
          clearCart();
          navigate('/order-success');
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error al procesar el pedido');
          setLoading(false);
        }
      };

      if (paymentProof) {
        reader.readAsDataURL(paymentProof);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pedido');
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              currentStep >= step
                ? 'bg-blue-600 text-white'
                : 'bg-gray-300 text-gray-600'
            }`}
          >
            {step}
          </div>
          {step < 3 && (
            <div
              className={`w-16 h-1 ${
                currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Información Personal
      </h2>

      {isAuthenticated && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            ✓ Datos cargados desde tu cuenta
          </p>
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre Completo *
        </label>
        <input
          type="text"
          id="name"
          value={personalInfo.name}
          onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Juan Pérez"
          required
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Teléfono *
        </label>
        <input
          type="tel"
          id="phone"
          value={personalInfo.phone}
          onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="+506 1234 5678"
          required
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email (opcional)
        </label>
        <input
          type="email"
          id="email"
          value={personalInfo.email}
          onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="tu@email.com"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Método de Entrega
      </h2>

      <div className="space-y-3">
        <div
          onClick={() => setDeliveryMethod('pickup')}
          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
            deliveryMethod === 'pickup'
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-300 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="delivery"
              value="pickup"
              checked={deliveryMethod === 'pickup'}
              onChange={() => setDeliveryMethod('pickup')}
              className="w-5 h-5"
            />
            <div className="flex-1">
              <div className="font-bold text-lg">🏪 Pick Up</div>
              <p className="text-sm text-gray-600">
                Recoge tu pedido en nuestra ubicación
              </p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setDeliveryMethod('uber-flash')}
          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
            deliveryMethod === 'uber-flash'
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-300 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="delivery"
              value="uber-flash"
              checked={deliveryMethod === 'uber-flash'}
              onChange={() => setDeliveryMethod('uber-flash')}
              className="w-5 h-5"
            />
            <div className="flex-1">
              <div className="font-bold text-lg">🚗 Uber Flash</div>
              <p className="text-sm text-gray-600">
                Envía un Uber Flash para recoger tu pedido
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Te contactaremos por WhatsApp con la ubicación
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Pago y Confirmación
      </h2>

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h3 className="font-bold text-lg mb-3">Resumen del Pedido</h3>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.quantity}x {item.name}
              </span>
              <span className="font-semibold">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t mt-3 pt-3 flex justify-between font-bold text-lg">
          <span>Total</span>
          <span className="text-green-600">{formatCurrency(getTotalPrice())}</span>
        </div>
      </div>

      {/* Payment Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-bold text-lg mb-2">💳 Instrucciones de Pago</h3>
        <p className="text-sm text-gray-700 mb-2">
          Realiza una transferencia SINPE Móvil a:
        </p>
        <div className="bg-white rounded p-3 mb-2">
          <p className="text-2xl font-bold text-blue-600 text-center">
            +506 6000 8080
          </p>
        </div>
        <p className="text-sm text-gray-700">
          Monto: <span className="font-bold">{formatCurrency(getTotalPrice())}</span>
        </p>
      </div>

      {/* Payment Proof Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Comprobante de Pago *
        </label>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400'
          }`}
        >
          <input {...getInputProps()} />
          {paymentProofPreview ? (
            <div>
              <img
                src={paymentProofPreview}
                alt="Comprobante"
                className="max-h-48 mx-auto rounded mb-2"
              />
              <p className="text-sm text-green-600 font-semibold">
                ✓ Comprobante cargado
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Haz clic para cambiar
              </p>
            </div>
          ) : (
            <div>
              <div className="text-4xl mb-2">📸</div>
              <p className="text-sm text-gray-600">
                Arrastra tu comprobante aquí o haz clic para seleccionar
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF (máx. 10MB)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notas / Instrucciones Especiales (opcional)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ej: Sin cebolla, extra picante, etc."
        />
      </div>
    </div>
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <img src={logo} alt="Ceviche de mi Tata" className="mx-auto h-20 mb-4 rounded-full" />
            <h1 className="text-3xl font-bold text-gray-800">Finalizar Pedido</h1>
          </div>

          {renderStepIndicator()}

          <div className="mb-6">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            {currentStep > 1 && (
              <button
                onClick={handlePrevStep}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                ← Atrás
              </button>
            )}

            <button
              onClick={handleNextStep}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                'Procesando...'
              ) : currentStep === 3 ? (
                'Confirmar Pedido ✓'
              ) : (
                'Continuar →'
              )}
            </button>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/menu')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              ← Volver al menú
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
