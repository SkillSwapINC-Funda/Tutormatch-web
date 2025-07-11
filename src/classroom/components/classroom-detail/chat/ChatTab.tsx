import React, { useEffect, useRef } from 'react';
import { MessageCircle, Users, Wifi, WifiOff } from 'lucide-react';
import ChatMessage from '../chat/components/ChatMessage';
import ChatInput from '../chat/components/ChatInput';
import UsersList from '../chat/components/UsersList';
import { useChat } from './hooks/useChat';
import { AuthService } from '../../../../public/services/authService';

interface ChatTabProps {
  classroomId: string;
}

const ChatTab: React.FC<ChatTabProps> = ({ classroomId }) => {
  const { 
    messages, 
    users, 
    isLoading, 
    tutorInfo, 
    sendMessage, 
    sendCodeMessage, 
    sendFileMessage,
    isConnected,
    showChat,
    chatRoom
  } = useChat(classroomId);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = AuthService.getCurrentUserId();
  const isCurrentUserTutor = currentUserId === tutorInfo?.id;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-light-gray">Cargando chat...</p>
        </div>
      </div>
    );
  }

  // Si es tutor y no hay chat disponible
  if (isCurrentUserTutor && !showChat) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Users className="w-16 h-16 text-light-gray mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-light mb-2">
            Esperando estudiantes
          </h3>
          <p className="text-light-gray mb-4">
            El chat se activará cuando un estudiante se una a la sesión de tutoría.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-light-gray">
            <div className="animate-pulse w-2 h-2 bg-primary rounded-full"></div>
            <span>Esperando conexión...</span>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay sala de chat disponible
  if (!chatRoom) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 text-light-gray mx-auto mb-4" />
          <p className="text-light-gray">No se pudo conectar al chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:flex-row gap-2 lg:gap-4">
      {/* Chat principal */}
      <div className="flex-1 flex flex-col bg-dark-card rounded-lg shadow-lg min-h-0 max-h-[70vh]">
        <div className="bg-dark-light border-b border-dark-border p-3 sm:p-4 rounded-t-lg flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-primary p-1.5 sm:p-2 rounded-lg">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-light" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-light text-sm sm:text-base truncate">Chat Privado</h2>
                {isConnected ? (
                  <Wifi className="w-4 h-4 text-green-500" aria-label="Conectado" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" aria-label="Desconectado" />
                )}
              </div>
              <p className="text-xs sm:text-sm text-light-gray truncate">
                {tutorInfo ? `Sesión con ${tutorInfo.firstName} ${tutorInfo.lastName}` : 'Sesión de tutoría 1 a 1'}
                {users.length > 0 && ` • ${users.length} participante${users.length > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
        </div>
        
        {/* Área de mensajes con scroll propio */}
        <div className="flex-1 min-h-0 max-h-[55vh] overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-4 scroll-smooth scrollbar-thin">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 text-light-gray mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-light mb-2">
                ¡Comienza tu sesión de tutoría!
              </h3>
              <p className="text-sm sm:text-base text-light-gray">
                {isCurrentUserTutor 
                  ? 'Responde las preguntas de tus estudiantes'
                  : tutorInfo 
                    ? `Pregúntale a ${tutorInfo.firstName} cualquier duda que tengas` 
                    : 'Pregúntale a tu tutor cualquier duda que tengas'
                }
              </p>
            </div>
          ) : (
            <>
              {messages.map((message, index) => {
                const prevMessage = messages[index - 1];
                const showAvatar = !prevMessage ||
                  prevMessage.sender.id !== message.sender.id ||
                  (message.timestamp.getTime() - prevMessage.timestamp.getTime()) > 300000;
                return (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    showAvatar={showAvatar}
                  />
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        
        {/* ChatInput siempre visible */}
        <div className="flex-shrink-0 bg-dark-light border-t border-dark-border">
          <ChatInput
            onSendMessage={sendMessage}
            onSendCode={sendCodeMessage}
            onSendFile={sendFileMessage}
            placeholder={
              isCurrentUserTutor 
                ? "Responde a tu estudiante..."
                : tutorInfo 
                  ? `Escribe tu pregunta a ${tutorInfo.firstName}...` 
                  : "Escribe tu pregunta a tu tutor..."
            }
            disabled={!isConnected}
          />
        </div>
      </div>
      
      {/* Lista de usuarios - Solo Desktop */}
      <div className="hidden lg:flex lg:flex-col w-72 bg-dark-light rounded-lg shadow-lg overflow-hidden">
        <UsersList users={users} />
      </div>
    </div>
  );
};

export default ChatTab;
