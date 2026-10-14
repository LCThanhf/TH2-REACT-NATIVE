export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'online' | 'offline';
  lastSeen?: string;
  bio?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: string;
  isMine: boolean;
}

export interface Conversation {
  id: string;
  user: User;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  time: string;
  isRead: boolean;
  type: 'message' | 'system' | 'friend';
}

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  ChatDetail: { conversationId: string; userId?: string };
};

export type MainTabParamList = {
  Home: undefined;
  Contacts: undefined;
  Notifications: undefined;
  Settings: undefined;
};
