import { onValue, ref } from 'firebase/database';
import { db } from './firebase';
import { User } from '../types';

interface UserRecord {
  uid?: string;
  name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  isOnline?: boolean;
  lastSeen?: number;
}

/** Chuyển dữ liệu thô trong Realtime Database thành model User của app. */
export const mapUser = (uid: string, raw?: UserRecord | null): User => ({
  id: uid,
  name: raw?.name?.trim() || 'Người dùng',
  email: raw?.email || '',
  phone: raw?.phone || '',
  bio: raw?.bio || '',
  status: raw?.isOnline ? 'online' : 'offline',
  lastSeen: typeof raw?.lastSeen === 'number' ? raw.lastSeen : undefined,
});

/** Lắng nghe realtime danh sách người dùng (trừ chính mình). Trả về hàm hủy lắng nghe. */
export const subscribeContacts = (
  currentUid: string,
  onData: (contacts: User[]) => void,
  onError?: (error: Error) => void,
): (() => void) => {
  const usersRef = ref(db, 'users');

  return onValue(
    usersRef,
    (snapshot) => {
      const data = (snapshot.val() || {}) as Record<string, UserRecord>;
      const contacts = Object.keys(data)
        .filter((uid) => uid !== currentUid)
        .map((uid) => mapUser(uid, data[uid]))
        .sort((a, b) => a.name.localeCompare(b.name, 'vi'));

      onData(contacts);
    },
    (error) => onError?.(error),
  );
};

/** Lắng nghe realtime hồ sơ của một người dùng (trạng thái online, tên...). */
export const subscribeUserProfile = (
  uid: string,
  onData: (user: User | null) => void,
  onError?: (error: Error) => void,
): (() => void) => {
  const userRef = ref(db, `users/${uid}`);

  return onValue(
    userRef,
    (snapshot) => {
      const raw = snapshot.val() as UserRecord | null;
      onData(raw ? mapUser(uid, raw) : null);
    },
    (error) => onError?.(error),
  );
};
