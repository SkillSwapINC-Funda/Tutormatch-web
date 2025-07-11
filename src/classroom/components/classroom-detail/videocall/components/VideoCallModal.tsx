import React, { useEffect, useState } from 'react';
import VideoCallService, { VideoCall } from '../services/VideoCallService';
import { toast } from 'react-toastify';
import { X, Mic, MicOff, Video, VideoOff, Phone, Copy } from 'lucide-react';
import { AuthService } from '../../../../../public/services/authService'; 

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId?: string;
  callId?: string;
  tutoringSessionId?: string;
}

const VideoCallModal: React.FC<VideoCallModalProps> = ({ 
  isOpen, 
  onClose, 
  roomId, 
  callId: propCallId, 
  tutoringSessionId 
}) => {
  const [videoCall, setVideoCall] = useState<VideoCall | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInCall, setIsInCall] = useState(false);
  const [hasJoinedSuccessfully, setHasJoinedSuccessfully] = useState(false);
  const [audioMuted, setAudioMuted] = useState(true);
  const [videoMuted, setVideoMuted] = useState(true);
  const [isJitsiLoaded, setIsJitsiLoaded] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [jitsiApi, setJitsiApi] = useState<any>(null);
  
  const shouldCreateCall = !propCallId || propCallId === 'solo' || propCallId === 'undefined';

  // Cargar Jitsi API
  useEffect(() => {
    if (!window.JitsiMeetExternalAPI) {
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.onload = () => setIsJitsiLoaded(true);
      script.onerror = () => {
        console.error('Error cargando Jitsi Meet API');
        setError('Error cargando la API de videollamadas');
      };
      document.head.appendChild(script);
    } else {
      setIsJitsiLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isOpen && isJitsiLoaded) {
      if (shouldCreateCall || roomId) {
        createVideoCall();
      } else if (propCallId) {
        loadAndJoinVideoCall();
      }
    }
    
    return () => {
      if (videoCall && hasJoinedSuccessfully) {
        handleLeaveCall(true);
      }
      disposeJitsi();
    };
  }, [isOpen, isJitsiLoaded, propCallId, roomId, shouldCreateCall]);

  const createVideoCall = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substr(2, 9);
      const jitsiRoomName = roomId 
        ? `tutormatch-room-${roomId}-${timestamp}`
        : `tutormatch-solo-${timestamp}-${randomId}`;
      
      console.log('🎥 Creando nueva videollamada:', jitsiRoomName);
      
      const newCall = await VideoCallService.createVideoCall({
        jitsiRoomName,
        roomId: roomId || undefined,
        tutoringSessionId: tutoringSessionId || undefined
      });
      
      setVideoCall(newCall);
      console.log('✅ Videollamada creada:', newCall);
      
      // Directamente inicializar Jitsi
      await initializeJitsiDirectly(newCall);
    } catch (error: any) {
      console.error('❌ Error creando videollamada:', error);
      setError(error.response?.data?.message || error.message || 'Error creando la videollamada');
    } finally {
      setLoading(false);
    }
  };

  const loadAndJoinVideoCall = async () => {
    if (!propCallId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Cargando videollamada:', propCallId);
      const call = await VideoCallService.getVideoCallDetails(propCallId);
      setVideoCall(call);
      
      if (call.status === 'active' || call.status === 'scheduled') {
        // Intentar unirse al backend, pero si falla por "ya participante", continuar
        try {
          await VideoCallService.joinVideoCall({ callId: call.id });
          console.log('✅ Unido al backend exitosamente');
        } catch (joinError: any) {
          if (joinError.response?.status === 400 && 
              joinError.response?.data?.message?.includes('participante')) {
            console.log('⚠️ Ya eres participante, continuando con Jitsi...');
          } else {
            throw joinError;
          }
        }
        
        await initializeJitsiDirectly(call);
      } else {
        setError('La videollamada ha finalizado');
      }
    } catch (error: any) {
      console.error('❌ Error cargando videollamada:', error);
      setError(error.response?.data?.message || error.message || 'Error cargando la videollamada');
    } finally {
      setLoading(false);
    }
  };

  const initializeJitsiDirectly = async (call: VideoCall) => {
    if (!window.JitsiMeetExternalAPI) {
      setError('Jitsi Meet API no está disponible');
      return;
    }

    try {
      setIsConnecting(true);
      console.log('🔄 Inicializando Jitsi:', call.jitsiRoomName);
      
      const container = document.getElementById('jitsi-modal-container');
      if (!container) {
        throw new Error('Contenedor de Jitsi no encontrado');
      }

      // Limpiar contenedor
      container.innerHTML = '';

      // Obtener información del usuario
      const userProfile = await AuthService.getCurrentUserProfile();
      
      // Configuración mejorada basada en el HTML de prueba
      const jitsiOptions = {
        roomName: call.jitsiRoomName,
        width: '100%',
        height: '100%',
        parentNode: container,
        configOverwrite: {
          // Configuraciones clave para auto-join directo
          prejoinPageEnabled: false,        // No mostrar página de pre-unión
          enableWelcomePage: false,         // No mostrar página de bienvenida
          enableClosePage: false,           // No mostrar página de cierre
          disableInitialGUM: false,         // Permitir acceso a cámara/micrófono
          autoJoinDisabled: false,          // Habilitar auto-join
          
          // Configuración de medios - Empezar silenciado para evitar problemas
          startWithAudioMuted: true,        // Audio silenciado inicialmente
          startWithVideoMuted: true,        // Video desactivado inicialmente
          disableModeratorIndicator: false,
          startScreenSharing: false,
          enableEmailInStats: false,
          startAudioOnly: false,
          
          // Configuración de calidad
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
          
          // Configuración de red
          p2p: {
            enabled: true,
            preferH264: true
          },
          
          // Configuración adicional para mejor UX
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
          
          // Branding
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          SHOW_POWERED_BY: false,
          SHOW_PROMOTIONAL_CLOSE_PAGE: false,
          
          // UX mejorado
          LANG_DETECTION: true,
          CONNECTION_INDICATOR_DISABLED: false,
          VIDEO_QUALITY_LABEL_DISABLED: false,
          RECENT_LIST_ENABLED: false,
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
          MOBILE_APP_PROMO: false,
          ENFORCE_NOTIFICATION_AUTO_DISMISS_TIMEOUT: 5000,
          
          // Configuración adicional
          APP_NAME: 'TutorMatch',
          NATIVE_APP_NAME: 'TutorMatch',
          DEFAULT_BACKGROUND: '#007bff'
        },
        userInfo: {
          displayName: `${userProfile?.firstName} ${userProfile?.lastName}` || 'Usuario TutorMatch',
          email: `${userProfile?.id}@tutormatch.com`
        }
      };

      const api = new window.JitsiMeetExternalAPI('meet.jit.si', jitsiOptions);
      setJitsiApi(api);

      // Event listeners mejorados basados en el HTML de prueba
      api.addEventListener('videoConferenceJoined', (event: any) => {
        console.log('✅ Te uniste exitosamente a la videollamada:', event);
        setHasJoinedSuccessfully(true);
        setIsInCall(true);
        setIsConnecting(false);
        toast.success('🎥 ¡Estás en la videollamada!');
      });

      api.addEventListener('videoConferenceLeft', (event: any) => {
        console.log('👋 Evento: Saliste de la videollamada', event);
        // Solo salir si fue por acción del usuario (no por permisos de cámara/mic)
        if (hasJoinedSuccessfully) {
          handleLeaveCall(true);
        } else {
          console.log('🔄 Ignorando salida automática - el usuario no se había unido completamente');
        }
      });

      api.addEventListener('participantJoined', (event: any) => {
        console.log('👥 Nuevo participante se unió:', event);
        toast.info(`👥 ${event.displayName || 'Alguien'} se unió`);
      });

      api.addEventListener('participantLeft', (event: any) => {
        console.log('👋 Participante salió:', event);
        toast.info(`👋 ${event.displayName || 'Alguien'} salió`);
      });

      api.addEventListener('readyToClose', () => {
        console.log('🔄 Jitsi listo para cerrar');
        if (hasJoinedSuccessfully) {
          handleLeaveCall(true);
        }
      });

      // Event listeners adicionales para mejor debugging
      api.addEventListener('cameraError', (error: any) => {
        console.error('❌ Error de cámara:', error);
        toast.error('⚠️ Error de cámara. Revisa permisos.');
      });

      api.addEventListener('micError', (error: any) => {
        console.error('❌ Error de micrófono:', error);
        toast.error('⚠️ Error de micrófono. Revisa permisos.');
      });

      api.addEventListener('audioMuteStatusChanged', (event: any) => {
        console.log('🎤 Estado audio:', event.muted ? 'Silenciado' : 'Activado');
        setAudioMuted(event.muted);
      });

      api.addEventListener('videoMuteStatusChanged', (event: any) => {
        console.log('📹 Estado video:', event.muted ? 'Desactivado' : 'Activado');
        setVideoMuted(event.muted);
      });

      // Eventos adicionales para debugging de permisos
      api.addEventListener('deviceListChanged', (event: any) => {
        console.log('📱 Lista de dispositivos cambió:', event);
      });

      api.addEventListener('cameraReady', () => {
        console.log('📹 Cámara lista');
      });

      api.addEventListener('micReady', () => {
        console.log('🎤 Micrófono listo');
      });

    } catch (error: any) {
      console.error('❌ Error inicializando Jitsi:', error);
      setError('Error inicializando la videollamada');
      setIsConnecting(false);
    }
  };

  const handleLeaveCall = async (isAutomatic = false) => {
    if (!videoCall) return;
    
    try {
      if (!isAutomatic) {
        console.log('🔄 Saliendo de videollamada...');
      }
      
      // Solo llamar al backend si realmente se había unido
      if (hasJoinedSuccessfully) {
        try {
          await VideoCallService.leaveVideoCall(videoCall.id);
        } catch (error) {
          console.warn('Error saliendo del backend, pero continuando:', error);
        }
      }
      
      setIsInCall(false);
      setHasJoinedSuccessfully(false);
      disposeJitsi();
      
      if (!isAutomatic) {
        toast.success('👋 Has salido de la videollamada');
        onClose();
      }
    } catch (error: any) {
      console.error('❌ Error saliendo de videollamada:', error);
      if (!isAutomatic) {
        toast.error('Error saliendo de la videollamada');
      }
    }
  };

  const handleEndCall = async () => {
    if (!videoCall) return;
    
    try {
      console.log('🔄 Finalizando videollamada...');
      
      await VideoCallService.endVideoCall({
        callId: videoCall.id
      });
      
      setIsInCall(false);
      setHasJoinedSuccessfully(false);
      disposeJitsi();
      toast.success('📞 Videollamada finalizada');
      onClose();
    } catch (error: any) {
      console.error('❌ Error finalizando videollamada:', error);
      toast.error('Error finalizando la videollamada');
    }
  };

  const copyCallId = async () => {
    if (!videoCall?.id) return;
    
    try {
      await navigator.clipboard.writeText(videoCall.id);
      toast.success(`📋 ID copiado: ${videoCall.id}`);
    } catch (error) {
      toast.error('No se pudo copiar al portapapeles');
    }
  };

  const handleToggleAudio = () => {
    if (jitsiApi) {
      jitsiApi.executeCommand('toggleAudio');
    }
  };

  const handleToggleVideo = () => {
    if (jitsiApi) {
      jitsiApi.executeCommand('toggleVideo');
    }
  };

  const disposeJitsi = () => {
    if (jitsiApi) {
      try {
        jitsiApi.dispose();
      } catch (error) {
        console.warn('Error disposing Jitsi API:', error);
      }
      setJitsiApi(null);
    }
    setIsConnecting(false);
    setIsInCall(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 text-white p-4 rounded-t-lg flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold">Videollamada - TutorMatch</h2>
            {videoCall && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                videoCall.status === 'active' ? 'bg-green-500' :
                videoCall.status === 'scheduled' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}>
                {videoCall.status === 'active' ? 'Activa' :
                 videoCall.status === 'scheduled' ? 'Programada' : 'Finalizada'}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {videoCall && (
              <button
                onClick={copyCallId}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
              >
                <Copy size={14} />
                <span>Copiar ID</span>
              </button>
            )}
            
            <button
              onClick={onClose}
              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-gray-900 relative">
          {loading && (
            <div className="flex items-center justify-center h-full text-white">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p>Cargando videollamada...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center h-full text-white">
              <div className="text-center">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold mb-2">Error</h3>
                <p className="text-gray-300 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}
          
          {!loading && !error && (
            <div 
              id="jitsi-modal-container" 
              className="w-full h-full"
              style={{ minHeight: '400px' }}
            >
              {!isInCall && !isConnecting && (
                <div className="flex items-center justify-center h-full text-white text-lg">
                  {videoCall ? 
                    'Conectando a la videollamada...' : 
                    'Preparando videollamada...'
                  }
                </div>
              )}
              {isConnecting && (
                <div className="flex items-center justify-center h-full text-white">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Conectando a la videollamada...</p>
                    <p className="text-sm text-gray-300 mt-2">
                      Permite el acceso a cámara y micrófono
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        {isInCall && (
          <div className="bg-gray-800 p-4 rounded-b-lg flex justify-center space-x-4">
            <button
              onClick={handleToggleAudio}
              className={`p-3 rounded-full ${
                audioMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              {audioMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            
            <button
              onClick={handleToggleVideo}
              className={`p-3 rounded-full ${
                videoMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              {videoMuted ? <VideoOff size={20} /> : <Video size={20} />}
            </button>
            
            <button
              onClick={() => handleLeaveCall(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
            >
              Salir
            </button>
            
            <button
              onClick={handleEndCall}
              className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full"
            >
              <Phone size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCallModal;