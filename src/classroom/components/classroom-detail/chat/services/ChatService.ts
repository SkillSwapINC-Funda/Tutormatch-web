import { supabase } from '../../../../../lib/supabase/client';
import axios from 'axios';

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
  user_id: string;
  content: string;
  message_type: 'text' | 'system' | 'code' | 'image' | 'video' | 'document';
  reply_to?: string;
  file_name?: string;
  file_size?: number;
  file_url?: string;
  code_language?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
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
  async createOrJoinTutoringRoom(tutoringSessionId: string): Promise<ChatRoom> {
    try {
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
      // Si la sala ya existe, intentar unirse
      if (error.response?.status === 409) {
        return this.joinTutoringRoom(tutoringSessionId);
      }
      throw error;
    }
  }

  // Obtener mensajes de una sala
  async getMessages(roomId: string, page: number = 1, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await axios.get(
        `${CHAT_API_URL}/rooms/${roomId}/messages?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      // El backend devuelve { messages: [], page, limit, hasMore }
      // Necesitamos extraer solo el array de mensajes
      return response.data.messages || [];
    } catch (error) {
      console.error('Error getting messages:', error);
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

  // Enviar mensaje
  async sendMessage(roomId: string, content: string, messageType: string = 'text', replyTo?: string, fileDetails?: any): Promise<ChatMessage> {
    try {
      const token = localStorage.getItem("auth_token");
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

  // Obtener participantes de una sala
  async getRoomParticipants(roomId: string): Promise<ChatParticipant[]> {
    try {
      const token = localStorage.getItem("auth_token");
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
          (payload) => {
            console.log('New message received:', payload);
            this.handleNewMessage(payload.new as ChatMessage);
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
            console.log('Message updated:', payload);
            this.handleMessageUpdate(payload.new as ChatMessage);
          }
        )
        .subscribe((status) => {
          console.log('Message subscription status:', status);
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
          (payload) => {
            console.log('Participant change:', payload);
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
  private async handleNewMessage(message: ChatMessage) {
    // Obtener información del usuario si no está incluida
    if (!message.user) {
      try {
      const token = localStorage.getItem("auth_token");
        const userResponse = await axios.get(
          `${API_URL}/profiles/${message.user_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        message.user = {
          id: userResponse.data.id,
          first_name: userResponse.data.firstName,
          last_name: userResponse.data.lastName,
          avatar: userResponse.data.avatar
        };
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    }

    this.messageCallbacks.forEach(callback => callback(message));
  }

  // Manejar actualización de mensaje
  private handleMessageUpdate(message: ChatMessage) {
    this.messageCallbacks.forEach(callback => callback(message));
  }

  // Manejar cambio en participantes
  private async handleParticipantChange(roomId: string) {
    try {
      const participants = await this.getRoomParticipants(roomId);
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