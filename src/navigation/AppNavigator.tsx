import React from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MessageCircle, Users, Bell, Settings } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { RootStackParamList, MainTabParamList } from '../types';

import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ContactsScreen } from '../screens/ContactsScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ChatDetailScreen } from '../screens/ChatDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// --- Lucide Icons for Bottom Tabs ---

const ChatIcon = ({ color, focused }: { color: string; focused: boolean }) => (
  <MessageCircle size={22} color={color} strokeWidth={focused ? 2.5 : 1.8} />
);

const ContactsIcon = ({ color, focused }: { color: string; focused: boolean }) => (
  <Users size={22} color={color} strokeWidth={focused ? 2.5 : 1.8} />
);

const NotificationsIcon = ({ color, focused }: { color: string; focused: boolean }) => (
  <Bell size={22} color={color} strokeWidth={focused ? 2.5 : 1.8} />
);

const SettingsIcon = ({ color, focused }: { color: string; focused: boolean }) => (
  <Settings size={22} color={color} strokeWidth={focused ? 2.5 : 1.8} />
);

const MainTabNavigator = () => {
  const { unreadConversationsCount, unreadNotificationsCount } = useApp();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0084ff',
        tabBarInactiveTintColor: '#8e8e93',
        tabBarStyle: [
          styles.tabBar,
          {
            height: 60 + insets.bottom,
            paddingBottom: Math.max(insets.bottom, 8),
          },
        ],
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Tin nhắn',
          tabBarBadge:
            unreadConversationsCount > 0 ? unreadConversationsCount : undefined,
          tabBarBadgeStyle: styles.compactRedBadge,
          tabBarIcon: ChatIcon,
        }}
      />
      <Tab.Screen
        name="Contacts"
        component={ContactsScreen}
        options={{
          tabBarLabel: 'Danh bạ',
          tabBarIcon: ContactsIcon,
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Thông báo',
          tabBarBadge:
            unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
          tabBarBadgeStyle: styles.compactRedBadge,
          tabBarIcon: NotificationsIcon,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Cài đặt',
          tabBarIcon: SettingsIcon,
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const { isLoggedIn } = useApp();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ animation: 'fade' }}
          />
        ) : (
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabNavigator}
              options={{ animation: 'fade' }}
            />
            <Stack.Screen
              name="ChatDetail"
              component={ChatDetailScreen}
              options={{ animation: 'slide_from_right' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderBottomWidth: 0,
    borderTopColor: '#f1f5f9',
    paddingTop: 6,
  },
  tabBarLabel: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  compactRedBadge: {
    backgroundColor: '#ff3b30',
    color: '#ffffff',
    fontSize: 9,
    lineHeight: 12,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    fontWeight: '700',
  },
});
