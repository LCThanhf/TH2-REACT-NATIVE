import { NotificationItem } from '../types';

/**
 * Màn hình Thông báo được giữ nguyên theo project cũ.
 * Danh sách hội thoại / danh bạ / tin nhắn đều đã chuyển sang Firebase realtime.
 */
export const initialNotifications: NotificationItem[] = [
  {
    id: 'notif_1',
    title: 'Tin nhắn mới từ Nguyễn Minh Tuấn',
    content: 'Bạn đã xem bản thiết kế giao diện màn hình chat mới chưa?',
    time: '10 phút trước',
    isRead: false,
    type: 'message',
  },
  {
    id: 'notif_2',
    title: 'Lời mời kết nối mới',
    content: 'Đỗ Mỹ Linh đã lưu số điện thoại của bạn vào danh bạ.',
    time: '45 phút trước',
    isRead: false,
    type: 'friend',
  },
  {
    id: 'notif_3',
    title: 'Bảo mật tài khoản',
    content: 'Phát hiện đăng nhập thành công từ thiết bị di động mới.',
    time: '2 giờ trước',
    isRead: false,
    type: 'system',
  },
  {
    id: 'notif_4',
    title: 'Cập nhật hệ thống v1.0.2',
    content: 'Ứng dụng đã được nâng cấp hiệu năng và sửa lỗi thông báo.',
    time: 'Hôm qua',
    isRead: true,
    type: 'system',
  },
  {
    id: 'notif_5',
    title: 'Hoàng Bích Phương đã gửi phản hồi',
    content: 'Đã hoàn tất báo cáo kiểm thử tính năng chat trực tuyến.',
    time: '2 ngày trước',
    isRead: true,
    type: 'message',
  },
];
