import { useState, useEffect } from 'react';
import VideoCallService, { VideoCall } from '../components/classroom-detail/videocall/services/VideoCallService';
import { AuthService } from '../../public/services/authService';

interface VideoCallStatus {
  hasActiveCall: boolean;
  activeCall: VideoCall | null;
  loading: boolean;
  error: string | null;
}

export const useVideoCallStatus = (tutoringSessionId?: string): VideoCallStatus => {
  const [status, setStatus] = useState<VideoCallStatus>({
    hasActiveCall: false,
    activeCall: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!tutoringSessionId || tutoringSessionId === 'undefined') {
      setStatus({
        hasActiveCall: false,
        activeCall: null,
        loading: false,
        error: null
      });
      return;
    }

    const checkActiveCall = async () => {
      try {
        // ✅ NUEVA VERIFICACIÓN: Esperar hasta que el token esté disponible
        const token = localStorage.getItem('auth_token');
        const currentUserId = AuthService.getCurrentUserId();
        
        if (!token || !currentUserId) {
          console.log('🔄 Esperando autenticación...');
          // Si no hay token, reintentamos en 1 segundo
          setTimeout(checkActiveCall, 1000);
          return;
        }
        
        setStatus(prev => ({ ...prev, loading: true, error: null }));
        
        // Buscar videollamadas activas
        const activeCalls = await VideoCallService.getActiveVideoCalls();
        
        // Buscar por patrón de nombre de sala
        const expectedRoomName = `tutoring-session-${tutoringSessionId}`;
        const matchingCall = activeCalls.find(call => 
          call.jitsiRoomName === expectedRoomName && 
          call.status === 'active'
        );
        
        setStatus({
          hasActiveCall: !!matchingCall,
          activeCall: matchingCall || null,
          loading: false,
          error: null
        });
      } catch (error: any) {
        console.error('Error verificando estado de videollamada:', error);
        setStatus({
          hasActiveCall: false,
          activeCall: null,
          loading: false,
          error: error.message
        });
      }
    };

    // ✅ RETRASO INICIAL: Esperar 500ms antes de la primera verificación
    const initialTimeout = setTimeout(checkActiveCall, 500);
    
    // Verificar cada 30 segundos
    const interval = setInterval(checkActiveCall, 30000);
    
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [tutoringSessionId]);

  return status;
};