# Hướng dẫn cấu hình Firebase cho UDU Chat

Ứng dụng đã được chuyển từ dữ liệu mẫu sang Firebase Realtime Database + Firebase Authentication.
Phần còn lại bạn cần làm là tạo project Firebase và dán cấu hình vào code (không thể tạo project thay bạn vì cần tài khoản Google).

## 1. Tạo project Firebase

1. Mở <https://console.firebase.google.com> → **Add project** → đặt tên (ví dụ `udu-chat`) → tạo project.
2. Vào **Build → Authentication → Get started**.
3. Tab **Sign-in method** → bật **Email/Password** → Save.
4. Vào **Build → Realtime Database → Create Database**.
   - Chọn region gần bạn (ví dụ `asia-southeast1`).
   - Chọn **Start in locked mode** (sẽ dán luật bảo mật ở bước 4).
5. Vào **Project settings** (biểu tượng bánh răng) → **General** → kéo xuống **Your apps**.
6. Bấm biểu tượng **Web** (`</>`) → đặt nickname → **Register app**.
7. Copy đoạn `firebaseConfig` hiển thị trên màn hình.

> Ứng dụng dùng Firebase JS SDK nên chỉ cần "Web app". Không cần `google-services.json`
> hay `GoogleService-Info.plist`.

## 2. Dán cấu hình vào project

> ⚠️ **Không commit cấu hình thật.** `src/services/firebaseConfig.ts` đã nằm
> trong `.gitignore`. Chỉ file mẫu `src/services/firebaseConfig.example.ts`
> được đưa lên git.

Tạo file cấu hình local từ file mẫu:

```sh
# Windows (PowerShell)
Copy-Item src/services/firebaseConfig.example.ts src/services/firebaseConfig.ts

# macOS / Linux
cp src/services/firebaseConfig.example.ts src/services/firebaseConfig.ts
```

Mở `src/services/firebaseConfig.ts` vừa tạo và thay các giá trị mẫu:

```ts
export const firebaseConfig = {
  apiKey: '...',
  authDomain: 'udu-chat.firebaseapp.com',
  databaseURL:
    'https://udu-chat-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'udu-chat',
  storageBucket: 'udu-chat.firebasestorage.app',
  messagingSenderId: '...',
  appId: '...',
};
```

`databaseURL` lấy ở trang **Realtime Database** (phần đầu trang, dạng
`https://<project-id>-default-rtdb.<region>.firebasedatabase.app`).

### Bảo vệ API key trên Google Cloud

Firebase web API key không phải "secret" (nó luôn có trong bundle app), nên
hãy giới hạn phạm vi sử dụng của nó:

1. Mở <https://console.cloud.google.com/apis/credentials> → chọn API key của project.
2. **Application restrictions**: chọn *Android apps* / *iOS apps* (thêm package name
   `com.myreactnativeapp` + SHA-1) hoặc *HTTP referrers* nếu có web.
3. **API restrictions**: chỉ cho phép các API cần dùng (Identity Toolkit API,
   Firebase Realtime Database API, Token Service API...).
4. Bật **Firebase App Check** cho Realtime Database và Authentication.

Sau khi sửa, khởi động lại Metro:

```sh
npm start -- --reset-cache
```

## 3. Áp dụng luật bảo mật

Luật đã được viết sẵn trong `database.rules.json`, khớp với cấu trúc dữ liệu của app:

- `users/{uid}`: mọi người dùng đã đăng nhập được đọc (để hiện danh bạ), chỉ chủ tài khoản được ghi.
- `chats/{chatId}`: chỉ 2 người trong cuộc trò chuyện được đọc/ghi.
- `userChats/{uid}`: chỉ chủ tài khoản được đọc; người trong cuộc trò chuyện được ghi
  (để tăng số tin chưa đọc cho người nhận).

Cách áp dụng (chọn 1 trong 2):

**Cách A – dán trực tiếp trên Console**

1. **Realtime Database → Rules**.
2. Dán toàn bộ nội dung `database.rules.json`.
3. Bấm **Publish**.

**Cách B – dùng Firebase CLI**

