import { useState, useEffect, useCallback, useRef } from 'react';
import { TutoringService } from '../../../../../tutoring/services/TutoringService';
import { UserService } from '../../../../../user/services/UserService';
import chatService, { ChatMessage as ServiceChatMessage, ChatParticipant, ChatRoom } from '../services/ChatService';
import axios from 'axios';
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
  const isSubscribedRef = useRef(false);
  const tutorCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const convertServiceMessage = useCallback((serviceMessage: ServiceChatMessage, currentUserId: string, tutorId?: string): ChatMessage => {
    const isCurrentUser = serviceMessage.sender_id === currentUserId;
    
    
    let userName = 'Usuario';
    if (serviceMessage.user) {
      const firstName = serviceMessage.user.first_name || '';
      const lastName = serviceMessage.user.last_name || '';
      userName = `${firstName} ${lastName}`.trim() || 'Usuario';
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
  }, []); 

  const loadMessages = useCallback(async (roomId: string) => {
    try {
      setIsLoading(true);
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

  const loadUsers = useCallback(async (roomId: string) => {
    try {
      let participants;
      try {
        participants = await chatService.getRoomParticipantsWithUserInfo(roomId);
      } catch (error) {
        console.warn('Fallback al método original de participantes:', error);
        participants = await chatService.getRoomParticipants(roomId);
      }
      
      const chatUsers = participants.map(participant => {
        const userName = participant.user?.first_name && participant.user?.last_name 
          ? `${participant.user.first_name} ${participant.user.last_name}`.trim()
          : participant.user?.first_name || 'Usuario';
                
        return {
          id: participant.user_id,
          name: userName,
          avatar: participant.user?.avatar,
          role: participant.role,
          isOnline: true
        };
      });
      
      setUsers(chatUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }, []);

  const cleanupSubscriptions = useCallback(() => {
    
    if (tutorCheckIntervalRef.current) {
      clearInterval(tutorCheckIntervalRef.current);
      tutorCheckIntervalRef.current = null;
    }
    
    unsubscribeRefs.current.forEach(unsubscribe => {
      try {
        unsubscribe();
      } catch (error) {
        console.error('Error al desuscribir callback:', error);
      }
    });
    unsubscribeRefs.current = [];
    
    chatService.unsubscribeFromRoom();
    
    isSubscribedRef.current = false;
  }, []);

  const setupSubscriptions = useCallback(async (room: ChatRoom, currentUserId: string, tutorId?: string) => {
    if (isSubscribedRef.current) {
      return;
    }

    try {
      isSubscribedRef.current = true;
      
      await loadMessages(room.id);

      await loadUsers(room.id);

      await chatService.subscribeToRoom(room.id);

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
        setIsConnected(status === 'SUBSCRIBED');
        
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

  useEffect(() => {
    const loadTutoringData = async () => {
      try {
        setIsLoading(true);
        
        cleanupSubscriptions();

        const tutoringSession = await TutoringService.getTutoringSession(classroomId);

        const tutorResponse = await axios.get(`${API_URL}/profiles/${tutoringSession.tutorId}`);
        const tutorData = tutorResponse.data;
        setTutorInfo(tutorData);

        const currentUserId = AuthService.getCurrentUserId();
        let currentUserData = null;

        if (currentUserId) {
          try {
            currentUserData = await AuthService.getCurrentUserProfile();
            if (currentUserData) {
              setCurrentUser(currentUserData);
            } else {
              currentUserData = await UserService.getUserById(currentUserId);
              setCurrentUser(currentUserData);
            }
          } catch (error) {
            console.error('Error al obtener usuario actual:', error);
            try {
              const fallbackUser = await UserService.getUserById(currentUserId);
              setCurrentUser(fallbackUser);
            } catch (fallbackError) {
              console.error('Error en fallback de usuario:', fallbackError);
            }
          }
        }

        const isCurrentUserTutor = currentUserId === tutorData.id;

        if (isCurrentUserTutor) {
          setShowChat(false);
          
          const checkForStudents = async () => {
            try {
              const room = await chatService.createOrJoinTutoringRoom(classroomId);
              
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
              
              if (!showChat) {
                setChatRoom(room);
                setShowChat(true);
                
                await setupSubscriptions(room, currentUserId || '', tutorData.id);
                
                if (tutorCheckIntervalRef.current) {
                  clearInterval(tutorCheckIntervalRef.current);
                  tutorCheckIntervalRef.current = null;
                }
              }
            } catch (error) {
            }
          };

          checkForStudents();
          
          setTimeout(() => {
            if (!showChat && !tutorCheckIntervalRef.current) {
              tutorCheckIntervalRef.current = setInterval(checkForStudents, 3000);
            }
          }, 1000);
          
        } else {
          try {
            const room = await chatService.createOrJoinTutoringRoom(classroomId);
            setChatRoom(room);
            setShowChat(true);

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

    return cleanupSubscriptions;
  }, [classroomId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!chatRoom) return;

    try {
      const currentUserId = AuthService.getCurrentUserId();
      if (!currentUserId) {
        console.error('No se pudo obtener el ID del usuario actual');
        return;
      }
      
      const isCurrentUserTutor = currentUserId === tutorInfo?.id;

      let userDisplayName = 'Usuario Actual';
      let userAvatar = undefined;
      
      if (currentUser) {
        userDisplayName = `${currentUser.firstName} ${currentUser.lastName}`.trim();
        userAvatar = currentUser.avatar;
      } else {
        try {
          const userData = await AuthService.getCurrentUserProfile();
          if (userData) {
            userDisplayName = `${userData.firstName} ${userData.lastName}`.trim();
            userAvatar = userData.avatar;
            setCurrentUser(userData);
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

      await chatService.sendMessage(chatRoom.id, content, 'text');

      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));

    } catch (error) {
      console.error('Error enviando mensaje:', error);
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