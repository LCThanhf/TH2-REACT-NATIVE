import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { NotificationItem } from '../types';

export const NotificationsScreen: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    unreadNotificationsCount,
  } = useApp();
  const [filterType, setFilterType] = useState<'all' | 'unread'>('all');

  const filteredNotifications = useMemo(() => {
    if (filterType === 'unread') {
      return notifications.filter((item) => !item.isRead);
    }
    return notifications;
  }, [notifications, filterType]);

  const renderNotificationItem = ({ item }: { item: NotificationItem }) => {
    const isUnread = !item.isRead;

    return (
      <TouchableOpacity
        style={[
          styles.notifItem,
          isUnread ? styles.notifItemUnread : styles.notifItemRead,
        ]}
        activeOpacity={0.7}
        onPress={() => markNotificationAsRead(item.id)}
      >
        {/* Unread indicator dot */}
        <View style={styles.indicatorContainer}>
          {isUnread ? (
            <View style={styles.unreadDot} />
          ) : (
            <View style={styles.readDot} />
          )}
        </View>

        {/* Content details */}
        <View style={styles.contentContainer}>
          <View style={styles.notifHeaderRow}>
            <Text
              style={[
                styles.notifTitle,
                isUnread && styles.notifTitleUnread,
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text style={styles.notifTime}>{item.time}</Text>
          </View>

          <Text
            style={[
              styles.notifMessage,
              isUnread && styles.notifMessageUnread,
            ]}
          >
            {item.content}
          </Text>

          {isUnread && (
            <View style={styles.markReadRow}>
              <TouchableOpacity
                onPress={() => markNotificationAsRead(item.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.markReadText}>Đánh dấu đã đọc</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Thông báo</Text>
          <Text style={styles.headerSubtitle}>
            {unreadNotificationsCount > 0
              ? `Bạn có ${unreadNotificationsCount} thông báo chưa đọc`
              : 'Đã đọc toàn bộ thông báo'}
          </Text>
        </View>

        {unreadNotificationsCount > 0 && (
          <TouchableOpacity
            style={styles.markAllBtn}
            onPress={markAllNotificationsAsRead}
            activeOpacity={0.7}
          >
            <Text style={styles.markAllText}>Đọc tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filterType === 'all' && styles.filterTabActive,
          ]}
          onPress={() => setFilterType('all')}
        >
          <Text
            style={[
              styles.filterTabText,
              filterType === 'all' && styles.filterTabTextActive,
            ]}
          >
            Tất cả ({notifications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filterType === 'unread' && styles.filterTabActive,
          ]}
          onPress={() => setFilterType('unread')}
        >
          <Text
            style={[
              styles.filterTabText,
              filterType === 'unread' && styles.filterTabTextActive,
            ]}
          >
            Chưa đọc ({unreadNotificationsCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications FlatList */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Không có thông báo nào</Text>
            <Text style={styles.emptySub}>
              {filterType === 'unread'
                ? 'Bạn đã xem hết tất cả thông báo.'
                : 'Hộp thư thông báo đang trống.'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  markAllBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  markAllText: {
    fontSize: 12.5,
    color: '#2563eb',
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  filterTab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  filterTabActive: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  filterTabText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 24,
  },
  notifItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  notifItemUnread: {
    backgroundColor: '#f8fafc',
  },
  notifItemRead: {
    backgroundColor: '#ffffff',
  },
  indicatorContainer: {
    width: 20,
    paddingTop: 4,
    alignItems: 'center',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff3b30',
  },
  readDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cbd5e1',
  },
  contentContainer: {
    flex: 1,
    marginLeft: 8,
  },
  notifHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 14.5,
    fontWeight: '500',
    color: '#334155',
    flex: 1,
    marginRight: 8,
  },
  notifTitleUnread: {
    fontWeight: '700',
    color: '#0f172a',
  },
  notifTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
  notifMessage: {
    fontSize: 13.5,
    color: '#64748b',
    lineHeight: 19,
  },
  notifMessageUnread: {
    color: '#334155',
  },
  markReadRow: {
    marginTop: 8,
    flexDirection: 'row',
  },
  markReadText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
  },
});
