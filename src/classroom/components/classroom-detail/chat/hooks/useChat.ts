import { useState, useEffect, useCallback } from 'react';
import { TutoringService } from '../../../../../tutoring/services/TutoringService';
import { UserService } from '../../../../../user/services/UserService';
import { AuthService } from '../../../../../public/services/authService';
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

  // Cargar información de la tutoría y el tutor
  useEffect(() => {
    const loadTutoringData = async () => {
      try {
        setIsLoading(true);
        
        // Obtener información de la tutoría
        const tutoringSession = await TutoringService.getTutoringSession(classroomId);
        
        // Obtener información del tutor desde profiles
        const tutorResponse = await axios.get(`${API_URL}/profiles/${tutoringSession.tutorId}`);
        const tutorData = tutorResponse.data;
        console.log("tutor data: ", tutorData);
        console.log("avatar url: ", tutorData.avatar);
        
        setTutorInfo(tutorData);
        
        // Obtener información del usuario actual
        const currentUserId = AuthService.getCurrentUserId();
        let currentUserData = null;
        
        if (currentUserId) {
          try {
            currentUserData = await UserService.getUserById(currentUserId);
            setCurrentUser(currentUserData);
            console.log("current user data: ", currentUserData);
          } catch (error) {
            console.error('Error al obtener usuario actual:', error);
          }
        }
        
        // Verificar si el usuario actual es el tutor
        const isCurrentUserTutor = currentUserId === tutorData.id;
        
        // Crear usuarios del chat basado en si el usuario actual es tutor o estudiante
        const chatUsers: ChatUser[] = [];
        
        if (isCurrentUserTutor) {
          // Si el usuario actual es el tutor, solo mostrar al tutor
          chatUsers.push({
            id: tutorData.id,
            name: `${tutorData.firstName} ${tutorData.lastName}`,
            role: 'tutor',
            avatar: tutorData.avatar,
            isOnline: true
          });
        } else {
          // Si el usuario actual es estudiante, mostrar tutor y estudiante
          chatUsers.push({
            id: tutorData.id,
            name: `${tutorData.firstName} ${tutorData.lastName}`,
            role: 'tutor',
            avatar: tutorData.avatar,
            isOnline: true
          });
          
          // Agregar usuario actual si existe
          if (currentUserData) {
            chatUsers.push({
              id: currentUserData.id,
              name: `${currentUserData.firstName} ${currentUserData.lastName}`,
              role: 'student',
              avatar: currentUserData.avatar,
              isOnline: true
            });
          }
        }
        
        setUsers(chatUsers);
        
        // Cargar mensajes del chat con la lógica correcta de isCurrentUser
        const mockMessages: ChatMessage[] = [
          {
            id: '1',
            content: '¡Hola! Bienvenido a la sesión de tutoría. ¿En qué puedo ayudarte hoy?',
            timestamp: new Date(Date.now() - 300000),
            sender: {
              id: tutorData.id,
              name: `${tutorData.firstName} ${tutorData.lastName}`,
              isCurrentUser: currentUserId === tutorData.id,
              avatar: tutorData.avatar,
              role: 'tutor'
            },
            type: 'text'
          }
        ];
        
        setMessages(mockMessages);
        
      } catch (error) {
        console.error('Error al cargar datos de la tutoría:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (classroomId) {
      loadTutoringData();
    }
  }, [classroomId]);

  const sendMessage = useCallback((content: string) => {
    const currentUserId = AuthService.getCurrentUserId();
    
    // Determinar el rol del usuario actual
    const isCurrentUserTutor = currentUserId === tutorInfo?.id;
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
      sender: {
        id: currentUserId || 'unknown',
        name: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Usuario Actual',
        isCurrentUser: true,
        avatar: currentUser.avatar,
        role: isCurrentUserTutor ? 'tutor' : 'student'
      },
      type: 'text',
      status: 'sending'
    };
    
    setMessages(prev => [...prev, newMessage]);
  }, [classroomId, currentUser, tutorInfo]);

  const sendCodeMessage = useCallback((code: string, language: string) => {
    const currentUserId = AuthService.getCurrentUserId();
    const isCurrentUserTutor = currentUserId === tutorInfo?.id;
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: code,
      timestamp: new Date(),
      sender: {
        id: currentUserId || 'unknown',
        name: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Usuario Actual',
        isCurrentUser: true,
        avatar: currentUser.avatar,
        role: isCurrentUserTutor ? 'tutor' : 'student'
      },
      type: 'code',
      codeLanguage: language,
      status: 'sending'
    };
    
    setMessages(prev => [...prev, newMessage]);
  }, [classroomId, currentUser, tutorInfo]);

  const sendFileMessage = useCallback((file: File, type: 'image' | 'video' | 'document') => {
    const currentUserId = AuthService.getCurrentUserId();
    const isCurrentUserTutor = currentUserId === tutorInfo?.id;
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: `Archivo: ${file.name}`,
      timestamp: new Date(),
      sender: {
        id: currentUserId || 'unknown',
        name: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Usuario Actual',
        isCurrentUser: true,
        role: isCurrentUserTutor ? 'tutor' : 'student'
      },
      type: type,
      fileName: file.name,
      fileSize: file.size,
      status: 'sending'
    };
    
    setMessages(prev => [...prev, newMessage]);
  }, [classroomId, currentUser, tutorInfo]);

  return {
    messages,
    users,
    isLoading,
    tutorInfo,
    currentUser,
    sendMessage,
    sendCodeMessage,
    sendFileMessage
  };
};