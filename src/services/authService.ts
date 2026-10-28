import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { ref, serverTimestamp, set, update } from 'firebase/database';
import { auth, db } from './firebase';

export interface AuthResult {
  success: boolean;
  error?: string;
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'Email không hợp lệ.',
  'auth/user-disabled': 'Tài khoản này đã bị khóa.',
  'auth/user-not-found': 'Tài khoản không tồn tại.',
  'auth/wrong-password': 'Mật khẩu không đúng.',
  'auth/invalid-credential':
    'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.',
  'auth/invalid-login-credentials':
    'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.',
  'auth/email-already-in-use': 'Email này đã được đăng ký.',
  'auth/weak-password': 'Mật khẩu phải có ít nhất 6 ký tự.',
  'auth/missing-password': 'Vui lòng nhập mật khẩu.',
  'auth/too-many-requests':
    'Bạn đã thử quá nhiều lần. Vui lòng đợi một lúc rồi thử lại.',
  'auth/network-request-failed':
    'Không có kết nối mạng. Vui lòng kiểm tra lại đường truyền.',
  'auth/operation-not-allowed':
    'Phương thức đăng nhập Email/Mật khẩu chưa được bật trong Firebase.',
  'auth/invalid-api-key':
    'Cấu hình Firebase chưa đúng. Hãy kiểm tra src/services/firebaseConfig.ts.',
  'auth/configuration-not-found':
    'Chưa tìm thấy cấu hình Firebase. Hãy kiểm tra lại project Firebase.',
};

export const getAuthErrorMessage = (error: unknown): string => {
  const code = (error as { code?: string } | null)?.code;
  if (code && AUTH_ERROR_MESSAGES[code]) {
    return AUTH_ERROR_MESSAGES[code];
  }
  return 'Đã có lỗi xảy ra. Vui lòng thử lại.';
};

/** Đăng ký tài khoản mới và lưu hồ sơ người dùng vào Realtime Database. */
export const registerWithEmail = async (
  fullName: string,
  email: string,
  password: string,
): Promise<AuthResult> => {
  const name = fullName.trim();
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const credential = await createUserWithEmailAndPassword(
      auth,
      normalizedEmail,
      password,
    );

    await updateProfile(credential.user, { displayName: name });

    await set(ref(db, `users/${credential.user.uid}`), {
      uid: credential.user.uid,
      name,
      email: normalizedEmail,
      phone: '',
      bio: '',
      isOnline: true,
      lastSeen: serverTimestamp(),
      createdAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: getAuthErrorMessage(error) };
  }
};

/** Đăng nhập bằng Firebase Authentication. */
export const loginWithEmail = async (
  email: string,
  password: string,
): Promise<AuthResult> => {
  try {
    await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
    return { success: true };
  } catch (error) {
    return { success: false, error: getAuthErrorMessage(error) };
  }
};

/** Đánh dấu offline rồi đăng xuất khỏi Firebase. */
export const logoutFromFirebase = async (): Promise<void> => {
  const uid = auth.currentUser?.uid;

  if (uid) {
    // Không chờ vô hạn nếu thiết bị đang mất mạng.
    await Promise.race([
      update(ref(db, `users/${uid}`), {
        isOnline: false,
        lastSeen: serverTimestamp(),
      }).catch(() => undefined),
      new Promise<void>((resolve) => setTimeout(resolve, 800)),
    ]);
  }

  await signOut(auth);
};

/** Lắng nghe trạng thái đăng nhập của Firebase. */
export const subscribeAuthState = (
  onChanged: (user: FirebaseUser | null) => void,
): (() => void) => onAuthStateChanged(auth, onChanged);
