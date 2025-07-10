import type { ChatMessage, ChatUser } from "../types/index";

export class ChatService {
  static async getChatMessages(_classroomId: string): Promise<ChatMessage[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockMessages: ChatMessage[] = [
          {
            id: '1',
            userId: 'tutor1',
            userName: 'Ana Martínez',
            userRole: 'tutor',
            message: '¡Bienvenidos a la clase de Algoritmos y Estructura de datos!',
            timestamp: new Date(Date.now() - 3600000),
            type: 'text'
          },
          {
            id: '2',
            userId: 'student1',
            userName: 'María García',
            userRole: 'student',
            message: 'Hola profesora, ¿podríamos revisar el tema de árboles binarios?',
            timestamp: new Date(Date.now() - 3000000),
            type: 'text'
          },
          {
            id: '3',
            userId: 'tutor1',
            userName: 'Ana Martínez',
            userRole: 'tutor',
            message: 'Por supuesto, empezaremos con los conceptos básicos.',
            timestamp: new Date(Date.now() - 2400000),
            type: 'text'
          },
          {
            id: '4',
            userId: 'student2',
            userName: 'Juan Pérez',
            userRole: 'student',
            message: '¿Tienen material adicional sobre complejidad algorítmica?',
            timestamp: new Date(Date.now() - 1800000),
            type: 'text'
          }
        ];
        resolve(mockMessages);
      }, 500);
    });
  }

  static async getChatUsers(_classroomId: string): Promise<ChatUser[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUsers: ChatUser[] = [
          {
            id: 'tutor1',
            name: 'Ana Martínez',
            role: 'tutor',
            isOnline: true
          },
          {
            id: 'student1',
            name: 'María García',
            role: 'student',
            isOnline: true
          },
          {
            id: 'student2',
            name: 'Juan Pérez',
            role: 'student',
            isOnline: true
          },
          {
            id: 'student3',
            name: 'Luis Rodríguez',
            role: 'student',
            isOnline: false
          }
        ];
        resolve(mockUsers);
      }, 300);
    });
  }

  static async sendMessage(_classroomId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newMessage: ChatMessage = {
          ...message,
          id: Date.now().toString(),
          timestamp: new Date()
        };
        resolve(newMessage);
      }, 200);
    });
  }
}