import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { formatCurrency, formatDateDisplay } from '../utils';
import Header from '../components/Header';
import DatePicker from '../components/DatePicker';
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
  const [loadingProfile, setLoadingProfile] = useState(api.isAuthenticated());

  // Form data
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: '',
    phone: '',
    email: ''
  });
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('pickup');
  const [scheduledDate, setScheduledDate] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string>('');
  const [orderCompleted, setOrderCompleted] = useState(false);

  // Redirect if cart is empty (but not after order completion)
  useEffect(() => {
    if (items.length === 0 && !orderCompleted) {
      navigate('/menu');
    }
  }, [items, navigate, orderCompleted]);

  // Load user data if authenticated
  useEffect(() => {
    const loadUserData = async () => {
      if (!api.isAuthenticated()) {
        setLoadingProfile(false);
        return;
      }

      try {
        setIsAuthenticated(true);
        const response = await api.getProfile();
        const userData = response.data;

        // Pre-fill form with user's profile data
        const fullName = [userData.firstName, userData.lastName].filter(Boolean).join(' ');
        setPersonalInfo({
          name: fullName || '',
          phone: userData.phone || '',
          email: userData.email || ''
        });
      } catch (error) {
        console.error('Failed to load user profile:', error);
      } finally {
        setLoadingProfile(false);
      }
    };
    loadUserData();
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

    if (currentStep === 2) {
      // Validate scheduled date
      if (!scheduledDate) {
        setError('Por favor selecciona una fecha para tu pedido');
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
      if (!paymentProof) {
        setError('Por favor sube el comprobante de pago');
        setLoading(false);
        return;
      }

      // Step 1: Upload payment proof image to cloud storage
      const { url: paymentProofUrl } = await api.uploadPaymentProof(paymentProof);

      // Step 2: Create order with the image URL
      const orderData = {
        items: items.map(item => ({
          cevicheType: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        total: getTotalPrice(),
        personalInfo,
        deliveryMethod,
        scheduledDate,
        notes,
        paymentProof: paymentProofUrl
      };

      const result = await api.createOrder(orderData);

      // Mark order as completed before clearing cart to prevent redirect
      setOrderCompleted(true);
      clearCart();
      navigate('/order-success', { state: { orderId: result.data.orderId } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pedido');
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Datos', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
    { number: 2, title: 'Entrega', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )},
    { number: 3, title: 'Pago', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    )}
  ];

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                currentStep >= step.number
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {currentStep > step.number ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.icon
              )}
            </div>
            <span className={`text-xs mt-2 font-medium ${
              currentStep >= step.number ? 'text-orange-600' : 'text-slate-400'
            }`}>
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-12 md:w-20 h-1 mx-2 rounded-full transition-all duration-300 ${
                currentStep > step.number ? 'bg-orange-500' : 'bg-slate-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => {
    if (loadingProfile) {
      return (
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4">
              <svg className="animate-spin h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-slate-600 font-medium">Cargando tus datos...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        {isAuthenticated && (
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-teal-800 font-medium">
              Datos cargados desde tu cuenta
            </p>
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
            Nombre Completo
          </label>
          <input
            type="text"
            id="name"
            value={personalInfo.name}
            onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
            className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-orange-400 focus:bg-white transition-all duration-200 text-slate-900 placeholder-slate-400"
            placeholder="Juan Pérez"
            required
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
            Teléfono
          </label>
          <input
            type="tel"
            id="phone"
            value={personalInfo.phone}
            onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
            className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-orange-400 focus:bg-white transition-all duration-200 text-slate-900 placeholder-slate-400"
            placeholder="+506 8888 8888"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
            Email <span className="text-slate-400 font-normal">(opcional)</span>
          </label>
          <input
            type="email"
            id="email"
            value={personalInfo.email}
            onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
            className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-orange-400 focus:bg-white transition-all duration-200 text-slate-900 placeholder-slate-400"
            placeholder="tu@email.com"
          />
        </div>
      </div>
    );
  };

  const renderStep2 = () => {
    // Calculate recommended date (2 days from now)
    const today = new Date();
    const recommendedDate = new Date();
    recommendedDate.setDate(today.getDate() + 2);
    const recommendedDateStr = recommendedDate.toISOString().split('T')[0];

    return (
      <div className="space-y-5">
        {/* Schedule Date - First */}
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-5 border border-teal-200 overflow-visible">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-teal-800">¡Programa tu orden!</h3>
              <p className="text-xs text-teal-600">Recomendamos al menos 2 días de anticipación</p>
            </div>
          </div>
          <DatePicker
            value={scheduledDate}
            onChange={setScheduledDate}
          />
          {scheduledDate && scheduledDate < recommendedDateStr && (
            <p className="text-xs text-amber-600 mt-3 flex items-center gap-1 bg-amber-50 rounded-lg px-3 py-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Pedidos con menos de 2 días de anticipación podrían no estar disponibles
            </p>
          )}
        </div>

        {/* Delivery Method Selection */}
        <div className="space-y-4">
          <p className="text-sm font-semibold text-slate-700">Método de entrega</p>
          <div
            onClick={() => setDeliveryMethod('pickup')}
            className={`p-5 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
              deliveryMethod === 'pickup'
                ? 'border-orange-400 bg-gradient-to-r from-orange-50 to-amber-50 shadow-md'
                : 'border-slate-200 bg-white hover:border-orange-200 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                deliveryMethod === 'pickup' ? 'bg-orange-100' : 'bg-slate-100'
              }`}>
                🏪
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-lg ${
                    deliveryMethod === 'pickup' ? 'text-orange-700' : 'text-slate-800'
                  }`}>
                    Pick Up
                  </span>
                  {deliveryMethod === 'pickup' && (
                    <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                      Seleccionado
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  Recoge tu pedido en nuestra ubicación
                </p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                deliveryMethod === 'pickup'
                  ? 'border-orange-500 bg-orange-500'
                  : 'border-slate-300'
              }`}>
                {deliveryMethod === 'pickup' && (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
          </div>

          <div
            onClick={() => setDeliveryMethod('uber-flash')}
            className={`p-5 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
              deliveryMethod === 'uber-flash'
                ? 'border-orange-400 bg-gradient-to-r from-orange-50 to-amber-50 shadow-md'
                : 'border-slate-200 bg-white hover:border-orange-200 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                deliveryMethod === 'uber-flash' ? 'bg-orange-100' : 'bg-slate-100'
              }`}>
                🚗
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-lg ${
                    deliveryMethod === 'uber-flash' ? 'text-orange-700' : 'text-slate-800'
                  }`}>
                    Uber Flash
                  </span>
                  {deliveryMethod === 'uber-flash' && (
                    <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                      Seleccionado
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  Envía un Uber Flash para recoger tu pedido
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Te contactaremos por WhatsApp con la ubicación
                </p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                deliveryMethod === 'uber-flash'
                  ? 'border-orange-500 bg-orange-500'
                  : 'border-slate-300'
              }`}>
                {deliveryMethod === 'uber-flash' && (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="space-y-5">
      {/* Order Summary Card */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Resumen del Pedido
        </h3>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold text-sm">
                  {item.quantity}
                </span>
                <span className="text-slate-700">{item.name}</span>
              </div>
              <span className="font-semibold text-slate-800">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        {/* Delivery Info */}
        <div className="border-t border-slate-200 mt-4 pt-4 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Fecha programada
            </span>
            <span className="font-medium text-teal-700">
              {scheduledDate ? formatDateDisplay(scheduledDate, { weekday: 'short', day: 'numeric', month: 'short' }) : '-'}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Entrega
            </span>
            <span className="font-medium text-slate-700">
              {deliveryMethod === 'pickup' ? '🏪 Pick Up' : '🚗 Uber Flash'}
            </span>
          </div>
        </div>

        {/* Total */}
        <div className="border-t border-slate-200 mt-4 pt-4 flex justify-between items-center">
          <span className="font-bold text-slate-800">Total</span>
          <span className="text-2xl font-bold text-orange-600">{formatCurrency(getTotalPrice())}</span>
        </div>
      </div>

      {/* Payment Instructions Card */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-200">
        <h3 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Instrucciones de Pago
        </h3>
        <p className="text-sm text-orange-700 mb-3">
          Realiza una transferencia SINPE Móvil a:
        </p>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-200">
          <p className="text-3xl font-bold text-orange-600 text-center tracking-wider">
            +506 6000 8080
          </p>
        </div>
        <p className="text-sm text-orange-700 mt-3 text-center">
          Monto: <span className="font-bold">{formatCurrency(getTotalPrice())}</span>
        </p>
      </div>

      {/* Payment Proof Upload */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          Comprobante de Pago
        </label>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
            isDragActive
              ? 'border-orange-500 bg-orange-50'
              : paymentProofPreview
              ? 'border-teal-400 bg-teal-50'
              : 'border-slate-300 bg-slate-50 hover:border-orange-400 hover:bg-orange-50'
          }`}
        >
          <input {...getInputProps()} />
          {paymentProofPreview ? (
            <div className="space-y-3">
              <img
                src={paymentProofPreview}
                alt="Comprobante"
                className="max-h-40 mx-auto rounded-xl shadow-md"
              />
              <div className="flex items-center justify-center gap-2 text-teal-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-semibold">Comprobante cargado</span>
              </div>
              <p className="text-xs text-slate-500">
                Toca para cambiar
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-16 h-16 mx-auto bg-orange-100 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-slate-700">
                  Arrastra tu comprobante aquí
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  o toca para seleccionar
                </p>
              </div>
              <p className="text-xs text-slate-400">
                PNG, JPG, GIF (máx. 10MB)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-semibold text-slate-700 mb-2">
          Notas <span className="text-slate-400 font-normal">(opcional)</span>
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-orange-400 focus:bg-white transition-all duration-200 text-slate-900 placeholder-slate-400 resize-none"
          placeholder="Ej: Sin cebolla, extra picante, etc."
        />
      </div>
    </div>
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <Header />

      {/* Main Content */}
      <div className="px-4 py-6 md:py-10">
        <div className="max-w-lg mx-auto">
          {/* Header Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100">
            {/* Top Section with Logo */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-8 text-center rounded-t-3xl">
              <div className="w-20 h-20 mx-auto bg-white rounded-full p-1 shadow-lg mb-4">
                <img src={logo} alt="Ceviche de mi Tata" className="w-full h-full rounded-full object-cover" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Finalizar Pedido
              </h1>
              <p className="text-orange-100 text-sm mt-2">
                {items.length} {items.length === 1 ? 'ceviche' : 'ceviches'} • {formatCurrency(getTotalPrice())}
              </p>
            </div>

            {/* Step Indicator */}
            <div className="px-6 py-6 border-b border-slate-100">
              {renderStepIndicator()}
            </div>

            {/* Form Content */}
            <div className="px-6 py-6">
              {/* Step Title */}
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-6">
                {currentStep === 1 && 'Información Personal'}
                {currentStep === 2 && 'Método de Entrega'}
                {currentStep === 3 && 'Pago y Confirmación'}
              </h2>

              {/* Step Content */}
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}

              {/* Error Message */}
              {error && (
                <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="px-6 pb-6 pt-2">
              <div className="flex gap-3">
                {currentStep > 1 && (
                  <button
                    onClick={handlePrevStep}
                    className="flex-1 px-6 py-4 border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Atrás
                  </button>
                )}

                <button
                  onClick={handleNextStep}
                  disabled={loading || loadingProfile}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Procesando...
                    </>
                  ) : currentStep === 3 ? (
                    <>
                      Confirmar Pedido
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  ) : (
                    <>
                      Continuar
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>

              {/* Back to Menu Link */}
              <button
                onClick={() => navigate('/menu')}
                className="w-full mt-4 py-3 text-sm text-slate-500 hover:text-orange-600 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver al menú
              </button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-6 flex items-center justify-center gap-6 text-slate-500 text-xs">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Pago seguro
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              100% Fresco
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
