import React, { useEffect, useState } from 'react';
import VideoCallService, { VideoCall } from '../services/VideoCallService';
import { toast } from 'react-toastify';
import { X, Copy } from 'lucide-react';
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
  const [isJitsiLoaded, setIsJitsiLoaded] = useState(false);
  const [jitsiApi, setJitsiApi] = useState<any>(null);
  const [hasJoinedSuccessfully, setHasJoinedSuccessfully] = useState(false);
  
  const shouldCreateCall = !propCallId || propCallId === 'solo' || propCallId === 'undefined';

  // Cargar Jitsi API
  useEffect(() => {
    if (!window.JitsiMeetExternalAPI) {
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.onload = () => setIsJitsiLoaded(true);
      script.onerror = () => {
        console.error('Error cargando Jitsi Meet API');
        toast.error('Error cargando la API de videollamadas');
      };
      document.head.appendChild(script);
    } else {
      setIsJitsiLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isOpen && isJitsiLoaded) {
      if (shouldCreateCall || roomId || tutoringSessionId) {
        // Directamente crear videollamada sin buscar existentes
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
  }, [isOpen, isJitsiLoaded, propCallId, roomId, shouldCreateCall, tutoringSessionId]);

  // Remover checkExistingVideoCallOrCreate() ya que los endpoints no existen

  const createVideoCall = async () => {
    try {
      // Verificar autenticación
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
        return;
      }
      
      // Usar patrón predecible basado en tutoringSessionId
      let jitsiRoomName: string;
      if (tutoringSessionId && tutoringSessionId !== 'undefined') {
        jitsiRoomName = `tutoring-session-${tutoringSessionId}`;
        console.log('🎥 Usando sala predecible para sesión:', jitsiRoomName);
      } else {
        // Fallback para casos sin tutoringSessionId
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substr(2, 9);
        jitsiRoomName = `tutoring-${timestamp}-${randomId}`;
        console.log('🎥 Creando sala única:', jitsiRoomName);
      }
      
      // ✅ NUEVA LÓGICA: Primero buscar videollamadas existentes
      try {
        console.log('🔍 Buscando videollamadas existentes...');
        const activeCalls = await VideoCallService.getActiveVideoCalls();
        
        // Buscar por patrón de nombre de sala
        const existingCall = activeCalls.find(call => 
          call.jitsiRoomName === jitsiRoomName && 
          (call.status === 'active' || call.status === 'scheduled')
        );
        
        if (existingCall) {
          console.log('✅ Videollamada existente encontrada:', existingCall);
          setVideoCall(existingCall);
          
          // Intentar unirse al backend
          try {
            await VideoCallService.joinVideoCall({ callId: existingCall.id });
            console.log('✅ Unido al backend exitosamente');
          } catch (joinError: any) {
            if (joinError.response?.status === 400 && 
                joinError.response?.data?.message?.includes('participante')) {
              console.log('⚠️ Ya eres participante, continuando con Jitsi...');
            } else {
              throw joinError;
            }
          }
          
          // Inicializar Jitsi con la videollamada existente
          await initializeJitsi(existingCall);
          return;
        }
      } catch (searchError: any) {
        console.log('⚠️ Error buscando videollamadas existentes, creando nueva:', searchError.message);
        // Continuar con la creación si falla la búsqueda
      }
      
      // Si no existe, crear nueva videollamada
      const callData = {
        jitsiRoomName
      };
      
      console.log('🆕 Creando nueva videollamada...');
      const newCall = await VideoCallService.createVideoCall(callData);
      setVideoCall(newCall);
      console.log('✅ Videollamada creada:', newCall);
      
      // Inicializar Jitsi directamente
      await initializeJitsi(newCall);
    } catch (error: any) {
      console.error('❌ Error creando videollamada:', error);
      
      if (error.response?.status === 401) {
        toast.error('Error de autenticación. Por favor, inicia sesión nuevamente.');
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Datos inválidos para crear la videollamada';
        
        // Si el error es por videollamada existente, intentar buscar y unirse
        if (errorMessage.includes('Ya existe una videollamada activa')) {
          console.log('🔄 Videollamada ya existe, intentando buscar y unirse...');
          try {
            const activeCalls = await VideoCallService.getActiveVideoCalls();
            const jitsiRoomName = tutoringSessionId ? `tutoring-session-${tutoringSessionId}` : null;
            
            if (jitsiRoomName) {
              const existingCall = activeCalls.find(call => 
                call.jitsiRoomName === jitsiRoomName && 
                (call.status === 'active' || call.status === 'scheduled')
              );
              
              if (existingCall) {
                setVideoCall(existingCall);
                await VideoCallService.joinVideoCall({ callId: existingCall.id });
                await initializeJitsi(existingCall);
                return;
              }
            }
          } catch (fallbackError) {
            console.error('❌ Error en fallback:', fallbackError);
          }
        }
        
        toast.error(`Error 400: ${errorMessage}`);
        console.error('Detalles del error 400:', error.response?.data);
      } else {
        toast.error(error.response?.data?.message || error.message || 'Error creando la videollamada');
      }
    }
  };

  const loadAndJoinVideoCall = async () => {
    if (!propCallId) return;
    
    try {
      console.log('🔄 Cargando videollamada:', propCallId);
      const call = await VideoCallService.getVideoCallDetails(propCallId);
      setVideoCall(call);
      
      if (call.status === 'active' || call.status === 'scheduled') {
        // Intentar unirse al backend
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
        
        await initializeJitsi(call);
      } else {
        toast.error('La videollamada ha finalizado');
      }
    } catch (error: any) {
      console.error('❌ Error cargando videollamada:', error);
      toast.error(error.response?.data?.message || error.message || 'Error cargando la videollamada');
    }
  };

  const initializeJitsi = async (call: VideoCall) => {
    if (!window.JitsiMeetExternalAPI) {
      toast.error('Jitsi Meet API no está disponible');
      return;
    }

    try {
      console.log('🔄 Inicializando Jitsi:', call.jitsiRoomName);
      
      const container = document.getElementById('jitsi-container');
      if (!container) {
        console.error('Contenedor de Jitsi no encontrado');
        return;
      }

      // Limpiar contenedor
      container.innerHTML = '';

      // Obtener información del usuario
      const userProfile = await AuthService.getCurrentUserProfile();
      
      // Configuración simplificada - dejar que Jitsi maneje su UI
      const jitsiOptions = {
        roomName: call.jitsiRoomName,
        width: '100%',
        height: '100%',
        parentNode: container,
        configOverwrite: {
          prejoinPageEnabled: false,
          enableWelcomePage: false,
          enableClosePage: false,
          startWithAudioMuted: true,
          startWithVideoMuted: true,
          resolution: 720,
          p2p: {
            enabled: true,
            preferH264: true
          }
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          SHOW_POWERED_BY: false,
          APP_NAME: 'TutorMatch',
          NATIVE_APP_NAME: 'TutorMatch'
        },
        userInfo: {
          displayName: `${userProfile?.firstName} ${userProfile?.lastName}` || 'Usuario TutorMatch',
          email: `${userProfile?.id}@tutormatch.com`
        }
      };

      const api = new window.JitsiMeetExternalAPI('meet.jit.si', jitsiOptions);
      setJitsiApi(api);

      // Event listeners básicos
      api.addEventListener('videoConferenceJoined', (event: any) => {
        console.log('✅ Te uniste exitosamente a la videollamada:', event);
        setHasJoinedSuccessfully(true);
        toast.success('🎥 ¡Estás en la videollamada!');
      });

      api.addEventListener('videoConferenceLeft', (event: any) => {
        console.log('👋 Saliste de la videollamada', event);
        if (hasJoinedSuccessfully) {
          handleLeaveCall(true);
        }
      });

      api.addEventListener('readyToClose', () => {
        console.log('🔄 Jitsi listo para cerrar');
        if (hasJoinedSuccessfully) {
          handleLeaveCall(true);
        }
      });

    } catch (error: any) {
      console.error('❌ Error inicializando Jitsi:', error);
      toast.error('Error inicializando la videollamada');
    }
  };

  const handleLeaveCall = async (isAutomatic = false) => {
    if (!videoCall) return;
    
    try {
      if (!isAutomatic) {
        console.log('🔄 Saliendo de videollamada...');
      }
      
      if (hasJoinedSuccessfully) {
        try {
          await VideoCallService.leaveVideoCall(videoCall.id);
        } catch (error) {
          console.warn('Error saliendo del backend:', error);
        }
      }
      
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

  const copyCallId = async () => {
    if (!videoCall?.id) return;
    
    try {
      await navigator.clipboard.writeText(videoCall.id);
      toast.success(`📋 ID copiado: ${videoCall.id}`);
    } catch (error) {
      toast.error('No se pudo copiar al portapapeles');
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
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header minimalista */}
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

        {/* Contenedor de Jitsi - UI nativa */}
        <div className="flex-1 bg-gray-900">
          <div 
            id="jitsi-container" 
            className="w-full h-full"
            style={{ minHeight: '400px' }}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoCallModal;