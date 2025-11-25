import { useState } from 'react';
import envaseImg from '../assets/envase.jpg';
import logo from '../assets/logo.png';

interface WelcomeGuideProps {
  onComplete: () => void;
}

const WelcomeGuide: React.FC<WelcomeGuideProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Bienvenido',
      icon: (
        <img src={logo} alt="Ceviche de mi Tata" className="w-20 h-20 object-contain" />
      ),
      content: (
        <div className="text-center">
          <p className="text-slate-600 text-lg font-semibold">
            El Mejor Ceviche
          </p>
          <p className="text-slate-500 mt-2">
            Te explicamos cómo funciona
          </p>
        </div>
      )
    },
    {
      title: 'Porción',
      icon: null,
      content: (
        <div className="text-center">
          <div className="relative w-48 h-48 mx-auto mb-4">
            <img
              src={envaseImg}
              alt="Porción de ceviche"
              className="w-full h-full object-cover rounded-2xl shadow-lg"
            />
            <div className="absolute -bottom-2 -right-2 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              Envase
            </div>
          </div>
          <p className="text-slate-600">
            Todas nuestros ceviches tienen sólo una presentación de <span className="font-bold text-orange-600">300gr</span> de proteína, aparte del caldo y los olores.
          </p>
          <p className="text-slate-500 text-sm mt-1">
            Ideal para 1-2 personas
          </p>
        </div>
      )
    },
    {
      title: 'Pedidos',
      icon: (
        <svg className="w-12 h-12 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      content: (
        <div className="text-center">
          <p className="text-slate-600">
            Pedidos para <span className="font-bold text-teal-600">el día siguiente</span> o después
          </p>
          <p className="text-slate-500 text-sm mt-2">
            Recomendamos pedir con 2 días de anticipación
          </p>
        </div>
      )
    },
    {
      title: 'Pago',
      icon: (
        <svg className="w-12 h-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      content: (
        <div className="text-center">
          <p className="text-slate-600">
            Pago únicamente por <span className="font-bold text-blue-600">SINPE Móvil</span>
          </p>
          <p className="text-slate-500 text-sm mt-2">
            Te daremos el número al hacer tu pedido
          </p>
        </div>
      )
    },
    {
      title: 'Entrega',
      icon: (
        <svg className="w-12 h-12 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      content: (
        <div className="text-center">
          <p className="text-slate-600">
            <span className="font-bold text-emerald-600">Pick up</span> o coordinamos envío
          </p>
          <p className="text-slate-500 text-sm mt-2">
            Te contactamos por WhatsApp para coordinar
          </p>
        </div>
      )
    },
    {
      title: 'Historial',
      icon: (
        <svg className="w-12 h-12 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      content: (
        <div className="text-center">
          <p className="text-slate-600">
            Revisa tus pedidos en <span className="font-bold text-purple-600">Mi Perfil</span>
          </p>
          <p className="text-slate-500 text-sm mt-2">
            Crea una cuenta para ver tu historial
          </p>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold text-lg">{step.title}</h2>
            <span className="text-orange-200 text-sm">
              {currentStep + 1} / {steps.length}
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-1 bg-orange-400/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step.icon && (
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center">
                {step.icon}
              </div>
            </div>
          )}
          {step.content}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 space-y-3">
          <button
            onClick={handleNext}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-200"
          >
            {isLastStep ? '¡Empezar!' : 'Siguiente'}
          </button>

          {!isLastStep && (
            <button
              onClick={handleSkip}
              className="w-full py-2 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
            >
              Saltar introducción
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WelcomeGuide;
