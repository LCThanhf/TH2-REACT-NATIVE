export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'online' | 'offline';
  /** Thời điểm hoạt động gần nhất (Unix ms) */
  lastSeen?: number;
  bio?: string;
}

export type MessageType = 'text' | 'location';

export interface Message {
  id: string;
  senderId: string;
  type: MessageType;
  text: string;
  latitude?: number;
  longitude?: number;
  /** Unix ms - lấy từ server timestamp của Firebase */
  createdAt: number;
  isMine: boolean;
}

export interface Conversation {
  /** Chính là chatId trên Realtime Database */
  id: string;
  /** Người còn lại trong cuộc trò chuyện */
  user: User;
  lastMessage: string;
  lastMessageType: MessageType;
  /** Unix ms */
  lastMessageAt: number | null;
  unreadCount: number;
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
  Register: undefined;
  MainTabs: undefined;
  ChatDetail: {
    /** chatId = `${uidA}_${uidB}` (đã sắp xếp) */
    conversationId: string;
    /** uid của người đang chat cùng */
    userId: string;
  };
};

export type MainTabParamList = {
  Home: undefined;
  Contacts: undefined;
  Notifications: undefined;
  Settings: undefined;
};
