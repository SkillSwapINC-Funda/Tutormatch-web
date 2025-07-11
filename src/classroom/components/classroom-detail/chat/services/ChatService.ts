import { supabase } from '../../../../../lib/supabase/client';
import axios from 'axios';
import { AuthService } from '../../../../../public/services/authService';

const API_URL = import.meta.env.VITE_TUTORMATCH_MICROSERVICES;
const CHAT_API_URL = `${API_URL}/api/chat`;

export interface ChatRoom {
  id: string;
  name: string;
  type: 'private' | 'group';
  tutoring_session_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'system' | 'code' | 'image' | 'video' | 'document';
  reply_to?: string;
  file_name?: string;
  file_size?: number;
  file_url?: string;
  code_language?: string;
  created_at: string;
  updated_at: string;
  is_deleted?: boolean;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar?: string;
  };
}

export interface ChatParticipant {
  id: string;
  room_id: string;
  user_id: string;
  role: 'student' | 'tutor';
  joined_at: string;
  last_seen?: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar?: string;
  };
}

export class ChatService {
  private currentSubscription: any = null;
  private messageCallbacks: ((message: ChatMessage) => void)[] = [];
  private participantCallbacks: ((participants: ChatParticipant[]) => void)[] = [];
  private connectionCallbacks: ((status: string) => void)[] = [];

