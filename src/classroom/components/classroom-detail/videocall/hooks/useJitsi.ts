import { useEffect, useRef, useState } from 'react';
import { AuthService } from '../../../../../public/services/authService';

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export interface JitsiConfig {
  roomName: string;
  domain?: string;
  userDisplayName?: string;
  userEmail?: string;
}

export interface JitsiCallbacks {
  onJoined?: (event: any) => void;
  onLeft?: (event: any) => void;
  onParticipantJoined?: (event: any) => void;
  onParticipantLeft?: (event: any) => void;
  onError?: (error: any) => void;
}

export const useJitsi = (containerId: string) => {
  const jitsiApiRef = useRef<any>(null);
  const [isJitsiLoaded, setIsJitsiLoaded] = useState(false);
  const [hasJoinedSuccessfully, setHasJoinedSuccessfully] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Cargar el script de Jitsi si no está cargado
    if (!window.JitsiMeetExternalAPI) {
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.onload = () => setIsJitsiLoaded(true);
      script.onerror = () => console.error('Error cargando Jitsi Meet API');
      document.head.appendChild(script);
    } else {
      setIsJitsiLoaded(true);
    }

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, []);

  const initializeJitsi = async (config: JitsiConfig, callbacks?: JitsiCallbacks) => {
    if (!isJitsiLoaded || !window.JitsiMeetExternalAPI) {
      throw new Error('Jitsi Meet API no está disponible');
    }

    setIsConnecting(true);

    try {
      const container = document.getElementById(containerId);
      if (!container) {
        throw new Error(`Contenedor ${containerId} no encontrado`);
      }

      // Limpiar contenedor
      container.innerHTML = '';

      // Obtener información del usuario
      const userProfile = await AuthService.getCurrentUserProfile();
      
      const jitsiOptions = {
        roomName: config.roomName,
        width: '100%',
        height: '100%',
        parentNode: container,
        configOverwrite: {
          prejoinPageEnabled: false,
          enableWelcomePage: false,
          enableClosePage: false,
          disableInitialGUM: false,
          autoJoinDisabled: false,
          startWithAudioMuted: true,
          startWithVideoMuted: true,
          disableModeratorIndicator: false,
          startScreenSharing: false,
          enableEmailInStats: false,
          startAudioOnly: false,
          resolution: 720,
          constraints: {
            video: {
              aspectRatio: 16 / 9,
              height: {
                ideal: 720,
                max: 1080,
                min: 240
              }
            }
          },
          p2p: {
            enabled: true,
            preferH264: true
          },
          disableThirdPartyRequests: false,
          enableNoAudioDetection: true,
          enableNoisyMicDetection: true,
          enableLipSync: true
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop',
            'chat', 'raisehand', 'videoquality', 'filmstrip',
            'feedback', 'stats', 'shortcuts', 'tileview',
            'videobackgroundblur', 'help'
          ],
          SETTINGS_SECTIONS: ['devices', 'language', 'profile'],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          SHOW_POWERED_BY: false,
          SHOW_PROMOTIONAL_CLOSE_PAGE: false,
          LANG_DETECTION: true,
          CONNECTION_INDICATOR_DISABLED: false,
          VIDEO_QUALITY_LABEL_DISABLED: false,
          RECENT_LIST_ENABLED: false,
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
          MOBILE_APP_PROMO: false,
          ENFORCE_NOTIFICATION_AUTO_DISMISS_TIMEOUT: 5000,
          APP_NAME: 'TutorMatch',
          NATIVE_APP_NAME: 'TutorMatch',
          DEFAULT_BACKGROUND: '#007bff'
        },
        userInfo: {
          displayName: config.userDisplayName || `${userProfile?.firstName} ${userProfile?.lastName}`
        }
      };

      jitsiApiRef.current = new window.JitsiMeetExternalAPI(
        config.domain || 'meet.jit.si',
        jitsiOptions
      );

      // Event listeners adicionales del HTML
      jitsiApiRef.current.addEventListener('audioMuteStatusChanged', (event: any) => {
        console.log('🎤 Estado audio:', event.muted ? 'Silenciado' : 'Activado');
      });

      jitsiApiRef.current.addEventListener('videoMuteStatusChanged', (event: any) => {
        console.log('📹 Estado video:', event.muted ? 'Desactivado' : 'Activado');
      });

      jitsiApiRef.current.addEventListener('deviceListChanged', (event: any) => {
        console.log('📱 Lista de dispositivos cambió:', event);
      });

      jitsiApiRef.current.addEventListener('cameraReady', () => {
        console.log('📹 Cámara lista');
      });

      jitsiApiRef.current.addEventListener('micReady', () => {
        console.log('🎤 Micrófono listo');
      });

      jitsiApiRef.current.addEventListener('videoConferenceJoined', (event: any) => {
        console.log('✅ Te uniste exitosamente a la videollamada:', event);
        setHasJoinedSuccessfully(true);
        setIsConnecting(false);
        callbacks?.onJoined?.(event);
      });

      jitsiApiRef.current.addEventListener('videoConferenceLeft', (event: any) => {
        console.log('👋 Evento: Saliste de la videollamada', event);
        setHasJoinedSuccessfully(false);
        setIsConnecting(false);
        callbacks?.onLeft?.(event);
      });

      jitsiApiRef.current.addEventListener('participantJoined', (event: any) => {
        console.log('👥 Nuevo participante se unió:', event);
        callbacks?.onParticipantJoined?.(event);
      });

      jitsiApiRef.current.addEventListener('participantLeft', (event: any) => {
        console.log('👋 Participante salió:', event);
        callbacks?.onParticipantLeft?.(event);
      });

      jitsiApiRef.current.addEventListener('readyToClose', () => {
        console.log('🔄 Jitsi listo para cerrar');
        if (hasJoinedSuccessfully) {
          callbacks?.onLeft?.({});
        }
      });

      jitsiApiRef.current.addEventListener('cameraError', (error: any) => {
        console.error('❌ Error de cámara:', error);
        callbacks?.onError?.(error);
      });

      jitsiApiRef.current.addEventListener('micError', (error: any) => {
        console.error('❌ Error de micrófono:', error);
        callbacks?.onError?.(error);
      });

    } catch (error) {
      console.error('❌ Error configurando Jitsi:', error);
      setIsConnecting(false);
      throw error;
    }
  };

  const toggleAudio = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('toggleAudio');
    }
  };

  const toggleVideo = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('toggleVideo');
    }
  };

  const hangUp = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('hangup');
    }
  };

  const dispose = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.dispose();
      jitsiApiRef.current = null;
      setHasJoinedSuccessfully(false);
      setIsConnecting(false);
    }
  };

  return {
    isJitsiLoaded,
    hasJoinedSuccessfully,
    isConnecting,
    initializeJitsi,
    toggleAudio,
    toggleVideo,
    hangUp,
    dispose,
    jitsiApi: jitsiApiRef.current
  };
};