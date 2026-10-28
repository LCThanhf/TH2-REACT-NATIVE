import {
  increment,
  onValue,
  push,
  ref,
  serverTimestamp,
  set,
  update,
} from 'firebase/database';
import { db } from './firebase';
import { Message, MessageType } from '../types';

export interface InboxEntry {
  chatId: string;
  otherUid: string;
  lastMessage: string;
  lastMessageType: MessageType;
  lastMessageAt: number;
  unreadCount: number;
}

interface RawMessage {
  senderId?: string;
  type?: string;
  text?: string;
  latitude?: number;
  longitude?: number;
  createdAt?: number;
}

interface RawInboxEntry {
  otherUid?: string;
  lastMessage?: string;
  lastMessageType?: string;
  lastMessageAt?: number;
  unreadCount?: number;
}

/** chatId ổn định cho cả 2 người: uid nhỏ hơn đứng trước. */
export const buildChatId = (uidA: string, uidB: string): string =>
  [uidA, uidB].sort().join('_');

/**
 * Tạo (hoặc đảm bảo đã tồn tại) node chat + participants.
 * Cần gọi trước khi đọc/ghi tin nhắn để khớp với luật bảo mật.
 */
export const ensureChat = async (
  chatId: string,
  uidA: string,
  uidB: string,
): Promise<void> => {
  await update(ref(db, `chats/${chatId}/meta/participants`), {
    [uidA]: true,
    [uidB]: true,
  });
};

/** Lắng nghe realtime danh sách hội thoại của một người dùng. */
export const subscribeInbox = (
  uid: string,
  onData: (entries: InboxEntry[]) => void,
  onError?: (error: Error) => void,
): (() => void) => {
  return onValue(
    ref(db, `userChats/${uid}`),
    (snapshot) => {
      const data = (snapshot.val() || {}) as Record<string, RawInboxEntry>;
      const entries: InboxEntry[] = Object.keys(data)
        .map<InboxEntry>((chatId) => {
          const raw = data[chatId] || {};
          return {
            chatId,
            otherUid: raw.otherUid || '',
            lastMessage: raw.lastMessage || '',
            lastMessageType:
              raw.lastMessageType === 'location' ? 'location' : 'text',
            lastMessageAt:
              typeof raw.lastMessageAt === 'number' ? raw.lastMessageAt : 0,
            unreadCount:
              typeof raw.unreadCount === 'number' ? raw.unreadCount : 0,
          };
        })
        .filter((entry) => Boolean(entry.otherUid));

      onData(entries);
    },
    (error) => onError?.(error),
  );
};

/** Lắng nghe realtime tin nhắn của một cuộc trò chuyện (đã sắp xếp theo thời gian). */
export const subscribeMessages = (
  chatId: string,
  currentUid: string,
  onData: (messages: Message[]) => void,
  onError?: (error: Error) => void,
): (() => void) => {
  return onValue(
    ref(db, `chats/${chatId}/messages`),
    (snapshot) => {
      const data = (snapshot.val() || {}) as Record<string, RawMessage>;
      const messages = Object.keys(data)
        .map<Message>((id) => {
          const raw = data[id];
          return {
            id,
            senderId: raw.senderId || '',
            type: raw.type === 'location' ? 'location' : 'text',
            text: raw.text || '',
            latitude: raw.latitude,
            longitude: raw.longitude,
            createdAt:
              typeof raw.createdAt === 'number' ? raw.createdAt : 0,
            isMine: raw.senderId === currentUid,
          };
        })
        .sort((a, b) => a.createdAt - b.createdAt);

      onData(messages);
    },
    (error) => onError?.(error),
  );
};

const buildInboxUpdate = (
  chatId: string,
  otherUid: string,
  lastMessage: string,
  lastMessageType: MessageType,
  unreadCount: number | object,
) => ({
  chatId,
  otherUid,
  lastMessage,
  lastMessageType,
  lastMessageAt: serverTimestamp(),
  unreadCount,
});

/** Gửi tin nhắn văn bản realtime tới người còn lại. */
export const sendTextMessage = async (
  chatId: string,
  senderId: string,
  receiverId: string,
  text: string,
): Promise<void> => {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('EMPTY_MESSAGE');
  }

  await ensureChat(chatId, senderId, receiverId);

  const messageRef = push(ref(db, `chats/${chatId}/messages`));
  const messageKey = messageRef.key;
  if (!messageKey) {
    throw new Error('CANNOT_CREATE_MESSAGE');
  }

  await update(ref(db), {
    [`chats/${chatId}/messages/${messageKey}`]: {
      senderId,
      type: 'text',
      text: trimmed,
      createdAt: serverTimestamp(),
    },
    [`chats/${chatId}/meta/lastMessage`]: trimmed,
    [`chats/${chatId}/meta/lastMessageType`]: 'text',
    [`chats/${chatId}/meta/lastMessageAt`]: serverTimestamp(),
    [`chats/${chatId}/meta/updatedAt`]: serverTimestamp(),
    [`userChats/${senderId}/${chatId}`]: buildInboxUpdate(
      chatId,
      receiverId,
      trimmed,
      'text',
      0,
    ),
    [`userChats/${receiverId}/${chatId}`]: buildInboxUpdate(
      chatId,
      senderId,
      trimmed,
      'text',
      increment(1),
    ),
  });
};

/** Gửi tin nhắn vị trí realtime tới người còn lại. */
export const sendLocationMessage = async (
  chatId: string,
  senderId: string,
  receiverId: string,
  latitude: number,
  longitude: number,
): Promise<void> => {
  await ensureChat(chatId, senderId, receiverId);

  const messageRef = push(ref(db, `chats/${chatId}/messages`));
  const messageKey = messageRef.key;
  if (!messageKey) {
    throw new Error('CANNOT_CREATE_MESSAGE');
  }

  const preview = '📍 Vị trí đã chia sẻ';

  await update(ref(db), {
    [`chats/${chatId}/messages/${messageKey}`]: {
      senderId,
      type: 'location',
      text: 'Vị trí đã chia sẻ',
      latitude,
      longitude,
      createdAt: serverTimestamp(),
    },
    [`chats/${chatId}/meta/lastMessage`]: preview,
    [`chats/${chatId}/meta/lastMessageType`]: 'location',
    [`chats/${chatId}/meta/lastMessageAt`]: serverTimestamp(),
    [`chats/${chatId}/meta/updatedAt`]: serverTimestamp(),
    [`userChats/${senderId}/${chatId}`]: buildInboxUpdate(
      chatId,
      receiverId,
      preview,
      'location',
      0,
    ),
    [`userChats/${receiverId}/${chatId}`]: buildInboxUpdate(
      chatId,
      senderId,
      preview,
      'location',
      increment(1),
    ),
  });
};

/** Đặt số tin chưa đọc của cuộc trò chuyện về 0. */
export const markChatAsRead = async (
  uid: string,
  chatId: string,
): Promise<void> => {
  try {
    await set(ref(db, `userChats/${uid}/${chatId}/unreadCount`), 0);
  } catch {
    // Không làm gián đoạn UI nếu ghi thất bại.
  }
};
