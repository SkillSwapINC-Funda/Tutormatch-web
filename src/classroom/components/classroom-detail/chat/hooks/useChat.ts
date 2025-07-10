import { useState, useEffect, useCallback } from 'react'

export interface ChatMessage {
  id: string
  content: string
  timestamp: Date
  sender: {
    id: string
    name: string
    avatar?: string
    isCurrentUser: boolean
    role: 'student' | 'tutor'
  }
  type: 'text' | 'system' | 'code' | 'image' | 'video' | 'document'
  status?: 'sending' | 'sent' | 'delivered' | 'read'
  // Propiedades opcionales para diferentes tipos de contenido
  codeLanguage?: string
  fileName?: string
  fileSize?: number
  fileUrl?: string
}

export interface ChatUser {
  id: string
  name: string
  avatar?: string
  role: 'student' | 'tutor'
  isOnline: boolean
}

export const useChat = (classroomId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [users, setUsers] = useState<ChatUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser] = useState<ChatUser>({
    id: 'current-user',
    name: 'Estudiante Actual',
    role: 'student',
    isOnline: true
  })

  // Simular carga de datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true)
      
      // Simular delay de carga
      await new Promise(resolve => setTimeout(resolve, 1000))        // Datos mock - Chat 1 a 1 entre tutor y estudiante
      const mockUsers: ChatUser[] = [
        {
          id: 'tutor-1',
          name: 'Ana Martínez',
          role: 'tutor',
          isOnline: true
        },
        currentUser
      ]

      const mockMessages: ChatMessage[] = [
        {
          id: '1',
          content: '¡Hola! Soy tu tutora Ana. ¿En qué puedo ayudarte hoy?',
          timestamp: new Date(Date.now() - 3600000),
          sender: {
            id: 'tutor-1',
            name: 'Ana Martínez',
            isCurrentUser: false,
            role: 'tutor'
          },
          type: 'text',
          status: 'read'
        },
        {
          id: '2',
          content: 'Tengo algunas dudas sobre árboles binarios de búsqueda',
          timestamp: new Date(Date.now() - 3500000),
          sender: {
            id: currentUser.id,
            name: currentUser.name,
            isCurrentUser: true,
            role: 'student'
          },
          type: 'text',
          status: 'read'
        },        {
          id: '3',
          content: 'Perfect! Los árboles binarios son fundamentales. ¿Qué específicamente te gustaría revisar?',
          timestamp: new Date(Date.now() - 3400000),
          sender: {
            id: 'tutor-1',
            name: 'Ana Martínez',
            isCurrentUser: false,
            role: 'tutor'
          },
          type: 'text',
          status: 'read'
        },
        {
          id: '4',
          content: 'class TreeNode {\n  constructor(val, left = null, right = null) {\n    this.val = val;\n    this.left = left;\n    this.right = right;\n  }\n}\n\nclass BST {\n  constructor() {\n    this.root = null;\n  }\n\n  insert(val) {\n    this.root = this._insertNode(this.root, val);\n  }\n\n  _insertNode(node, val) {\n    if (!node) return new TreeNode(val);\n    \n    if (val < node.val) {\n      node.left = this._insertNode(node.left, val);\n    } else {\n      node.right = this._insertNode(node.right, val);\n    }\n    \n    return node;\n  }\n}',
          timestamp: new Date(Date.now() - 3300000),
          sender: {
            id: 'tutor-1',
            name: 'Ana Martínez',
            isCurrentUser: false,
            role: 'tutor'
          },          type: 'code',
          codeLanguage: 'javascript',
          status: 'read'
        },
        {
          id: '5',
          content: 'def binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    \n    while left <= right:\n        mid = (left + right) // 2\n        \n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    \n    return -1\n\n# Ejemplo de uso\nnumbers = [1, 3, 5, 7, 9, 11, 13]\nresult = binary_search(numbers, 7)\nprint(f"Elemento encontrado en índice: {result}")',
          timestamp: new Date(Date.now() - 3200000),
          sender: {
            id: 'tutor-1',
            name: 'Ana Martínez',
            isCurrentUser: false,
            role: 'tutor'
          },
          type: 'code',
          codeLanguage: 'python',
          status: 'read'
        },
        {
          id: '6',
          content: '¡Genial! Me gusta cómo explicas con ejemplos de código. ¿Podrías mostrarme también la implementación en TypeScript?',
          timestamp: new Date(Date.now() - 3100000),
          sender: {
            id: currentUser.id,
            name: currentUser.name,
            isCurrentUser: true,
            role: 'student'
          },
          type: 'text',
          status: 'read'
        }
      ]
      setUsers(mockUsers)
      setMessages(mockMessages)
      setIsLoading(false)
    }

    loadInitialData()
  }, [classroomId])

  const sendMessage = useCallback((content: string) => {
    if (!content.trim()) return

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: content.trim(),
      timestamp: new Date(),
      sender: {
        id: currentUser.id,
        name: currentUser.name,
        isCurrentUser: true,
        role: currentUser.role
      },
      type: 'text',
      status: 'sending'
    }

    setMessages(prev => [...prev, newMessage])

    // Simular progresión de estados del mensaje
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
      ))
      
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
        ))
        
        setTimeout(() => {
          setMessages(prev => prev.map(msg => 
            msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
          ))
        }, 1000)
      }, 500)
    }, 200)
  }, [currentUser])

  const sendCodeMessage = useCallback((code: string, language: string) => {
    if (!code.trim()) return

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: code.trim(),
      timestamp: new Date(),
      sender: {
        id: currentUser.id,
        name: currentUser.name,
        isCurrentUser: true,
        role: currentUser.role
      },
      type: 'code',
      codeLanguage: language,
      status: 'sending'
    }

    setMessages(prev => [...prev, newMessage])

    // Simular progresión de estados del mensaje
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
      ))
    }, 200)
  }, [currentUser])

  const sendFileMessage = useCallback((file: File, type: 'image' | 'video' | 'document') => {
    const fileUrl = URL.createObjectURL(file)
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: file.name,
      timestamp: new Date(),
      sender: {
        id: currentUser.id,
        name: currentUser.name,
        isCurrentUser: true,
        role: currentUser.role
      },
      type: type,
      fileName: file.name,
      fileSize: file.size,
      fileUrl: fileUrl,
      status: 'sending'
    }

    setMessages(prev => [...prev, newMessage])

    // Simular progresión de estados del mensaje
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
      ))
    }, 200)
  }, [currentUser])

  return {
    messages,
    users,
    currentUser,
    isLoading,
    sendMessage,
    sendCodeMessage,
    sendFileMessage
  }
}