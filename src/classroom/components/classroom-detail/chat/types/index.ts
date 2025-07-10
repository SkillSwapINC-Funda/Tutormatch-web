export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userRole: 'student' | 'tutor';
  message: string;
  timestamp: Date;
  type: 'text' | 'file' | 'system' | 'code' | 'image' | 'video';
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  codeLanguage?: string;
}

export interface ChatUser {
  id: string;
  name: string;
  role: 'student' | 'tutor';
  avatar?: string;
  isOnline: boolean;
}