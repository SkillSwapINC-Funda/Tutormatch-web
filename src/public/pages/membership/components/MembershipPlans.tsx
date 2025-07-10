import { useState } from 'react';
import { MembershipService } from '../services/MembershipService';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Plan BÁSICO',
    features: [
      'Perfil básico en la plataforma.',
      'Acceso a estudiantes interesados.',
      'Historial de tutorías.',
      'Soporte con respuesta en 48 horas.'
    ],
    price: 'S/ 5.00',
    numericPrice: 5,
  },
  {
    name: 'Plan ESTÁNDAR',
    features: [
      'Todo lo del plan básico.',
      'Acceso a herramientas de gestión de tutorías (calendarios avanzados, recordatorios automáticos).',
      'Recomendaciones personalizadas para estudiantes.',
      'Mayor visibilidad en búsquedas.',
      'Soporte con respuesta en 24 horas.'
    ],
    price: 'S/ 10.00',
    numericPrice: 10,
  },
  {
    name: 'Plan PREMIUM',
    features: [
      'Todo lo del plan estándar.',
      'Perfil destacado con mayor exposición en la plataforma.',
      'Acceso a estadísticas avanzadas sobre rendimiento de tutorías.',
      'Promociones y descuentos en anuncios dentro de la plataforma.',
      'Soporte prioritario con respuesta en 12 horas.',
      'Acceso a eventos exclusivos y oportunidades de desarrollo profesional.'
    ],
    price: 'S/ 15.00',
    numericPrice: 15,
  },
];

const qrImages = {
  yape: 'https://xdqnuesrahrusfnxcwvm.supabase.co/storage/v1/object/public/qr//qr.png',
  plin: 'https://xdqnuesrahrusfnxcwvm.supabase.co/storage/v1/object/public/qr//plin.jpg',
  yapeIcon: 'https://xdqnuesrahrusfnxcwvm.supabase.co/storage/v1/object/public/qr//yape.png',
  plinIcon: 'https://xdqnuesrahrusfnxcwvm.supabase.co/storage/v1/object/public/qr//plin.png'
};

