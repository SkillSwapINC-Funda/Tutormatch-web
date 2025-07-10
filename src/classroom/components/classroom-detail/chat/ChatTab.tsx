import React from 'react';
import { Users } from 'lucide-react';
import ParticipantAvatar from './ParticipantAvatar';
import ChatMessageBubble from './ChatMessageBubble';

interface Participant {
  name: string;
  role: string;
  initials: string;
  status: string;
}

interface ChatMessage {
  id: number;
  sender: string;
  isCurrentUser: boolean;
  message: string;
  time: string;
  type: string;
}

interface ChatTabProps {
  participants: Participant[];
  chatMessages: ChatMessage[];
}

const ChatTab: React.FC<ChatTabProps> = ({ participants, chatMessages }) => (
  <div className="h-full flex flex-col">
    {/* Chat Header */}
    <div className="bg-dark-card p-4 rounded-lg mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-light font-semibold">Chat Privado</h3>
          <p className="text-light-gray text-sm">Sesión de tutoría 1 a 1 - Algoritmos y Estructura de datos</p>
        </div>
        <div className="flex items-center space-x-2 text-light-gray">
          <Users className="w-5 h-5" />
          <span className="text-sm">Participantes (2)</span>
        </div>
      </div>
    </div>
    {/* Participants sidebar */}
    <div className="bg-dark-card rounded-lg p-4 mb-4">
      <h4 className="text-light font-medium mb-3 flex items-center">
        <Users className="w-4 h-4 mr-2" />
        Participantes (2)
      </h4>
      <div className="space-y-2">
        <div className="text-sm text-light-gray">En línea (2)</div>
        {participants.map((participant, index) => (
          <div key={index} className="flex items-center space-x-3">
            <ParticipantAvatar name={participant.name} role={participant.role} initials={participant.initials} />
            <div>
              <div className="text-light text-sm font-medium">{participant.name}</div>
              {participant.role !== 'Tutor' && (
                <div className="text-light-gray text-xs">{participant.role}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
    {/* Code Display */}
    <div className="bg-dark-card rounded-lg p-4 mb-4 flex-1">
      <pre className="text-sm text-light font-mono overflow-x-auto">
        <code className="text-blue-400">while</code> <code className="text-light">left &lt;= right:</code>{'\n'}
        {'    '}<code className="text-light">mid = (left + right) // 2</code>{'\n'}
        {'\n'}
        {'    '}<code className="text-blue-400">if</code> <code className="text-light">arr[mid] == target:</code>{'\n'}
        {'        '}<code className="text-blue-400">return</code> <code className="text-light">mid</code>{'\n'}
        {'    '}<code className="text-blue-400">elif</code> <code className="text-light">arr[mid] &lt; target:</code>{'\n'}
        {'        '}<code className="text-light">left = mid + 1</code>{'\n'}
        {'    '}<code className="text-blue-400">else</code><code className="text-light">:</code>{'\n'}
        {'        '}<code className="text-light">right = mid - 1</code>{'\n'}
        {'\n'}
        <code className="text-blue-400">return</code> <code className="text-light">-1</code>{'\n'}
        {'\n'}
        <code className="text-green-500"># Ejemplo de uso</code>{'\n'}
        <code className="text-light">numbers = [1, 3, 5, 7, 9, 11, 13]</code>{'\n'}
        <code className="text-light">result = binary_search(numbers, 7)</code>{'\n'}
        <code className="text-light">print(f"Elemento encontrado en índice: {'{result}'}")</code>
      </pre>
      <div className="text-light-gray text-xs mt-2">10:52 a. m.</div>
    </div>
    {/* Messages */}
    <div className="space-y-4 mb-4">
      {chatMessages.map((message) => (
        <ChatMessageBubble
          key={message.id}
          sender={message.sender}
          isCurrentUser={message.isCurrentUser}
          message={message.message}
          time={message.time}
        />
      ))}
    </div>
    {/* Chat Input */}
    <div className="bg-dark-card rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <button className="p-2 text-light-gray hover:text-light transition-colors">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
          </svg>
        </button>
        <button className="p-2 text-light-gray hover:text-light transition-colors">
          {/* Adjuntar archivo */}
        </button>
        <button className="p-2 text-light-gray hover:text-light transition-colors">
          {/* Adjuntar otro */}
        </button>
        <button className="p-2 text-light-gray hover:text-light transition-colors">
          {/* Emoji o más */}
        </button>
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Escribe tu pregunta a tu tutor..."
          className="flex-1 bg-dark border border-dark-border rounded-lg px-4 py-2 text-light placeholder-light-gray focus:outline-none focus:border-primary"
        />
        <button className="bg-light-gray p-2 rounded-full hover:bg-light transition-colors">
          <svg className="w-5 h-5 text-dark" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
);

export default ChatTab;
