/**
 * MẪU cấu hình Firebase của ứng dụng UDU Chat.
 *
 * CÁCH DÙNG:
 *   1. Copy file này thành `src/services/firebaseConfig.ts`
 *   2. Điền các giá trị thật lấy từ Firebase Console:
 *      Project settings (bánh răng) -> General -> Your apps
 *      -> chọn ứng dụng Web (</>) -> SDK setup and configuration
 *
 * Lưu ý: `src/services/firebaseConfig.ts` đã nằm trong .gitignore và
 * KHÔNG được commit. Không bao giờ đưa key/cấu hình thật vào file mẫu này.
 *
 * React Native dùng Firebase JS SDK nên cần tạo "Web app" trong Firebase,
 * KHÔNG cần file google-services.json / GoogleService-Info.plist.
 *
 * Sau khi điền xong, khởi động lại Metro với `npm start -- --reset-cache`.
 */
export const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  databaseURL:
    'https://YOUR_PROJECT_ID-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.firebasestorage.app',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

/** true khi người dùng đã thay các giá trị mẫu bằng cấu hình Firebase thật. */
export const isFirebaseConfigured =
  !firebaseConfig.apiKey.startsWith('YOUR_') &&
  !firebaseConfig.projectId.startsWith('YOUR_') &&
  !firebaseConfig.databaseURL.includes('YOUR_PROJECT_ID');
