const pad = (value: number): string => value.toString().padStart(2, '0');

const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** Giờ của một tin nhắn: "10:45", "Hôm qua 10:45" hoặc "12/03 10:45". */
export const formatMessageTime = (timestamp?: number | null): string => {
  if (!timestamp) {
    return '';
  }

  const date = new Date(timestamp);
  const now = new Date();

  if (isSameDay(date, now)) {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(date, yesterday)) {
    return `Hôm qua ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  return `${pad(date.getDate())}/${pad(
    date.getMonth() + 1,
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

/** Thời gian hiển thị ở danh sách hội thoại (giống các app chat phổ biến). */
export const formatConversationTime = (timestamp?: number | null): string => {
  if (!timestamp) {
    return '';
  }

  const date = new Date(timestamp);
  const now = new Date();

  if (isSameDay(date, now)) {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(date, yesterday)) {
    return 'Hôm qua';
  }

  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (24 * 60 * 60 * 1000),
  );
  if (diffDays < 7) {
    const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return weekdays[date.getDay()];
  }

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
};

/** "vừa xong", "5 phút trước", "2 giờ trước", "Hôm qua"... */
export const formatLastSeen = (timestamp?: number | null): string => {
  if (!timestamp) {
    return 'Ngoại tuyến';
  }

  const diff = Date.now() - timestamp;
  if (diff < 60 * 1000) {
    return 'vừa xong';
  }
  if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))} phút trước`;
  }
  if (diff < 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 60 * 1000))} giờ trước`;
  }
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (24 * 60 * 60 * 1000))} ngày trước`;
  }

  const date = new Date(timestamp);
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
};
