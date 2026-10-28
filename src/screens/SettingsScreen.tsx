import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { UserAvatar } from '../components/UserAvatar';

export const SettingsScreen: React.FC = () => {
  const {
    currentUser,
    logout,
    notificationsEnabled,
    setNotificationsEnabled,
    onlineStatusVisible,
    setOnlineStatusVisible,
    soundEnabled,
    setSoundEnabled,
    vibrationEnabled,
    setVibrationEnabled,
  } = useApp();

  const handleLogoutPress = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => {
            logout().catch(() => {
              Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
            });
          },
        },
      ]
    );
  };

  if (!currentUser) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cài đặt</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatarWrapper}>
            <UserAvatar size={64} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{currentUser.name}</Text>
            <Text style={styles.profileEmail}>{currentUser.email}</Text>
            {currentUser.phone ? (
              <Text style={styles.profilePhone}>{currentUser.phone}</Text>
            ) : null}
          </View>
        </View>

        {/* System Settings Section (using Switch components) */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>TÙY CHỌN ỨNG DỤNG</Text>

          {/* Toggle: Online status */}
          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Trạng thái hoạt động</Text>
              <Text style={styles.settingDesc}>
                Cho phép người khác thấy khi bạn đang trực tuyến
              </Text>
            </View>
            <Switch
              value={onlineStatusVisible}
              onValueChange={setOnlineStatusVisible}
              trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
              thumbColor={onlineStatusVisible ? '#0084ff' : '#f8fafc'}
            />
          </View>

          {/* Toggle: Notifications */}
          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Thông báo đẩy</Text>
              <Text style={styles.settingDesc}>
                Nhận cảnh báo ngay khi có tin nhắn mới
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
              thumbColor={notificationsEnabled ? '#0084ff' : '#f8fafc'}
            />
          </View>

          {/* Toggle: Sound */}
          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Âm thanh tin nhắn</Text>
              <Text style={styles.settingDesc}>
                Phát âm thanh thông báo khi nhận tin nhắn
              </Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
              thumbColor={soundEnabled ? '#0084ff' : '#f8fafc'}
            />
          </View>

          {/* Toggle: Vibration */}
          <View style={[styles.settingRow, styles.lastRow]}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Rung khi có tin</Text>
              <Text style={styles.settingDesc}>
                Rung điện thoại khi có cuộc gọi hoặc tin nhắn
              </Text>
            </View>
            <Switch
              value={vibrationEnabled}
              onValueChange={setVibrationEnabled}
              trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
              thumbColor={vibrationEnabled ? '#0084ff' : '#f8fafc'}
            />
          </View>
        </View>

        {/* Security & Account info */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>TÀI KHOẢN & BẢO MẬT</Text>

          <TouchableOpacity style={styles.menuRow} activeOpacity={0.6}>
            <Text style={styles.menuTitle}>Thông tin cá nhân</Text>
            <Text style={styles.menuAction}>Xem</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuRow} activeOpacity={0.6}>
            <Text style={styles.menuTitle}>Đổi mật khẩu</Text>
            <Text style={styles.menuAction}>Cập nhật</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuRow, styles.lastRow]}
            activeOpacity={0.6}
          >
            <Text style={styles.menuTitle}>Quyền riêng tư & Dữ liệu</Text>
            <Text style={styles.menuAction}>Chi tiết</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Section */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={styles.logoutButton}
            activeOpacity={0.8}
            onPress={handleLogoutPress}
          >
            <Text style={styles.logoutButtonText}>Đăng xuất tài khoản</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>UDU Chat v1.0.0 (Build 2026)</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  profileAvatarWrapper: {
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 12.5,
    color: '#64748b',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  lastRow: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  settingTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 12,
    color: '#64748b',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
  },
  menuAction: {
    fontSize: 13,
    color: '#0084ff',
    fontWeight: '500',
  },
  logoutContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  logoutButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutButtonText: {
    color: '#dc2626',
    fontSize: 15,
    fontWeight: '600',
  },
  versionText: {
    marginTop: 16,
    fontSize: 12,
    color: '#94a3b8',
  },
});
