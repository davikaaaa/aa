export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  isAdmin: boolean;
  isApproved: boolean;
  createdAt: number;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  imageUrl?: string;
  createdAt: number;
  isRead: boolean;
}

export interface RegistrationRequest {
  uid: string;
  email: string;
  message: string;
  createdAt: number;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ConversationInfo {
  userId: string;
  displayName: string | null;
  lastMessage?: string;
  lastMessageTime?: number;
  unreadCount: number;
  photoURL: string | null;
}