  // Crear o unirse a una sala de chat para una sesión de tutoría
  // Agregar nuevo método para buscar sala existente
  async findExistingTutoringRoom(tutoringSessionId: string): Promise<ChatRoom | null> {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('tutoring_session_id', tutoringSessionId)
        .eq('type', 'tutoring')
        .eq('is_active', true)
        .single();
  
      if (error && error.code !== 'PGRST116') {
        console.error('Error buscando sala existente:', error);
        return null;
      }
  
      return data ? {
        id: data.id,
        name: data.name,
        type: data.type,
        tutoring_session_id: data.tutoring_session_id,
        created_at: data.created_at,
        updated_at: data.updated_at || data.created_at
      } : null;
    } catch (error) {
      console.error('Error en findExistingTutoringRoom:', error);
      return null;
    }
  }
  
  // Agregar método para unirse a sala existente
  async joinExistingRoom(roomId: string, userId: string): Promise<void> {
    try {
      // Verificar si ya es participante
      const { data: existingParticipant } = await supabase
        .from('chat_participants')
        .select('id')
        .eq('room_id', roomId)
        .eq('user_id', userId)
        .single();
  
      if (!existingParticipant) {
        // Agregar como participante
        const { error } = await supabase
          .from('chat_participants')
          .insert({
            room_id: roomId,
            user_id: userId,
            is_admin: false
          });
  
        if (error) {
          console.error('Error agregando participante:', error);
        }
      }
    } catch (error) {
      console.error('Error en joinExistingRoom:', error);
    }
  }
  
  // Modificar el método createOrJoinTutoringRoom
  async createOrJoinTutoringRoom(tutoringSessionId: string): Promise<ChatRoom> {
    try {
      // Primero buscar si ya existe una sala para esta sesión
      const existingRoom = await this.findExistingTutoringRoom(tutoringSessionId);
      
      if (existingRoom) {
        
        // Obtener el usuario actual
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await this.joinExistingRoom(existingRoom.id, user.id);
        }
        
        return existingRoom;
      }
  
      // Si no existe, crear nueva sala usando el backend
      const token = localStorage.getItem("auth_token");
      const response = await axios.post(
        `${CHAT_API_URL}/rooms`,
        {
          name: `Tutoría ${tutoringSessionId}`,
          type: 'tutoring',
          tutoringSessionId: tutoringSessionId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error: any) {
      // Si la sala ya existe en el backend, buscarla
      if (error.response?.status === 409) {
        return this.joinTutoringRoom(tutoringSessionId);
      }
      throw error;
    }
  }

  // Unirse a una sala existente por sesión de tutoría
  async joinTutoringRoom(tutoringSessionId: string): Promise<ChatRoom> {
    try {
      const token = localStorage.getItem("auth_token");
      // Primero buscar la sala por tutoringSessionId
      const roomsResponse = await axios.get(
        `${CHAT_API_URL}/rooms`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Buscar la sala que corresponde a esta sesión de tutoría
      // El backend devuelve un array de objetos con estructura diferente
      const roomData = roomsResponse.data.find((r: any) => 
        r.chat_rooms?.tutoring_session_id === tutoringSessionId
      );
      
      if (!roomData || !roomData.chat_rooms) {
        throw new Error('Sala de tutoría no encontrada');
      }
      
      // Retornar la información de la sala en el formato esperado
      return {
        id: roomData.chat_rooms.id,
        name: roomData.chat_rooms.name,
        type: roomData.chat_rooms.type,
        tutoring_session_id: roomData.chat_rooms.tutoring_session_id,
        created_at: roomData.chat_rooms.created_at,
        updated_at: roomData.chat_rooms.updated_at || roomData.chat_rooms.created_at
      };
    } catch (error) {
      console.error('Error joining tutoring room:', error);
      throw error;
    }
  }

  // Obtener participantes de una sala
  async getRoomParticipants(roomId: string): Promise<ChatParticipant[]> {
    try {
      const token = AuthService.getAuthToken();
      
      if (!token) {
        console.warn('No hay token de autenticación disponible');
        return [];
      }
      
      const response = await axios.get(
        `${CHAT_API_URL}/rooms/${roomId}/participants`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting participants:', error);
      
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.warn('Token de autenticación inválido o expirado');
        return [];
      }
      
      throw error;
    }
  }

  // También actualizar otros métodos que usan el token
  async getMessages(roomId: string, page: number = 1, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const token = localStorage.getItem("auth_token");
      
      if (!token) {
        console.warn('No hay token de autenticación disponible');
        return [];
      }
      
      const response = await axios.get(
        `${CHAT_API_URL}/rooms/${roomId}/messages?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data.messages || [];
    } catch (error) {
      console.error('Error getting messages:', error);
      
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.warn('Token de autenticación inválido o expirado');
        return [];
      }
      
      throw error;
    }
  }

  async sendMessage(roomId: string, content: string, messageType: string = 'text', replyTo?: string, fileDetails?: any): Promise<ChatMessage> {
    try {
      const token = AuthService.getAuthToken();
      
      if (!token) {
        throw new Error('No hay token de autenticación disponible');
      }
      
      const response = await axios.post(
        `${CHAT_API_URL}/messages`,
        {
          roomId,
          content,
          messageType,
          replyTo,
          ...fileDetails
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Marcar mensajes como leídos
  async markMessagesAsRead(roomId: string): Promise<void> {
    try {
      const token = localStorage.getItem("auth_token");
      await axios.post(
        `${CHAT_API_URL}/messages/mark-read`,
        { roomId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  // Suscribirse a tiempo real
  async subscribeToRoom(roomId: string) {
    try {
      // Desuscribirse de cualquier suscripción anterior
      this.unsubscribeFromRoom();

      // Suscribirse a nuevos mensajes
      const messageChannel = supabase
        .channel(`room-${roomId}-messages`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `room_id=eq.${roomId}`
          },
          // En el método subscribeToRoom, dentro del callback de INSERT
          async (payload) => {
            
            // Obtener información completa del mensaje con datos del usuario
            try {
              const { data, error } = await supabase
                .from('chat_messages')
                .select(`
                  *,
                  user:profiles!chat_messages_sender_id_fkey (
                    id,
                    first_name,
                    last_name,
                    avatar
                  )
                `)
                .eq('id', payload.new.id)
                .single();
  
              if (!error && data) {
                const messageWithUser = {
                  ...data,
                  user: data.user ? {
                    id: data.user.id,
                    first_name: data.user.first_name || 'Usuario',
                    last_name: data.user.last_name || '',
                    avatar: data.user.avatar
                  } : {
                    id: data.sender_id,
                    first_name: 'Usuario',
                    last_name: '',
                    avatar: undefined
                  }
                };
                this.messageCallbacks.forEach(callback => callback(messageWithUser as ChatMessage));
              } else {
                // Fallback al mensaje original sin información del usuario
                this.messageCallbacks.forEach(callback => callback(payload.new as ChatMessage));
              }
            } catch (error) {
              console.error('Error fetching user info for new message:', error);
              this.messageCallbacks.forEach(callback => callback(payload.new as ChatMessage));
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'chat_messages',
            filter: `room_id=eq.${roomId}`
          },
          (payload) => {
            this.handleMessageUpdate(payload.new as ChatMessage);
          }
        )
        .subscribe((status) => {
          this.notifyConnectionStatus(status);
        });

      // Suscribirse a cambios en participantes
      const participantChannel = supabase
        .channel(`room-${roomId}-participants`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'chat_participants',
            filter: `room_id=eq.${roomId}`
          },
          () => {
            this.handleParticipantChange(roomId);
          }
        )
        .subscribe();

      this.currentSubscription = {
        messageChannel,
        participantChannel
      };

    } catch (error) {
      console.error('Error subscribing to room:', error);
    }
  }

  // Desuscribirse del tiempo real
  unsubscribeFromRoom() {
    if (this.currentSubscription) {
      this.currentSubscription.messageChannel?.unsubscribe();
      this.currentSubscription.participantChannel?.unsubscribe();
      this.currentSubscription = null;
    }
  }

  // Manejar nuevo mensaje
  async getMessagesWithUserInfo(roomId: string, page: number = 1, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const offset = (page - 1) * limit;
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          user:profiles!chat_messages_sender_id_fkey (
            id,
            first_name,
            last_name,
            avatar
          )
        `)
        .eq('room_id', roomId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error getting messages with user info:', error);
        // Fallback al método original
        return this.getMessages(roomId, page, limit);
      }

      return data?.map(msg => ({
        id: msg.id,
        room_id: msg.room_id,
        sender_id: msg.sender_id,
        content: msg.content,
        message_type: msg.message_type,
        reply_to: msg.reply_to,
        file_name: msg.file_name,
        file_size: msg.file_size,
        file_url: msg.file_url,
        code_language: msg.code_language,
        created_at: msg.created_at,
        updated_at: msg.updated_at,
        is_deleted: msg.is_deleted,
        user: msg.user ? {
          id: msg.user.id,
          first_name: msg.user.first_name || 'Usuario',
          last_name: msg.user.last_name || '',
          avatar: msg.user.avatar
        } : {
          id: msg.sender_id,
          first_name: 'Usuario',
          last_name: '',
          avatar: undefined
        }
      })).reverse() || [];
    } catch (error) {
      console.error('Error in getMessagesWithUserInfo:', error);
      // Fallback al método original
      return this.getMessages(roomId, page, limit);
    }
  }

  // Nuevo método para obtener participantes con información del usuario usando Supabase
  async getRoomParticipantsWithUserInfo(roomId: string): Promise<ChatParticipant[]> {
    try {
      console.log('🔍 getRoomParticipantsWithUserInfo - roomId:', roomId);
      
      const { data, error } = await supabase
        .from('chat_participants')
        .select(`
          *,
          user:profiles!chat_participants_user_id_fkey (
            id,
            first_name,
            last_name,
            avatar
          )
        `)
        .eq('room_id', roomId);
  
      console.log('🔍 getRoomParticipantsWithUserInfo - raw data from Supabase:', data);
      console.log('🔍 getRoomParticipantsWithUserInfo - error from Supabase:', error);
      
      if (error) {
        console.error('Error getting participants with user info:', error);
        // Fallback al método original
        return this.getRoomParticipants(roomId);
      }
  
      if (!data || data.length === 0) {
        console.warn('No participants found for room:', roomId);
        return [];
      }
  
      // Log detallado de cada participante
      data.forEach((participant, index) => {
        console.log(`🔍 Participante ${index + 1}:`);
        console.log('  - user_id:', participant.user_id);
        console.log('  - role:', participant.role);
        console.log('  - user object:', participant.user);
        if (participant.user) {
          console.log('  - first_name:', participant.user.first_name);
          console.log('  - last_name:', participant.user.last_name);
          console.log('  - avatar:', participant.user.avatar);
        }
      });
  
      return data;
    } catch (error) {
      console.error('Error in getRoomParticipantsWithUserInfo:', error);
      // Fallback al método original
      return this.getRoomParticipants(roomId);
    }
  }

  // Método para verificar si dos usuarios pertenecen a la misma sala
  async verifyUsersInSameRoom(roomId: string, userId1: string, userId2: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('chat_participants')
        .select('user_id')
        .eq('room_id', roomId)
        .in('user_id', [userId1, userId2]);
        // Remover .eq('is_active', true) ya que esta columna no existe

      if (error) {
        console.error('Error verifying users in room:', error);
        return false;
      }

      return data?.length === 2;
    } catch (error) {
      console.error('Error in verifyUsersInSameRoom:', error);
      return false;
    }
  }

  // Manejar actualización de mensaje
  private handleMessageUpdate(message: ChatMessage) {
    this.messageCallbacks.forEach(callback => callback(message));
  }

  // Manejar cambio en participantes
  private async handleParticipantChange(roomId: string) {
    try {
      const participants = await this.getRoomParticipantsWithUserInfo(roomId);
      this.participantCallbacks.forEach(callback => callback(participants));
    } catch (error) {
      console.error('Error handling participant change:', error);
    }
  }

  // Notificar estado de conexión
  private notifyConnectionStatus(status: string) {
    this.connectionCallbacks.forEach(callback => callback(status));
  }

  // Registrar callbacks
  onMessage(callback: (message: ChatMessage) => void) {
    this.messageCallbacks.push(callback);
    return () => {
      const index = this.messageCallbacks.indexOf(callback);
      if (index > -1) {
        this.messageCallbacks.splice(index, 1);
      }
    };
  }

  onParticipantChange(callback: (participants: ChatParticipant[]) => void) {
    this.participantCallbacks.push(callback);
    return () => {
      const index = this.participantCallbacks.indexOf(callback);
      if (index > -1) {
        this.participantCallbacks.splice(index, 1);
      }
    };
  }

  onConnectionChange(callback: (status: string) => void) {
    this.connectionCallbacks.push(callback);
    return () => {
      const index = this.connectionCallbacks.indexOf(callback);
      if (index > -1) {
        this.connectionCallbacks.splice(index, 1);
      }
    };
  }
}

export const chatService = new ChatService();
export default chatService;