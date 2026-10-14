import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { UserAvatar } from '../components/UserAvatar';
import { User, RootStackParamList } from '../types';

type ContactsNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ContactsScreen: React.FC = () => {
  const navigation = useNavigation<ContactsNavigationProp>();
  const { contacts, startOrGetConversation } = useApp();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'online'>('all');

  // Filter contacts by search query & online status filter
  const filteredContacts = useMemo(() => {
    let result = contacts;
    const query = searchQuery.trim().toLowerCase();

    if (query) {
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.phone.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
    }

    if (filterType === 'online') {
      result = result.filter((user) => user.status === 'online');
    }

    return result;
  }, [contacts, searchQuery, filterType]);

  const handleContactPress = (userId: string) => {
    const conversationId = startOrGetConversation(userId);
    if (conversationId) {
      navigation.navigate('ChatDetail', { conversationId });
    }
  };

  const renderContactItem = ({ item }: { item: User }) => {
    const isOnline = item.status === 'online';

    return (
      <TouchableOpacity
        style={styles.contactItem}
        activeOpacity={0.7}
        onPress={() => handleContactPress(item.id)}
      >
        {/* Avatar with Online Status Dot */}
        <View style={styles.avatarContainer}>
          <UserAvatar size={50} />
          <View
            style={[
              styles.statusIndicator,
              isOnline ? styles.statusOnline : styles.statusOffline,
            ]}
          />
        </View>

        {/* User Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.userPhone} numberOfLines={1}>
            {item.phone}
          </Text>
          <View style={styles.statusBadgeRow}>
            <View
              style={[
                styles.statusDotSmall,
                isOnline ? styles.bgOnline : styles.bgOffline,
              ]}
            />
            <Text
              style={[
                styles.statusLabel,
                isOnline ? styles.textOnline : styles.textOffline,
              ]}
            >
              {isOnline
                ? 'Đang trực tuyến'
                : item.lastSeen
                ? `Hoạt động ${item.lastSeen}`
                : 'Ngoại tuyến'}
            </Text>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.chatActionBtn}>
          <Text style={styles.chatActionText}>Nhắn tin</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const onlineCount = useMemo(
    () => contacts.filter((c) => c.status === 'online').length,
    [contacts]
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Danh bạ</Text>
          <Text style={styles.headerSubtitle}>
            {contacts.length} liên hệ • {onlineCount} đang online
          </Text>
        </View>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo tên hoặc số điện thoại..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearSearchButton}
            onPress={() => setSearchQuery('')}
          >
            <Text style={styles.clearSearchText}>Xóa</Text>
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
            Tất cả ({contacts.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filterType === 'online' && styles.filterTabActive,
          ]}
          onPress={() => setFilterType('online')}
        >
          <Text
            style={[
              styles.filterTabText,
              filterType === 'online' && styles.filterTabTextActive,
            ]}
          >
            Đang trực tuyến ({onlineCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contacts List */}
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={renderContactItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Không tìm thấy liên hệ nào</Text>
            <Text style={styles.emptySub}>
              {searchQuery
                ? `Không có người dùng nào khớp với "${searchQuery}"`
                : 'Chưa có người dùng nào trong danh bạ.'}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#0f172a',
  },
  clearSearchButton: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  clearSearchText: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
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
    paddingBottom: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2.5,
    borderColor: '#ffffff',
  },
  statusOnline: {
    backgroundColor: '#22c55e',
  },
  statusOffline: {
    backgroundColor: '#94a3b8',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 12.5,
    color: '#64748b',
    marginBottom: 4,
  },
  statusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  bgOnline: {
    backgroundColor: '#22c55e',
  },
  bgOffline: {
    backgroundColor: '#94a3b8',
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  textOnline: {
    color: '#16a34a',
  },
  textOffline: {
    color: '#64748b',
  },
  chatActionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  chatActionText: {
    fontSize: 12.5,
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
