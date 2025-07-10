import React from 'react';

interface MessageProps {
  sender: string;
  isCurrentUser: boolean;
  message: string;
  time: string;
}

const ChatMessageBubble: React.FC<MessageProps> = ({ sender, isCurrentUser, message, time }) => (
  <div className={`flex items-start space-x-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-light text-sm font-medium">
      {sender[0]}
    </div>
    <div className="flex-1">
      <div className={`rounded-lg p-3 max-w-md ${isCurrentUser ? 'bg-primary text-light ml-auto' : 'bg-primary text-light'}`}>{message}</div>
      <div className="text-light-gray text-xs mt-1 flex items-center">
        <span className="mr-2">{time}</span>
        <span className="text-light">{isCurrentUser ? 'Tú' : sender[0]}</span>
      </div>
    </div>
  </div>
);

export default ChatMessageBubble;
