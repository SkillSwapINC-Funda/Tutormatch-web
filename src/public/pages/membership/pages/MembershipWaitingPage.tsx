import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../lib/supabase/client';
import { Clock, CheckCircle, Bell, RefreshCw, XCircle } from 'lucide-react';


export default function MembershipWaitingPage() {
  const navigate = useNavigate();
  const [dots, setDots] = useState('');
  const [showRejectedModal, setShowRejectedModal] = useState(false);
  const [showApprovedModal, setShowApprovedModal] = useState(false);
  const [polling, setPolling] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Animación de puntos suspensivos
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Polling para verificar el estado de la membresía
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let isMounted = true;
    async function checkMembershipStatus() {
      // Obtener el usuario actual
      const userId = localStorage.getItem('currentUserId');
      const { data: memberships, error } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);
      if (error || !memberships || memberships.length === 0) return;
      const membership = memberships[0];
      if (!isMounted) return;
      if (membership.status === 'active') {
        setPolling(false);
        setShowApprovedModal(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          navigate('/dashboard');
        }, 3500);
      } else if (membership.status === 'rejected') {
        setPolling(false);
        setShowRejectedModal(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          navigate('/membership/plans');
        }, 3500);
      }
    }
    if (polling && !showApprovedModal && !showRejectedModal) {
      interval = setInterval(checkMembershipStatus, 2000);
      checkMembershipStatus(); // Primer chequeo inmediato
    }
    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [navigate, polling, showApprovedModal, showRejectedModal]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#a91d3a] to-[#4a0c2e] py-8 px-4 relative overflow-hidden">
      {/* Modal de aprobado */}
      {showApprovedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-dark rounded-2xl p-8 max-w-sm w-full border border-emerald-700 shadow-xl text-center">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">¡Membresía aprobada!</h2>
            <p className="text-emerald-200 mb-4">Tu comprobante ha sido aprobado.<br />Ya puedes acceder a la plataforma.</p>
            <p className="text-gray-300 text-sm mb-2">Serás redirigido automáticamente al panel.</p>
            <button
              className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium"
              onClick={() => {
                setShowApprovedModal(false);
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                navigate('/dashboard');
              }}
            >
              Ir al panel
            </button>
          </div>
        </div>
      )}
      {/* Modal de rechazo */}
      {showRejectedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-dark rounded-2xl p-8 max-w-sm w-full border border-red-700 shadow-xl text-center">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Pago rechazado</h2>
            <p className="text-red-200 mb-4">Tu comprobante ha sido rechazado.<br />Se procederá a la devolución del monto que has cancelado.</p>
            <p className="text-gray-300 text-sm mb-2">Puedes volver a intentar el pago desde la página de membresías.</p>
            <button
              className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
              onClick={() => {
                setShowRejectedModal(false);
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                navigate('/membership/plans');
              }}
            >
              Ir a membresías
            </button>
          </div>
        </div>
      )}
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Circles */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/5 rounded-full animate-float-slow"></div>
        <div className="absolute top-1/4 right-16 w-32 h-32 bg-red-400/10 rounded-full animate-float-medium"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-white/3 rounded-full animate-float-fast"></div>
        <div className="absolute top-1/2 left-1/6 w-24 h-24 bg-red-300/8 rounded-full animate-float-slow delay-1000"></div>
        <div className="absolute bottom-1/3 right-10 w-28 h-28 bg-white/4 rounded-full animate-float-medium delay-2000"></div>
        
        {/* Gradient Blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-red-500/20 to-transparent rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-red-400/15 to-transparent rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-red-600/15 to-transparent rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        
        {/* Moving Lines */}
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent animate-slide-right"></div>
        <div className="absolute bottom-1/3 right-0 w-full h-px bg-gradient-to-l from-transparent via-red-300/20 to-transparent animate-slide-left"></div>
        
        {/* Particle System */}
        <div className="absolute top-1/3 left-1/5 w-1 h-1 bg-red-400 rounded-full animate-twinkle"></div>
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-white rounded-full animate-twinkle animation-delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-red-300 rounded-full animate-twinkle animation-delay-2000"></div>
        <div className="absolute top-20 right-1/3 w-1 h-1 bg-white/80 rounded-full animate-twinkle animation-delay-3000"></div>
        <div className="absolute bottom-20 right-1/5 w-1 h-1 bg-red-400 rounded-full animate-twinkle animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Main Card */}
        <div className="bg-dark rounded-3xl p-8 shadow-2xl border border-white/10 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 right-4 w-32 h-32 border border-white/20 rounded-full"></div>
            <div className="absolute bottom-4 left-4 w-24 h-24 border border-white/20 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-white/10 rounded-full"></div>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Status Icon */}
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
                <Clock className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold mb-3 text-white">
              ¡Solicitud Enviada!
            </h2>
            
            {/* Subtitle with animated dots */}
            <p className="text-red-200 text-lg mb-6 font-medium">
              Procesando tu membresía{dots}
            </p>

            {/* Status Steps */}
            <div className="w-full mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-2">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs text-green-300 font-medium">Enviado</span>
                </div>
                
                <div className="flex-1 h-0.5 mx-2 bg-amber-500 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-amber-500 animate-pulse"></div>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center mb-2 animate-pulse">
                    <RefreshCw className="w-4 h-4 text-white animate-spin" />
                  </div>
                  <span className="text-xs text-amber-300 font-medium">Revisión</span>
                </div>
                
                <div className="flex-1 h-0.5 mx-2 bg-gray-600"></div>
                
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mb-2">
                    <CheckCircle className="w-5 h-5 text-gray-400" />
                  </div>
                  <span className="text-xs text-gray-400 font-medium">Aprobado</span>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="w-full bg-white/5 rounded-2xl p-6 mb-6 border border-white/10">
              <div className="flex items-start space-x-3">
                <Bell className="w-6 h-6 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <h4 className="font-semibold text-white mb-2">¿Qué sigue ahora?</h4>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-3"></div>
                      Nuestro equipo revisará tu comprobante de pago
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-3"></div>
                      Te notificaremos vía email cuando sea aprobado
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-3"></div>
                      Tiempo estimado: 1-2 horas hábiles
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Expected Time */}
            <div className="bg-gradient-to-r from-red-900/30 to-red-800/30 rounded-xl p-4 mb-6 border border-red-700/50 w-full">
              <div className="flex items-center justify-center space-x-2">
                <Clock className="w-5 h-5 text-red-300" />
                <span className="text-red-200 font-medium">Tiempo estimado: 1-2 horas</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 border border-white/20 hover:border-white/30"
                onClick={() => navigate('/login')}
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}