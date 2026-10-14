import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { User, Conversation, Message, NotificationItem } from '../types';
import { currentUser as initialCurrentUser, initialUsers, initialConversations, initialNotifications } from '../data/mockData';

interface AppContextType {
  isLoggedIn: boolean;
  currentUser: User;
  conversations: Conversation[];
  contacts: User[];
  notifications: NotificationItem[];
  unreadConversationsCount: number;
  unreadNotificationsCount: number;
  
  // Settings
  notificationsEnabled: boolean;
  setNotificationsEnabled: (val: boolean) => void;
  onlineStatusVisible: boolean;
  setOnlineStatusVisible: (val: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  vibrationEnabled: boolean;
  setVibrationEnabled: (val: boolean) => void;

  // Actions
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  markConversationAsRead: (conversationId: string) => void;
  sendMessage: (conversationId: string, text: string) => void;
  startOrGetConversation: (userId: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser] = useState<User>(initialCurrentUser);
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [contacts] = useState<User[]>(initialUsers);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  // Settings states
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [onlineStatusVisible, setOnlineStatusVisible] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(false);

  // Login handler with empty validation
  const login = (username: string, password: string) => {
    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser && !trimmedPass) {
      return { success: false, error: 'Vui lòng nhập tài khoản và mật khẩu.' };
    }
    if (!trimmedUser) {
      return { success: false, error: 'Tài khoản không được để trống.' };
    }
    if (!trimmedPass) {
      return { success: false, error: 'Mật khẩu không được để trống.' };
    }

    setIsLoggedIn(true);
    return { success: true };
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  // Unread counts
  const unreadConversationsCount = useMemo(() => {
    return conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);
  }, [conversations]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((notif) => !notif.isRead).length;
  }, [notifications]);

  // Notification actions
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  // Conversation actions
  const markConversationAsRead = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((conv) => (conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv))
    );
  };

  const sendMessage = (conversationId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId: currentUser.id,
      text: trimmed,
      timestamp: timeStr,
      isMine: true,
    };

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            lastMessage: trimmed,
            lastMessageTime: timeStr,
            messages: [...conv.messages, newMessage],
          };
        }
        return conv;
      })
    );
  };

  const startOrGetConversation = (userId: string): string => {
    const existing = conversations.find((c) => c.user.id === userId);
    if (existing) {
      markConversationAsRead(existing.id);
      return existing.id;
    }

    const targetUser = contacts.find((u) => u.id === userId);
    if (!targetUser) return '';

    const newConvId = `conv_${Date.now()}`;
    const newConv: Conversation = {
      id: newConvId,
      user: targetUser,
      lastMessage: 'Bắt đầu cuộc trò chuyện mới',
      lastMessageTime: 'Vừa xong',
      unreadCount: 0,
      messages: [],
    };

    setConversations((prev) => [newConv, ...prev]);
    return newConvId;
  };

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        currentUser,
        conversations,
        contacts,
        notifications,
        unreadConversationsCount,
        unreadNotificationsCount,
        notificationsEnabled,
        setNotificationsEnabled,
        onlineStatusVisible,
        setOnlineStatusVisible,
        soundEnabled,
        setSoundEnabled,
        vibrationEnabled,
        setVibrationEnabled,
        login,
        logout,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        markConversationAsRead,
        sendMessage,
        startOrGetConversation,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
