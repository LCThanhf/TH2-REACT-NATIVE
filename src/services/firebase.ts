import { getApp, getApps, initializeApp } from 'firebase/app';
import * as FirebaseAuth from 'firebase/auth';
import { getAuth, initializeAuth } from 'firebase/auth';
import type { Auth, Persistence } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { createAsyncStorage } from '@react-native-async-storage/async-storage';

import { firebaseConfig } from './firebaseConfig';

/**
 * Khởi tạo Firebase một lần duy nhất cho toàn bộ ứng dụng.
 * Toàn bộ code Firebase được gom trong thư mục src/services/.
 */
export const app =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

/**
 * getReactNativePersistence chỉ tồn tại trong bản build React Native của
 * Firebase JS SDK. Typings công khai của package chưa khai báo hàm này,
 * nên ta đọc qua một kiểu bổ sung (vẫn được Metro resolve đúng ở runtime).
 */
const getReactNativePersistence = (
  FirebaseAuth as unknown as {
    getReactNativePersistence?: (storage: unknown) => Persistence;
  }
).getReactNativePersistence;

/**
 * initializeAuth + AsyncStorage giúp giữ đăng nhập sau khi tắt ứng dụng.
 * Nếu auth đã được khởi tạo (Fast Refresh) hoặc thiếu hàm persistence,
 * dùng getAuth để lấy instance hiện có.
 */
const createAuth = (): Auth => {
  try {
    if (getReactNativePersistence) {
      const storage = createAsyncStorage('udu-chat-auth');
      return initializeAuth(app, {
        persistence: getReactNativePersistence(storage),
      });
    }

    return getAuth(app);
  } catch {
    return getAuth(app);
  }
};

export const auth = createAuth();

export const db = getDatabase(app);