export default function MembershipPlans() {
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState<'yape' | 'plin'>('yape');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();

  const handleBuy = (idx: number) => {
    setSelectedPlan(idx);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setFile(null);
  };

  const handleSubmit = async () => {
    if (!file || selectedPlan === null) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // 1. Subir comprobante
      const paymentProofUrl = await MembershipService.uploadPaymentProof(file);
      // 2. Crear membresía
      const planType = ['BASIC', 'STANDARD', 'PREMIUM'][selectedPlan] as 'BASIC' | 'STANDARD' | 'PREMIUM';
      await MembershipService.createMembership(planType, paymentProofUrl);
      setSuccess('¡Comprobante enviado y membresía registrada! Un administrador revisará tu pago.');
      setShowModal(false);
      setFile(null);
      setShowConfirmation(true);
    } catch (err: any) {
      setError(err.message || 'Error al enviar el comprobante.');
    } finally {
      setLoading(false);
    }
  };

  const getPlanColors = (idx: number) => {
    switch (idx) {
      case 0: // BASIC
        return {
          border: 'border-blue-500',
          badge: 'bg-blue-500 text-white',
          accent: 'text-blue-300'
        };
      case 1: // STANDARD
        return {
          border: 'border-purple-500',
          badge: 'bg-purple-500 text-white',
          accent: 'text-purple-300'
        };
      case 2: // PREMIUM
        return {
          border: 'border-yellow-500',
          badge: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black',
          accent: 'text-yellow-300'
        };
      default:
        return {
          border: 'border-gray-500',
          badge: 'bg-gray-500 text-white',
          accent: 'text-gray-300'
        };
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#a91d3a] to-[#4a0c2e] py-10 px-4">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 text-center">
        Conviértete en tutor y guía el éxito académico de otros.
      </h1>
      <p className="text-white text-lg mb-10 text-center max-w-2xl">
        Ofrece tu conocimiento y ayuda a otros a alcanzar el éxito académico, ¡comienza a ofrecer tus tutorías hoy!
      </p>

      <div className="flex flex-col lg:flex-row gap-6 justify-center items-stretch w-full max-w-6xl">
        {plans.map((plan, idx) => {
          const colors = getPlanColors(idx);
          const isPopular = idx === 1; // STANDARD plan como popular

          return (
            <div
              key={plan.name}
              className={`bg-[#2d010e] rounded-2xl flex flex-col justify-between p-6 w-full lg:w-80 shadow-xl border-2 ${colors.border} relative transform transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                    🔥 Más Popular
                  </span>
                </div>
              )}

              {/* Plan Name */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">{plan.name}</h2>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${colors.badge}`}>
                  {idx === 0 ? 'Básico' : idx === 1 ? 'Estándar' : 'Premium'}
                </div>
              </div>

              {/* Price */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-4xl font-bold text-white">S/</span>
                  <span className="text-5xl font-bold text-white ml-1">{plan.numericPrice}</span>
                </div>
                <p className="text-gray-300 text-sm">Único Pago</p>
              </div>

              {/* Features */}
              <div className="flex-grow">
                <ul className="text-white text-sm space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <span className={`text-lg mr-3 ${colors.accent} flex-shrink-0`}>✓</span>
                      <span className="leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <button
                className={`w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${isPopular ? 'ring-2 ring-purple-400 ring-opacity-50' : ''
                  }`}
                onClick={() => handleBuy(idx)}
              >
                <span className="text-lg">Elegir Plan {idx === 0 ? 'Básico' : idx === 1 ? 'Estándar' : 'Premium'}</span>
                <div className="text-sm opacity-90 mt-1">Comenzar ahora</div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Value Proposition */}
      <div className="mt-12 text-center max-w-4xl">
        <p className="text-white/80 text-lg mb-4">
          🎓 Únete a cientos de tutores que ya están generando ingresos compartiendo su conocimiento
        </p>
        <div className="flex flex-wrap justify-center gap-8 text-white/70">
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Sin comisiones ocultas</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Activación inmediata</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Soporte 24/7</span>
          </div>
        </div>
      </div>

      {/* Modal para pago y comprobante */}
      {showModal && selectedPlan !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-dark rounded-2xl w-full max-w-2xl relative shadow-2xl border border-white/20 h-fit">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/20">
              <div>
                <h3 className="text-xl font-bold text-white">Completar Pago</h3>
                <p className="text-sm text-gray-300">Finaliza tu suscripción en pocos pasos</p>
              </div>
              <button
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
                onClick={handleClose}
                aria-label="Cerrar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 pt-4 pb-0">
              <div className="bg-yellow-900/20 border border-yellow-600/40 rounded-lg p-3 mb-4 text-yellow-200 text-sm text-center">
                <strong>TutorMatch</strong> <span className="font-bold text-red-400">NO gestiona los pagos de manera interna.</span> Realiza tu pago solo a través de los métodos y cuentas oficiales mostrados aquí. No uses intermediarios ni terceros para realizar tu pago.              
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Plan & Payment Method */}
                <div className="space-y-6">
                  {/* Plan Summary */}
                  <div className="bg-gradient-to-r from-red-900/30 to-red-800/30 rounded-xl p-4 border border-red-700/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-white">{plans[selectedPlan].name}</h4>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-red-300">{plans[selectedPlan].price}</div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div>
                    <h4 className="font-semibold text-white mb-4 flex items-center">
                      <span className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
                      Método de pago
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${tab === 'yape'
                          ? 'border-red-500 bg-red-900/30 shadow-lg'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                          }`}
                        onClick={() => setTab('yape')}
                      >
                        {tab === 'yape' && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        <div className="text-center">
                          <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mx-auto mb-2 border border-purple-500/30">
                            <img src={qrImages.yapeIcon} alt="Yape" className="w-8 h-8 object-contain" />
                          </div>
                          <div className="font-medium text-white">Yape</div>
                        </div>
                      </button>

                      <button
                        className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${tab === 'plin'
                          ? 'border-red-500 bg-red-900/30 shadow-lg'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                          }`}
                        onClick={() => setTab('plin')}
                      >
                        {tab === 'plin' && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        <div className="text-center">
                          <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mx-auto mb-2 border border-blue-500/30">
                            <img src={qrImages.plinIcon} alt="Plin" className="w-8 h-8 object-contain" />
                          </div>
                          <div className="font-medium text-white">Plin</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Upload Section */}
                  <div>
                    <h4 className="font-semibold text-white mb-4 flex items-center">
                      <span className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
                      Comprobante de pago
                    </h4>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        id="file-upload"
                        onChange={e => setFile(e.target.files?.[0] || null)}
                      />
                      <label
                        htmlFor="file-upload"
                        className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all ${file
                          ? 'border-green-500 bg-green-900/20'
                          : 'border-white/30 bg-white/5 hover:bg-white/10'
                          }`}
                      >
                        {file ? (
                          <div className="text-center">
                            <svg className="w-6 h-6 text-green-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm font-medium text-green-400">{file.name}</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <svg className="w-6 h-6 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-sm font-medium text-gray-300">Subir archivo</p>
                            <p className="text-xs text-gray-500">JPG, PNG, PDF</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right Column - QR Code */}
                <div className="flex flex-col justify-center">
                  <div>
                    <h4 className="font-semibold text-white mb-4 flex items-center">
                      <span className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                      Escanea y paga
                    </h4>
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                      <div className="text-center">
                        <div className="inline-block bg-white p-4 rounded-2xl shadow-lg mb-4">
                          <img
                            src={qrImages[tab]}
                            alt={`QR ${tab}`}
                            className="w-48 h-48 object-contain"
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="font-medium text-white">
                            📱 Abre {tab === 'yape' ? 'Yape' : 'Plin'}
                          </p>
                          <p className="text-sm text-gray-300">
                            Escanea el QR y paga exactamente
                          </p>
                          <p className="text-sm text-gray-300">
                            Nombre: {tab === 'yape' ? 'Rodrigo A. Lopez H.' : 'Rodrigo Lopez'}
                          </p>
                          <div className="inline-block bg-red-600 text-white px-4 py-2 rounded-lg font-bold">
                            {plans[selectedPlan].price}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="mt-6 bg-red-900/30 border border-red-700 p-4 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.882 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-red-300">Error al procesar</h4>
                      <p className="text-sm text-red-200 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {success && (
                <div className="mt-6 bg-green-900/30 border border-green-700 p-4 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-green-300">¡Éxito!</h4>
                      <p className="text-sm text-green-200 mt-1">{success}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer ÚNICO */}
            <div className="border-t border-white/20 p-6">
              <button
                className={`w-full py-3 px-6 rounded-xl font-bold text-white transition-all duration-300 ${!file || loading
                  ? 'bg-gray-600 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                  }`}
                disabled={!file || loading}
                onClick={handleSubmit}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando pago...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Confirmar y Enviar Comprobante
                  </div>
                )}
              </button>
              <p className="text-xs text-center text-gray-400 mt-3">
                🔒 Tu información está segura y protegida
              </p>
            </div>
          </div>
        </div>
      )}

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-dark rounded-2xl p-6 sm:p-8 w-full max-w-md relative shadow-xl border border-gray-700">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl"><Check /></span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-[#a91d3a]">¡Comprobante enviado!</h3>
              <p className="text-white text-center mb-6 leading-relaxed">
                Tu comprobante fue enviado correctamente y está en revisión.
                <br />
                <span className="text-gray-300">Recibirás una notificación cuando tu membresía sea activada.</span>
              </p>
              <button
                className="bg-[#a91d3a] hover:bg-[#7a142a] text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg hover:shadow-xl"
                onClick={() => {
                  setShowConfirmation(false);
                  navigate('/membership/waiting');
                }}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}