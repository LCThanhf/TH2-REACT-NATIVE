import {
  onDisconnect,
  onValue,
  ref,
  serverTimestamp,
  update,
} from 'firebase/database';
import { db } from './firebase';

/**
 * Quản lý trạng thái online/offline theo thời gian thực.
 *
 * Khi kết nối tới Realtime Database được thiết lập, đăng ký onDisconnect để
 * Firebase tự đánh dấu offline nếu ứng dụng bị tắt hoặc mất mạng.
 * Hàm trả về dùng để hủy lắng nghe khi unmount / đăng xuất.
 */
export const subscribePresence = (uid: string): (() => void) => {
  const connectedRef = ref(db, '.info/connected');
  const onlineRef = ref(db, `users/${uid}/isOnline`);
  const lastSeenRef = ref(db, `users/${uid}/lastSeen`);
  const userRef = ref(db, `users/${uid}`);

  const unsubscribe = onValue(connectedRef, (snapshot) => {
    if (snapshot.val() !== true) {
      return;
    }

    // Firebase sẽ tự chạy các lệnh này khi client mất kết nối.
    onDisconnect(onlineRef).set(false);
    onDisconnect(lastSeenRef).set(serverTimestamp());

    update(userRef, { isOnline: true }).catch(() => {});
  });

  return () => {
    unsubscribe();
    onDisconnect(onlineRef).cancel().catch(() => {});
    onDisconnect(lastSeenRef).cancel().catch(() => {});
    update(userRef, {
      isOnline: false,
      lastSeen: serverTimestamp(),
    }).catch(() => {});
  };
};

/** Chủ động đánh dấu offline (dùng khi tắt hiển thị trạng thái hoạt động). */
export const setPresenceOffline = async (uid: string): Promise<void> => {
  try {
    await update(ref(db, `users/${uid}`), {
      isOnline: false,
      lastSeen: serverTimestamp(),
    });
  } catch {
    // Bỏ qua lỗi mạng.
  }
};
