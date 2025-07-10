import React from 'react'
import { Users } from 'lucide-react'
import type { ChatUser } from '../hooks/useChat' 

interface UsersListProps {
  users: ChatUser[]
  className?: string
}

const UsersList: React.FC<UsersListProps> = ({ users, className = '' }) => {
  const onlineUsers = users.filter(user => user.isOnline)
  const offlineUsers = users.filter(user => !user.isOnline)
  return (
    <div className={`h-full flex flex-col bg-dark-card border-dark-border p-4 ${className}`}>      
    <div className="flex items-center gap-2 mb-4 flex-shrink-0">
        <Users className="w-5 h-5 text-light" />
        <h3 className="font-semibold text-light">
          Participantes ({users.length})
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Usuarios conectados */}
        {onlineUsers.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-light-gray mb-2">
              En línea ({onlineUsers.length})
            </h4>
          <div className="space-y-2">
            {onlineUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3">
                <div className="relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    user.role === 'tutor' 
                      ? 'bg-primary text-light' 
                      : 'bg-dark-light text-light'
                  }`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-dark-card rounded-full"></div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-light truncate">
                      {user.name}
                    </p>
                    {user.role === 'tutor' && (
                      <span className="bg-primary text-light text-xs px-1.5 py-0.5 rounded">
                        Tutor
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Usuarios desconectados */}
      {offlineUsers.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-light-gray mb-2">
            Desconectados ({offlineUsers.length})
          </h4>
          <div className="space-y-2">
            {offlineUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3 opacity-60">
                <div className="relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    user.role === 'tutor' 
                      ? 'bg-primary text-light' 
                      : 'bg-dark-light text-light'
                  }`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-light-gray border-2 border-dark-card rounded-full"></div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-light-gray truncate">
                      {user.name}
                    </p>
                    {user.role === 'tutor' && (
                      <span className="bg-light-gray text-dark text-xs px-1.5 py-0.5 rounded">
                        Tutor
                      </span>                    
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

export default UsersList