```sh
npm install -g firebase-tools
firebase login
firebase use --add          # chọn project vừa tạo
firebase deploy --only database
```

> Nếu giảng viên/đề bài cung cấp bộ luật khác, hãy thay thế nội dung
> `database.rules.json` bằng bộ luật đó, miễn là vẫn cho phép các đường dẫn trên.

## 4. Cài đặt và build lại app

Các thư viện native mới đã được thêm vào `package.json`:

- `firebase` (Auth + Realtime Database)
- `@react-native-community/geolocation`
- `@react-native-async-storage/async-storage` (giữ đăng nhập sau khi tắt app)

Vì có native module mới, cần **build lại** ứng dụng (không chỉ reload JS):

```sh
npm install
npm run android
```

iOS (chỉ trên macOS):

```sh
cd ios && bundle exec pod install && cd ..
npm run ios
```

Quyền vị trí đã được khai báo sẵn:

- Android: `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION` trong `AndroidManifest.xml`.
- iOS: `NSLocationWhenInUseUsageDescription` trong `Info.plist`.

## 5. Kiểm thử 2 người nhắn tin

1. Chạy app trên 2 thiết bị/máy ảo khác nhau (hoặc 1 máy thật + 1 máy ảo).
2. Đăng ký 2 tài khoản khác nhau (ví dụ `a@test.com`, `b@test.com`).
3. Tài khoản A vào **Danh bạ** → thấy tài khoản B (kèm trạng thái online) → bấm **Nhắn tin**.
4. Gửi tin nhắn văn bản, bấm **📍** để gửi vị trí.
5. Kiểm tra:
   - Tin nhắn hiện ngay ở máy B, không cần reload.
   - Tin của mình bên phải, của người kia bên trái, có giờ.
   - Danh sách **Đoạn chat** tự sắp xếp cuộc mới nhất lên đầu, badge chưa đọc tăng/giảm.
   - Thanh tiêu đề đổi trạng thái online/offline realtime khi tắt/mở app bên kia.
   - Bấm vào tin nhắn vị trí mở Google Maps đúng toạ độ.
6. Vào **Cài đặt → Đăng xuất** → quay về màn hình Đăng nhập.

## 6. Cấu trúc dữ liệu trên Realtime Database

```text
users/{uid}
  uid, name, email, phone, bio, isOnline, lastSeen, createdAt

chats/{chatId}                     # chatId = uidA_uidB (đã sắp xếp)
  meta/
    participants/{uidA}: true
    participants/{uidB}: true
    lastMessage, lastMessageType, lastMessageAt, updatedAt
  messages/{messageId}
    senderId, type ('text' | 'location'), text, createdAt
    latitude, longitude            # chỉ có với tin vị trí

userChats/{uid}/{chatId}           # bản tóm tắt để hiện danh sách hội thoại
  chatId, otherUid, lastMessage, lastMessageType, lastMessageAt, unreadCount
```

## 7. Lỗi thường gặp

| Hiện tượng | Nguyên nhân / cách xử lý |
| --- | --- |
| `Unable to resolve module ./firebaseConfig` | Chưa tạo file local. Chạy `cp src/services/firebaseConfig.example.ts src/services/firebaseConfig.ts` (PowerShell: `Copy-Item ...`). |
| `auth/invalid-api-key` | Chưa thay cấu hình trong `src/services/firebaseConfig.ts`, hoặc Metro đang cache. Chạy `npm start -- --reset-cache`. |
| `auth/operation-not-allowed` | Chưa bật Email/Password trong Firebase Authentication. |
| `PERMISSION_DENIED` khi tải chat | Chưa Publish `database.rules.json`, hoặc rules không khớp cấu trúc. |
| Không thấy người dùng khác trong Danh bạ | Tài khoản kia chưa đăng ký, hoặc chưa đăng nhập lần nào để tạo node `users/{uid}`. |
| Đăng nhập lại mỗi lần mở app | Chưa build lại native sau khi cài `@react-native-async-storage/async-storage`. |
| Thanh tab báo lỗi đỏ | Chạy lại `npx tsc --noEmit` và `npm start -- --reset-cache`; đảm bảo đã `npm install`. |
