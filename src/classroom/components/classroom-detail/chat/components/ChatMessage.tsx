import React from 'react'
import { FileText, Code, Download } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { ChatMessage as ChatMessageType } from '../hooks/useChat' 

interface ChatMessageProps {
  message: ChatMessageType
  showAvatar?: boolean
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isCurrentUser = message.sender.isCurrentUser
  const isTutor = message.sender.role === 'tutor'

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Mapear lenguajes a los nombres que soporta react-syntax-highlighter
  const getLanguageForHighlighter = (language: string | undefined): string => {
    if (!language) return 'text'
    
    const languageMap: Record<string, string> = {
      'javascript': 'javascript',
      'typescript': 'typescript',
      'python': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'csharp': 'csharp',
      'php': 'php',
      'html': 'markup',
      'css': 'css',
      'sql': 'sql',
      'json': 'json',
      'xml': 'xml',
      'bash': 'bash',
      'powershell': 'powershell',
      'ruby': 'ruby',
      'go': 'go',
      'rust': 'rust',
      'kotlin': 'kotlin',
      'swift': 'swift'
    }
    
    return languageMap[language.toLowerCase()] || language.toLowerCase()
  }
  const renderMessageContent = () => {
    switch (message.type) {        case 'code':
        return (
          <div className="bg-dark-light border border-dark-border rounded-lg overflow-hidden min-w-0 w-full max-w-full">
            <div className="flex items-center justify-between px-3 py-2 bg-dark-border border-b border-dark-border">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-primary" />
                <span className="text-xs text-light font-medium">
                  {message.codeLanguage || 'código'}
                </span>
              </div>
            </div>            
            <div className="max-h-96 overflow-auto scrollbar-thin">
              <SyntaxHighlighter
                language={getLanguageForHighlighter(message.codeLanguage)}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: '12px',
                  background: 'transparent',
                  fontSize: '13px',
                  lineHeight: '1.4',
                  maxWidth: '100%',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'break-word'
                }}
                wrapLines={true}
                wrapLongLines={true}
                showLineNumbers={false}
                lineProps={{
                  style: { 
                    wordWrap: 'break-word', 
                    whiteSpace: 'pre-wrap',
                    maxWidth: '100%'
                  }
                }}
              >
                {message.content}
              </SyntaxHighlighter>
            </div>
          </div>
        )
        case 'image':
        return (
          <div className="max-w-full">
            <img 
              src={message.fileUrl} 
              alt={message.fileName || 'Imagen'}
              className="rounded-lg max-w-full h-auto max-h-80 object-cover"
            />
            {message.fileName && (
              <p className="text-xs text-light-gray mt-1 truncate">{message.fileName}</p>
            )}
          </div>
        )
      
      case 'video':
        return (
          <div className="max-w-sm">
            <video 
              src={message.fileUrl} 
              controls
              className="rounded-lg max-w-full h-auto"
            >
              Tu navegador no soporta el elemento video.
            </video>
            {message.fileName && (
              <p className="text-xs text-light-gray mt-1">{message.fileName}</p>
            )}
          </div>
        )
      
      case 'document':
        return (
          <div className="flex items-center gap-3 p-3 bg-dark-light border border-dark-border rounded-lg min-w-[200px]">
            <div className="flex-shrink-0">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-light truncate">
                {message.fileName || 'Archivo'}
              </p>
              {message.fileSize && (
                <p className="text-xs text-light-gray">
                  {formatFileSize(message.fileSize)}
                </p>
              )}
            </div>
            <button
              onClick={() => message.fileUrl && window.open(message.fileUrl, '_blank')}
              className="flex-shrink-0 p-1 text-light-gray hover:text-primary transition-colors"
              title="Descargar archivo"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        )
      
      default:
        return (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        )
    }
  }

  const renderAvatar = () => {
    if (message.sender.avatar) {
      return (
        <img 
          src={message.sender.avatar} 
          alt={message.sender.name}
          className="w-8 h-8 rounded-full object-cover"
        />
      );
    } else {
      return (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          message.sender.role === 'tutor' 
            ? 'bg-primary text-light' 
            : 'bg-dark-light text-light'
        }`}>
          {message.sender.name.charAt(0).toUpperCase()}
        </div>
      );
    }
  };

  return (
    <div className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {renderAvatar()}
      
      <div className={`flex flex-col max-w-[70%] ${
        isCurrentUser ? 'items-end' : 'items-start'
      }`}>
        {!isCurrentUser && (
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium ${isTutor ? 'text-primary' : 'text-light'}`}>
              {message.sender.name}
            </span>
            {isTutor && (
              <span className="bg-primary text-light text-xs px-2 py-0.5 rounded-full font-medium">
                Tutor
              </span>
            )}
          </div>
        )}        <div className={`rounded-lg text-sm min-w-0 ${
          isCurrentUser
            ? 'bg-primary text-light shadow-sm'
            : isTutor
              ? 'bg-dark-border border border-dark-border text-light'
              : 'bg-dark-light text-light border border-dark-border'
        } ${message.type !== 'text' ? 'p-0 overflow-hidden' : 'px-3 py-2'}`}>
          {message.type === 'text' ? (
            <p className="whitespace-pre-wrap break-words hyphens-auto">{message.content}</p>
          ) : (
            renderMessageContent()
          )}
        </div>
          <span className="text-xs text-light-gray mt-1 opacity-75">
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage