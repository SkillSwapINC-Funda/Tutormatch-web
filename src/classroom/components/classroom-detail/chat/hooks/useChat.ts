import { useState, useEffect, useCallback, useRef } from 'react';
import { TutoringService } from '../../../../../tutoring/services/TutoringService';
import { UserService } from '../../../../../user/services/UserService';
import chatService, { ChatMessage as ServiceChatMessage, ChatParticipant, ChatRoom } from '../services/ChatService';
import axios from 'axios';
// Agregar import
import { AuthService } from '../../../../../public/services/authService';

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
    const isCurrentUser = serviceMessage.sender_id === currentUserId;
    
    // Debug: agregar logs para ver qué datos llegan
    console.log('convertServiceMessage - serviceMessage:', serviceMessage);
    console.log('convertServiceMessage - user data:', serviceMessage.user);
    
    // Mejorar el manejo del nombre del usuario
    let userName = 'Usuario';
    if (serviceMessage.user) {
      const firstName = serviceMessage.user.first_name || '';
      const lastName = serviceMessage.user.last_name || '';
      userName = `${firstName} ${lastName}`.trim() || 'Usuario';
      console.log('convertServiceMessage - userName generado:', userName);
    } else {
      console.warn('convertServiceMessage - No hay información de usuario para el mensaje:', serviceMessage.id);
    }

    return {
      id: serviceMessage.id,
      content: serviceMessage.content,
      timestamp: new Date(serviceMessage.created_at),
      sender: {
        id: serviceMessage.sender_id,
        name: userName,
        avatar: serviceMessage.user?.avatar,
        isCurrentUser,
        role: serviceMessage.sender_id === tutorId ? 'tutor' : 'student'
      },
      type: serviceMessage.message_type as any,
      status: 'sent',
      codeLanguage: serviceMessage.code_language,
      fileName: serviceMessage.file_name,
      fileSize: serviceMessage.file_size,
      fileUrl: serviceMessage.file_url
    };
  }, []);

  // Convertir participante del servicio al formato del componente
  const convertServiceParticipant = useCallback((participant: ChatParticipant): ChatUser => {
    const userName = participant.user
      ? `${participant.user.first_name || ''} ${participant.user.last_name || ''}`.trim() || 'Usuario'
      : 'Usuario';

    return {
      id: participant.user_id,
      name: userName,
      role: participant.role,
      avatar: participant.user?.avatar,
      isOnline: true
    };
  }, []); // Sin dependencias para evitar re-creación

  // Función para cargar mensajes con información del usuario
  const loadMessages = useCallback(async (roomId: string) => {
    try {
      setIsLoading(true);
      // Intentar usar el nuevo método que incluye información del usuario
      let serviceMessages;
      try {
        serviceMessages = await chatService.getMessagesWithUserInfo(roomId);
      } catch (error) {
        console.warn('Fallback al método original de mensajes:', error);
        serviceMessages = await chatService.getMessages(roomId);
      }
      
      const currentUserId = AuthService.getCurrentUserId();
      const tutorId = tutorInfo?.id;
      
      const convertedMessages = serviceMessages.map(msg => 
convertServiceMessage(msg, currentUserId || '', tutorId || undefined)
      );
      
      setMessages(convertedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [tutorInfo, convertServiceMessage]);

  // Función para cargar usuarios con información del usuario
  const loadUsers = useCallback(async (roomId: string) => {
    try {
      // Obtener el currentUserId para filtrar
      const currentUserId = AuthService.getCurrentUserId();
      console.log('loadUsers - currentUserId:', currentUserId);
      
      // Intentar usar el nuevo método que incluye información del usuario
      let participants;
      try {
        participants = await chatService.getRoomParticipantsWithUserInfo(roomId);
        console.log('loadUsers - participants from getRoomParticipantsWithUserInfo:', participants);
      } catch (error) {
        console.warn('Fallback al método original de participantes:', error);
        participants = await chatService.getRoomParticipants(roomId);
        console.log('loadUsers - participants from fallback:', participants);
      }
      
      const chatUsers = participants.map(participant => {
        console.log('loadUsers - processing participant:', participant);
        
        // Log específico para el otro usuario (no currentUserId)
        if (participant.user_id !== currentUserId) {
          console.log('🔍 OTRO USUARIO ENCONTRADO:');
          console.log('  - user_id:', participant.user_id);
          console.log('  - user data:', participant.user);
          console.log('  - first_name:', participant.user?.first_name);
          console.log('  - last_name:', participant.user?.last_name);
          console.log('  - avatar:', participant.user?.avatar);
          console.log('  - role:', participant.role);
        }
        
        const userName = participant.user?.first_name && participant.user?.last_name 
          ? `${participant.user.first_name} ${participant.user.last_name}`.trim()
          : participant.user?.first_name || 'Usuario';
        
        console.log('loadUsers - generated userName:', userName, 'for user_id:', participant.user_id);
        
        return {
          id: participant.user_id,
          name: userName,
          avatar: participant.user?.avatar,
          role: participant.role,
          isOnline: true
        };
      });
      
      console.log('loadUsers - final chatUsers:', chatUsers);
      
      // Log específico para verificar si el otro usuario está en la lista final
      const otherUser = chatUsers.find(user => user.id !== currentUserId);
      if (otherUser) {
        console.log('✅ OTRO USUARIO EN LISTA FINAL:');
        console.log('  - id:', otherUser.id);
        console.log('  - name:', otherUser.name);
        console.log('  - avatar:', otherUser.avatar);
        console.log('  - role:', otherUser.role);
      } else {
        console.log('❌ NO SE ENCONTRÓ OTRO USUARIO EN LA LISTA FINAL');
      }
      
      setUsers(chatUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }, []);

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
  }, []); // Sin dependencias

  // Función para configurar suscripciones (memoizada)
  const setupSubscriptions = useCallback(async (room: ChatRoom, currentUserId: string, tutorId?: string) => {
    if (isSubscribedRef.current) {
      console.log('Ya hay una suscripción activa, saltando...');
      return;
    }

    try {
      isSubscribedRef.current = true;
      
      // Cargar mensajes existentes usando la nueva función
      await loadMessages(room.id);

      // Cargar participantes usando la nueva función
      await loadUsers(room.id);

      // Suscribirse a tiempo real
      await chatService.subscribeToRoom(room.id);

      // Configurar callbacks
      const unsubscribeMessage = chatService.onMessage((message) => {
        const convertedMessage = convertServiceMessage(message, currentUserId, tutorId);
        setMessages(prev => {
          // Evitar duplicados
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
  }, [convertServiceMessage, convertServiceParticipant, loadMessages, loadUsers]);

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

        // Obtener información del usuario actual usando AuthService
        const currentUserId = AuthService.getCurrentUserId();
        let currentUserData = null;

        if (currentUserId) {
          try {
            // Usar AuthService.getCurrentUserProfile() para obtener datos completos
            currentUserData = await AuthService.getCurrentUserProfile();
            if (currentUserData) {
              setCurrentUser(currentUserData);
            } else {
              // Fallback: intentar obtener desde UserService
              currentUserData = await UserService.getUserById(currentUserId);
              setCurrentUser(currentUserData);
            }
          } catch (error) {
            console.error('Error al obtener usuario actual:', error);
            // Fallback adicional: crear objeto básico del usuario
            try {
              const fallbackUser = await UserService.getUserById(currentUserId);
              setCurrentUser(fallbackUser);
            } catch (fallbackError) {
              console.error('Error en fallback de usuario:', fallbackError);
            }
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
              const room = await chatService.createOrJoinTutoringRoom(classroomId);
              
              // Verificar si tenemos token de autenticación
              if (!AuthService.getAuthToken()) {
                console.warn('No hay token de autenticación, activando chat sin verificar participantes');
                setChatRoom(room);
                setShowChat(true);
                await setupSubscriptions(room, currentUserId || '', tutorData.id);
                
                if (tutorCheckIntervalRef.current) {
                  clearInterval(tutorCheckIntervalRef.current);
                  tutorCheckIntervalRef.current = null;
                }
                return;
              }
              
              // Activar el chat para el tutor independientemente del número de participantes
              if (!showChat) {
                console.log('Sala encontrada, activando chat para tutor...');
                setChatRoom(room);
                setShowChat(true);
                
                await setupSubscriptions(room, currentUserId || '', tutorData.id);
                
                if (tutorCheckIntervalRef.current) {
                  clearInterval(tutorCheckIntervalRef.current);
                  tutorCheckIntervalRef.current = null;
                }
              }
            } catch (error) {
              console.log('Error al acceder a la sala de chat:', error);
            }
          };

          // Verificar inmediatamente
          checkForStudents();
          
          // Configurar verificación periódica solo si no se activó el chat
          setTimeout(() => {
            if (!showChat && !tutorCheckIntervalRef.current) {
              tutorCheckIntervalRef.current = setInterval(checkForStudents, 3000);
            }
          }, 1000);
          
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
  }, [classroomId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!chatRoom) return;

    try {
      // Obtener currentUserId de manera consistente
      const currentUserId = AuthService.getCurrentUserId();
      if (!currentUserId) {
        console.error('No se pudo obtener el ID del usuario actual');
        return;
      }
      
      const isCurrentUserTutor = currentUserId === tutorInfo?.id;

      // Asegurar que tenemos datos del usuario actual
      let userDisplayName = 'Usuario Actual';
      let userAvatar = undefined;
      
      if (currentUser) {
        userDisplayName = `${currentUser.firstName} ${currentUser.lastName}`.trim();
        userAvatar = currentUser.avatar;
      } else {
        // Si no tenemos currentUser, intentar obtenerlo
        try {
          const userData = await AuthService.getCurrentUserProfile();
          if (userData) {
            userDisplayName = `${userData.firstName} ${userData.lastName}`.trim();
            userAvatar = userData.avatar;
            setCurrentUser(userData); // Actualizar el estado
          }
        } catch (error) {
          console.error('Error obteniendo datos del usuario para mensaje:', error);
        }
      }

      const optimisticMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        content,
        timestamp: new Date(),
        sender: {
          id: currentUserId,
          name: userDisplayName,
          isCurrentUser: true,
          avatar: userAvatar,
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