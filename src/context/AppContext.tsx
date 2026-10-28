import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User as FirebaseUser } from 'firebase/auth';

import {
  loginWithEmail,
  logoutFromFirebase,
  registerWithEmail,
  subscribeAuthState,
  type AuthResult,
} from '../services/authService';
import {
  markChatAsRead,
  subscribeInbox,
  type InboxEntry,
} from '../services/chatService';
import {
  setPresenceOffline,
  subscribePresence,
} from '../services/presenceService';
import { subscribeContacts, subscribeUserProfile } from '../services/userService';
import {
  Conversation,
  NotificationItem,
  User,
} from '../types';
import { initialNotifications } from '../data/mockData';

interface AppContextType {
  isLoggedIn: boolean;
  initializing: boolean;
  currentUser: User | null;
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
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (
    fullName: string,
    email: string,
    password: string,
  ) => Promise<AuthResult>;
  logout: () => Promise<void>;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  markConversationAsRead: (chatId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const buildFallbackUser = (firebaseUser: FirebaseUser): User => ({
  id: firebaseUser.uid,
  name:
    firebaseUser.displayName?.trim() ||
    firebaseUser.email?.split('@')[0] ||
    'Người dùng',
  email: firebaseUser.email || '',
  status: 'online',
});

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [initializing, setInitializing] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [contacts, setContacts] = useState<User[]>([]);
  const [inbox, setInbox] = useState<InboxEntry[]>([]);
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);

  // Settings states
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [onlineStatusVisible, setOnlineStatusVisible] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(false);

  // 1. Theo dõi trạng thái đăng nhập của Firebase
  useEffect(() => {
    const unsubscribe = subscribeAuthState((user) => {
      setFirebaseUser(user);
      setInitializing(false);
      if (!user) {
        setCurrentUser(null);
      }
    });

    return unsubscribe;
  }, []);

  // 2. Lắng nghe hồ sơ realtime của người dùng hiện tại
  useEffect(() => {
    const uid = firebaseUser?.uid;

    if (!firebaseUser || !uid) {
      setCurrentUser(null);
      return;
    }

    // Hiển thị ngay thông tin từ Auth, sau đó cập nhật khi DB trả về.
    setCurrentUser((prev) =>
      prev?.id === uid ? prev : buildFallbackUser(firebaseUser),
    );

    const unsubscribe = subscribeUserProfile(uid, (user) => {
      if (user) {
        setCurrentUser({ ...user, status: 'online' });
      }
    });

    return unsubscribe;
  }, [firebaseUser]);

  // 3. Cập nhật trạng thái online/offline theo thời gian thực
  useEffect(() => {
    const uid = firebaseUser?.uid;
    if (!uid) {
      return;
    }

    if (!onlineStatusVisible) {
      setPresenceOffline(uid);
      return;
    }

    return subscribePresence(uid);
  }, [firebaseUser?.uid, onlineStatusVisible]);

  // 4. Lắng nghe danh bạ + danh sách hội thoại realtime
  useEffect(() => {
    const uid = firebaseUser?.uid;

    if (!uid) {
      setContacts([]);
      setInbox([]);
      return;
    }

    const unsubscribeContacts = subscribeContacts(uid, setContacts);
    const unsubscribeInbox = subscribeInbox(uid, setInbox);

    // Hủy toàn bộ listener khi đăng xuất / unmount để tránh rò rỉ & trùng tin.
    return () => {
      unsubscribeContacts();
      unsubscribeInbox();
    };
  }, [firebaseUser?.uid]);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (!email.trim() && !password) {
        return {
          success: false,
          error: 'Vui lòng nhập email và mật khẩu.',
        };
      }
      if (!email.trim()) {
        return { success: false, error: 'Email không được để trống.' };
      }
      if (!password) {
        return { success: false, error: 'Mật khẩu không được để trống.' };
      }

      return loginWithEmail(email, password);
    },
    [],
  );

  const register = useCallback(
    async (
      fullName: string,
      email: string,
      password: string,
    ): Promise<AuthResult> => registerWithEmail(fullName, email, password),
    [],
  );

  const logout = useCallback(async (): Promise<void> => {
    await logoutFromFirebase();
    setInbox([]);
    setContacts([]);
    setCurrentUser(null);
  }, []);

  const markConversationAsRead = useCallback(
    (chatId: string) => {
      const uid = firebaseUser?.uid;
      if (!uid) {
        return;
      }

      // Cập nhật lạc quan để badge biến mất ngay, listener sẽ đồng bộ lại.
      setInbox((prev) =>
        prev.map((entry) =>
          entry.chatId === chatId ? { ...entry, unreadCount: 0 } : entry,
        ),
      );
      markChatAsRead(uid, chatId);
    },
    [firebaseUser?.uid],
  );

  const conversations = useMemo<Conversation[]>(() => {
    return inbox
      .map((entry) => {
        const knownUser = contacts.find((item) => item.id === entry.otherUid);
        const user: User =
          knownUser ??
          ({
            id: entry.otherUid,
            name: 'Người dùng',
            email: '',
            status: 'offline',
          } as User);

        return {
          id: entry.chatId,
          user,
          lastMessage: entry.lastMessage,
          lastMessageType: entry.lastMessageType,
          lastMessageAt: entry.lastMessageAt || null,
          unreadCount: entry.unreadCount,
        };
      })
      .sort((a, b) => (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0));
  }, [inbox, contacts]);

  const unreadConversationsCount = useMemo(
    () => conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0),
    [conversations],
  );

  const unreadNotificationsCount = useMemo(
    () => notifications.filter((notif) => !notif.isRead).length,
    [notifications],
  );

  // Notification actions (màn hình Thông báo giữ nguyên dữ liệu mẫu)
  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
    );
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return (
    <AppContext.Provider
      value={{
        isLoggedIn: Boolean(firebaseUser),
        initializing,
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
        register,
        logout,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        markConversationAsRead,
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
