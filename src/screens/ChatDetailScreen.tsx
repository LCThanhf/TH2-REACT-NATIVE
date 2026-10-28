import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useApp } from '../context/AppContext';
import { UserAvatar } from '../components/UserAvatar';
import { Message, RootStackParamList, User } from '../types';
import {
  ensureChat,
  sendLocationMessage,
  sendTextMessage,
  subscribeMessages,
} from '../services/chatService';
import { subscribeUserProfile } from '../services/userService';
import { formatLastSeen, formatMessageTime } from '../utils/format';
import {
  getCurrentLocation,
  requestLocationPermission,
} from '../utils/location';

type ChatDetailRouteProp = RouteProp<RootStackParamList, 'ChatDetail'>;
type ChatDetailNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ChatDetailScreen: React.FC = () => {
  const route = useRoute<ChatDetailRouteProp>();
  const navigation = useNavigation<ChatDetailNavigationProp>();
  const { conversationId, userId } = route.params;

  const { currentUser, markConversationAsRead } = useApp();
  const currentUid = currentUser?.id;
  const [inputText, setInputText] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [chatError, setChatError] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isSendingLocation, setIsSendingLocation] =
    useState<boolean>(false);

  const flatListRef = useRef<FlatList<Message>>(null);

  // Hồ sơ realtime của người đang chat cùng (tên + online/offline)
  useEffect(() => {
    const unsubscribe = subscribeUserProfile(userId, setOtherUser);
    return unsubscribe;
  }, [userId]);

  // Đảm bảo node chat tồn tại rồi lắng nghe tin nhắn realtime.
  // Listener được hủy trong cleanup để không bị trùng tin khi mở lại màn hình.
  useEffect(() => {
    if (!currentUid) {
      return;
    }

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    setIsLoading(true);
    setChatError('');
    setMessages([]);

    const start = async () => {
      try {
        await ensureChat(conversationId, currentUid, userId);

        if (cancelled) {
          return;
        }

        unsubscribe = subscribeMessages(
          conversationId,
          currentUid,
          (data) => {
            if (!cancelled) {
              setMessages(data);
              setIsLoading(false);
            }
          },
          () => {
            if (!cancelled) {
              setChatError(
                'Không thể tải tin nhắn. Vui lòng kiểm tra kết nối và luật bảo mật Firebase.',
              );
              setIsLoading(false);
            }
          },
        );
      } catch {
        if (!cancelled) {
          setChatError(
            'Không thể kết nối cuộc trò chuyện. Vui lòng thử lại.',
          );
          setIsLoading(false);
        }
      }
    };

    start();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [conversationId, userId, currentUid]);

  // Mở cuộc trò chuyện -> đánh dấu đã đọc
  useEffect(() => {
    if (currentUid) {
      markConversationAsRead(conversationId);
    }
  }, [conversationId, currentUid, markConversationAsRead]);

  // Có tin mới từ người kia trong lúc đang mở chat -> tiếp tục đánh dấu đã đọc
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
  const lastMessageId = lastMessage?.id;
  const lastSenderId = lastMessage?.senderId;
  useEffect(() => {
    if (lastMessageId && currentUid && lastSenderId !== currentUid) {
      markConversationAsRead(conversationId);
    }
  }, [
    lastMessageId,
    lastSenderId,
    conversationId,
    currentUid,
    markConversationAsRead,
  ]);

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || !currentUser || isSending) {
      return;
    }

    setInputText('');
    setIsSending(true);

    try {
      await sendTextMessage(
        conversationId,
        currentUser.id,
        userId,
        trimmed,
      );
    } catch {
      setInputText(trimmed);
      Alert.alert(
        'Không gửi được tin nhắn',
        'Vui lòng kiểm tra kết nối mạng và thử lại.',
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleSendLocation = async () => {
    if (!currentUser || isSendingLocation) {
      return;
    }

    setIsSendingLocation(true);

    try {
      const granted = await requestLocationPermission();

      if (!granted) {
        Alert.alert(
          'Quyền vị trí bị từ chối',
          'Bạn cần cho phép truy cập vị trí để gửi vị trí hiện tại. Hãy bật quyền vị trí cho UDU Chat trong phần Cài đặt của thiết bị.',
        );
        return;
      }

      const coordinates = await getCurrentLocation();

      await sendLocationMessage(
        conversationId,
        currentUser.id,
        userId,
        coordinates.latitude,
        coordinates.longitude,
      );
    } catch {
      Alert.alert(
        'Không lấy được vị trí',
        'Không thể xác định vị trí hiện tại. Vui lòng bật GPS và thử lại.',
      );
    } finally {
      setIsSendingLocation(false);
    }
  };

  const openInGoogleMaps = (latitude: number, longitude: number) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Không mở được bản đồ', 'Thiết bị không thể mở Google Maps.');
    });
  };

  const isOnline = otherUser?.status === 'online';

  const renderMessageBubble = ({ item }: { item: Message }) => {
    const isMe = item.isMine;
    const hasLocation =
      item.type === 'location' &&
      typeof item.latitude === 'number' &&
      typeof item.longitude === 'number';

    return (
      <View
        style={[
          styles.messageRow,
          isMe ? styles.messageRowRight : styles.messageRowLeft,
        ]}
      >
        <View
          style={[
            styles.bubble,
            isMe ? styles.bubbleMine : styles.bubbleOther,
          ]}
        >
          {hasLocation ? (
            <TouchableOpacity
              style={[
                styles.locationCard,
                isMe ? styles.locationCardMine : styles.locationCardOther,
              ]}
              activeOpacity={0.75}
              onPress={() =>
                openInGoogleMaps(item.latitude as number, item.longitude as number)
              }
            >
              <Text style={styles.locationPin}>📍</Text>
              <View style={styles.locationInfo}>
                <Text
                  style={[
                    styles.locationTitle,
                    isMe ? styles.bubbleTextMine : styles.bubbleTextOther,
                  ]}
                >
                  Vị trí đã chia sẻ
                </Text>
                <Text
                  style={[
                    styles.locationCoords,
                    isMe ? styles.locationCoordsMine : styles.locationCoordsOther,
                  ]}
                >
                  {(item.latitude as number).toFixed(5)},{' '}
                  {(item.longitude as number).toFixed(5)}
                </Text>
                <Text
                  style={[
                    styles.locationHint,
                    isMe ? styles.locationHintMine : styles.locationHintOther,
                  ]}
                >
                  Nhấn để mở Google Maps
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <Text
              style={[
                styles.bubbleText,
                isMe ? styles.bubbleTextMine : styles.bubbleTextOther,
              ]}
            >
              {item.text}
            </Text>
          )}

          <Text
            style={[
              styles.timestamp,
              isMe ? styles.timestampMine : styles.timestampOther,
            ]}
          >
            {formatMessageTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />

      {/* Chat Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.headerBackText}>{'<'} Trở về</Text>
        </TouchableOpacity>

        <View style={styles.headerUserContainer}>
          <View style={styles.headerAvatarWrapper}>
            <UserAvatar size={40} />
          </View>
          <View style={styles.headerUserInfo}>
            <Text style={styles.headerUserName} numberOfLines={1}>
              {otherUser?.name || 'Đang tải...'}
            </Text>
            <View style={styles.headerStatusRow}>
              <View
                style={[
                  styles.statusDot,
                  isOnline ? styles.dotOnline : styles.dotOffline,
                ]}
              />
              <Text style={styles.headerStatusText}>
                {isOnline
                  ? 'Đang trực tuyến'
                  : otherUser?.lastSeen
                  ? `Hoạt động ${formatLastSeen(otherUser.lastSeen)}`
                  : 'Ngoại tuyến'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Message Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.chatArea}
      >
        {chatError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{chatError}</Text>
          </View>
        ) : null}

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessageBubble}
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
            ListEmptyComponent={
              <View style={styles.emptyMessages}>
                <Text style={styles.emptyMessagesText}>
                  Hãy gửi lời chào đến {otherUser?.name || 'người bạn này'}
                </Text>
              </View>
            }
          />
        )}

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={handleSendLocation}
            disabled={isSendingLocation || isSending || !currentUser}
            activeOpacity={0.7}
          >
            {isSendingLocation ? (
              <ActivityIndicator size="small" color="#2563eb" />
            ) : (
              <Text style={styles.locationButtonIcon}>📍</Text>
            )}
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Nhập nội dung tin nhắn..."
            placeholderTextColor="#94a3b8"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={Boolean(currentUser)}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isSending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isSending}
            activeOpacity={0.8}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.sendButtonText}>Gửi</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  headerBackBtn: {
    paddingVertical: 6,
    paddingRight: 12,
  },
  headerBackText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
  headerUserContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatarWrapper: {
    marginRight: 10,
  },
  headerUserInfo: {
    flex: 1,
  },
  headerUserName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  headerStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  dotOnline: {
    backgroundColor: '#22c55e',
  },
  dotOffline: {
    backgroundColor: '#94a3b8',
  },
  headerStatusText: {
    fontSize: 11.5,
    color: '#64748b',
  },
  chatArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    borderBottomWidth: 1,
    borderBottomColor: '#fecaca',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  errorBannerText: {
    color: '#b91c1c',
    fontSize: 12.5,
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748b',
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexGrow: 1,
  },
  messageRow: {
    marginBottom: 12,
    flexDirection: 'row',
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  messageRowLeft: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  bubbleMine: {
    backgroundColor: '#2563eb',
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  bubbleText: {
    fontSize: 14.5,
    lineHeight: 20,
  },
  bubbleTextMine: {
    color: '#ffffff',
  },
  bubbleTextOther: {
    color: '#1e293b',
  },
  timestamp: {
    fontSize: 10.5,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  timestampMine: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  timestampOther: {
    color: '#94a3b8',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    minWidth: 190,
  },
  locationCardMine: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  locationCardOther: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  locationPin: {
    fontSize: 24,
    marginRight: 10,
  },
  locationInfo: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  locationCoords: {
    fontSize: 11,
    marginBottom: 2,
  },
  locationCoordsMine: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  locationCoordsOther: {
    color: '#64748b',
  },
  locationHint: {
    fontSize: 10.5,
    fontWeight: '500',
  },
  locationHintMine: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  locationHintOther: {
    color: '#2563eb',
  },
  emptyMessages: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyMessagesText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  locationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  locationButtonIcon: {
    fontSize: 19,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: '#0f172a',
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
