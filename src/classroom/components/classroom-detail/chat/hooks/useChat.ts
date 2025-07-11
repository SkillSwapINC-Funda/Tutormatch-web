import { useState, useEffect, useCallback, useRef } from 'react';
import { TutoringService } from '../../../../../tutoring/services/TutoringService';
import { UserService } from '../../../../../user/services/UserService';
import { AuthService } from '../../../../../public/services/authService';
import chatService, { ChatMessage as ServiceChatMessage, ChatParticipant, ChatRoom } from '../services/ChatService';
import axios from 'axios';

const API_URL = import.meta.env.VITE_TUTORMATCH_BACKEND_URL;

export interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  sender: {
    id: string;
    name: string;
    avatar?: string;
    isCurrentUser: boolean;
    role: 'student' | 'tutor';
  };
  type: 'text' | 'system' | 'code' | 'image' | 'video' | 'document';
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  codeLanguage?: string;
  fileName?: string;
  fileSize?: number;
  fileUrl?: string;
}

export interface ChatUser {
  id: string;
  name: string;
  role: 'student' | 'tutor';
  avatar?: string;
  isOnline: boolean;
}

export const useChat = (classroomId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tutorInfo, setTutorInfo] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const unsubscribeRefs = useRef<(() => void)[]>([]);
  const isSubscribedRef = useRef(false); // Nuevo: evitar múltiples suscripciones
  const tutorCheckIntervalRef = useRef<NodeJS.Timeout | null>(null); // Nuevo: controlar interval

  // Convertir mensaje del servicio al formato del componente
  const convertServiceMessage = useCallback((serviceMessage: ServiceChatMessage, currentUserId: string, tutorId?: string): ChatMessage => {
    const isCurrentUser = serviceMessage.user_id === currentUserId;
    const userName = serviceMessage.user
      ? `${serviceMessage.user.first_name} ${serviceMessage.user.last_name}`
      : 'Usuario';

    return {
      id: serviceMessage.id,
      content: serviceMessage.content,
      timestamp: new Date(serviceMessage.created_at),
      sender: {
        id: serviceMessage.user_id,
        name: userName,
        avatar: serviceMessage.user?.avatar,
        isCurrentUser,
        role: isCurrentUser ? (currentUserId === tutorId ? 'tutor' : 'student') : 'student'
      },
      type: serviceMessage.message_type as any,
      status: 'sent',
      codeLanguage: serviceMessage.code_language,
      fileName: serviceMessage.file_name,
      fileSize: serviceMessage.file_size,
      fileUrl: serviceMessage.file_url
    };
  }, []); // Sin dependencias para evitar re-creación

  // Convertir participante del servicio al formato del componente
  const convertServiceParticipant = useCallback((participant: ChatParticipant): ChatUser => {
    const userName = participant.user
      ? `${participant.user.first_name} ${participant.user.last_name}`
      : 'Usuario';

    return {
      id: participant.user_id,
      name: userName,
      role: participant.role,
      avatar: participant.user?.avatar,
      isOnline: true
    };
  }, []); // Sin dependencias para evitar re-creación

  // Función para configurar suscripciones (memoizada)
  const setupSubscriptions = useCallback(async (room: ChatRoom, currentUserId: string, tutorId?: string) => {
    if (isSubscribedRef.current) {
      console.log('Ya hay una suscripción activa, saltando...');
      return;
    }

    try {
      isSubscribedRef.current = true;
      
      // Cargar mensajes existentes
      const existingMessages = await chatService.getMessages(room.id);
      if (Array.isArray(existingMessages)) {
        const convertedMessages = existingMessages.map(msg => convertServiceMessage(msg, currentUserId, tutorId));
        setMessages(convertedMessages);
      } else {
        console.warn('existingMessages no es un array:', existingMessages);
        setMessages([]);
      }

      // Cargar participantes
      const participants = await chatService.getRoomParticipants(room.id);
      const convertedParticipants = participants.map(convertServiceParticipant);
      setUsers(convertedParticipants);

      // Suscribirse a tiempo real
      await chatService.subscribeToRoom(room.id);

      // Configurar callbacks
      const unsubscribeMessage = chatService.onMessage((message) => {
        const convertedMessage = convertServiceMessage(message, currentUserId, tutorId);
        setMessages(prev => {
          if (prev.find(m => m.id === convertedMessage.id)) {
            return prev;
          }
          return [...prev, convertedMessage];
        });
      });

      const unsubscribeParticipants = chatService.onParticipantChange((participants) => {
        const convertedParticipants = participants.map(convertServiceParticipant);
        setUsers(convertedParticipants);
      });

      const unsubscribeConnection = chatService.onConnectionChange((status) => {
        console.log('Connection status changed:', status);
        setIsConnected(status === 'SUBSCRIBED');
        
        // Si la conexión se cierra inesperadamente, marcar como no suscrito
        if (status === 'CLOSED') {
          isSubscribedRef.current = false;
        }
      });

      unsubscribeRefs.current = [unsubscribeMessage, unsubscribeParticipants, unsubscribeConnection];

    } catch (error) {
      console.error('Error configurando suscripciones:', error);
      isSubscribedRef.current = false;
    }
  }, [convertServiceMessage, convertServiceParticipant]);

  // Función para limpiar suscripciones
  const cleanupSubscriptions = useCallback(() => {
    console.log('Limpiando suscripciones...');
    
    // Limpiar interval de verificación de tutor
    if (tutorCheckIntervalRef.current) {
      clearInterval(tutorCheckIntervalRef.current);
      tutorCheckIntervalRef.current = null;
    }
    
    // Limpiar callbacks
    unsubscribeRefs.current.forEach(unsubscribe => {
      try {
        unsubscribe();
      } catch (error) {
        console.error('Error al desuscribir callback:', error);
      }
    });
    unsubscribeRefs.current = [];
    
    // Desuscribir de Supabase
    chatService.unsubscribeFromRoom();
    
    // Marcar como no suscrito
    isSubscribedRef.current = false;
  }, []);

  // Cargar información de la tutoría y configurar chat
  useEffect(() => {
    const loadTutoringData = async () => {
      try {
        setIsLoading(true);
        
        // Limpiar suscripciones anteriores
        cleanupSubscriptions();

        // Obtener información de la tutoría
        const tutoringSession = await TutoringService.getTutoringSession(classroomId);

        // Obtener información del tutor
        const tutorResponse = await axios.get(`${API_URL}/profiles/${tutoringSession.tutorId}`);
        const tutorData = tutorResponse.data;
        setTutorInfo(tutorData);

        // Obtener información del usuario actual
        const currentUserId = localStorage.getItem("currentUserId");
        let currentUserData = null;

        if (currentUserId) {
          try {
            currentUserData = await UserService.getUserById(currentUserId);
            setCurrentUser(currentUserData);
          } catch (error) {
            console.error('Error al obtener usuario actual:', error);
          }
        }

        // Verificar si el usuario actual es el tutor
        const isCurrentUserTutor = currentUserId === tutorData.id;

        if (isCurrentUserTutor) {
          // Si es tutor, configurar verificación periódica
          setShowChat(false);
          console.log('Usuario es tutor, configurando verificación periódica...');
          
          const checkForStudents = async () => {
            try {
              const room = await chatService.joinTutoringRoom(classroomId);
              const participants = await chatService.getRoomParticipants(room.id);

              if (participants.length > 1 && !showChat) {
                console.log('Estudiantes encontrados, activando chat...');
                setChatRoom(room);
                setShowChat(true);
                
                // Configurar suscripciones solo una vez
                await setupSubscriptions(room, currentUserId || '', tutorData.id);
              }
            } catch (error) {
              console.log('Sala de chat no existe aún, esperando...');
            }
          };

          // Verificar inmediatamente
          checkForStudents();
          
          // Configurar verificación periódica
          tutorCheckIntervalRef.current = setInterval(checkForStudents, 5000);
          
        } else {
          // Si es estudiante, crear/unirse a la sala de chat inmediatamente
          try {
            const room = await chatService.createOrJoinTutoringRoom(classroomId);
            setChatRoom(room);
            setShowChat(true);

            // Configurar suscripciones
            await setupSubscriptions(room, currentUserId || '', tutorData.id);

          } catch (error) {
            console.error('Error configurando chat:', error);
          }
        }

      } catch (error) {
        console.error('Error al cargar datos de la tutoría:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (classroomId) {
      loadTutoringData();
    }

    // Cleanup al desmontar o cambiar classroomId
    return cleanupSubscriptions;
  }, [classroomId]); // Solo classroomId como dependencia

  const sendMessage = useCallback(async (content: string) => {
    if (!chatRoom) return;

    try {
      // Agregar mensaje optimista
      const currentUserId = AuthService.getCurrentUserId();
      const isCurrentUserTutor = currentUserId === tutorInfo?.id;

      const optimisticMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        content,
        timestamp: new Date(),
        sender: {
          id: currentUserId || 'unknown',
          name: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Usuario Actual',
          isCurrentUser: true,
          avatar: currentUser?.avatar,
          role: isCurrentUserTutor ? 'tutor' : 'student'
        },
        type: 'text',
        status: 'sending'
      };

      setMessages(prev => [...prev, optimisticMessage]);

      // Enviar mensaje real
      await chatService.sendMessage(chatRoom.id, content, 'text');

      // Remover mensaje optimista (el real llegará por tiempo real)
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));

    } catch (error) {
      console.error('Error enviando mensaje:', error);
      // Remover mensaje optimista en caso de error
      setMessages(prev => prev.filter(m => !m.id.startsWith('temp-')));
    }
  }, [chatRoom, currentUser, tutorInfo]);

  const sendCodeMessage = useCallback(async (code: string, language: string) => {
    if (!chatRoom) return;

    try {
      await chatService.sendMessage(chatRoom.id, code, 'code', undefined, {
        codeLanguage: language
      });
    } catch (error) {
      console.error('Error enviando código:', error);
    }
  }, [chatRoom]);

  const sendFileMessage = useCallback(async (file: File, type: 'image' | 'video' | 'document') => {
    if (!chatRoom) return;

    try {
      // Aquí deberías implementar la subida del archivo primero
      // Por ahora, solo envío la información del archivo
      await chatService.sendMessage(chatRoom.id, `Archivo: ${file.name}`, type, undefined, {
        fileName: file.name,
        fileSize: file.size
      });
    } catch (error) {
      console.error('Error enviando archivo:', error);
    }
  }, [chatRoom]);

  return {
    messages,
    users,
    isLoading,
    tutorInfo,
    currentUser,
    sendMessage,
    sendCodeMessage,
    sendFileMessage,
    isConnected,
    showChat,
    chatRoom
  };
};